# Bridgeline Automations

Bridgeline Automations is a Next.js app for launching small automation workflows from a lightweight dashboard. Each automation is represented as a card, and opening a card launches a form modal where the user can review fields, edit JSON directly, and submit the payload to a matching n8n endpoint.

## What The App Does

The app is organized around a simple flow:

1. The dashboard loads a list of automations from `src/fields.ts`.
2. Clicking a card opens `AutomationForm` in a modal.
3. The form renders fields based on the automation.
4. When the user runs the automation, the payload is posted to the automation-specific API route under `src/app/api/n8n/...`.
5. The API route forwards the request to the matching n8n webhook URL from environment variables.

## Automations Information

### Track Searches and Suggest Synonyms

> **Keywords with poor results** n8n automation. Analyzes searches with poor results and sends an email recommending improved synonym pairings.

1. Given an `email` (main recipient of recommendations), `syncGuid`, and `apiKey`, automation requests a list of poor results from the Hawksearch API.
2. It then iteratively passes this list to an AI which generates a list of synonyms for each keyword.
    - Sometimes this is disconnected for testing **Remember to disconnect the `Stored AI Data` node and connect the `Establish Synonyms` AI section.**
3. An internal email is then sent with a formatted list of keywords and synonyms for approval.
    - If not approved, automation is terminated.
4. Upon approval the formatted list is sent to the external `email` who can then further approve the changes.
    - If not approved, they can request better recommendations which is sent to another AI. New changes are then sent back to the internal email for approval before returning to `email`
5. Should the pairings be approved, the synonyms are automatically grouped and passed to the Hawksearch API.

### CSV to Index

> **CSV to Index Tool** n8n automation. Given a CSV, items are index based on either a custom field mapping or an automatically generated one.

1. Given an `apiKey`, `syncGuid`, `BulkItemLimit`, `CustomFieldMapping`, `GenerateCustomFieldMapping`?, `BatchSize`, `DeleteOlder`?, and `UseCurrentIndex`? (those with ? are booleans), the current index is fetched.
2. If `useCurrentIndex` is false, then the past indices are fetched, a new one is created. If there already 2 or more past indices, then if `DeleteOlder` is true, then the oldest is deleted, other wise the newest gets deleted.
3. Values that are too be indexed are inside a CSV in google sheets. This CSV gets fetched by n8n (**Sheets to be fetched is manually inputted in n8n, and not controlled by the site**).
4. The fields are then fetched from the Hawksearch API.
5. If `GenerateCustomFieldMapping` is true, the fields present in the CSV are passed through an AI for comparison in order to properly map them (fields in the CSV might not match the fields from the API, so the AI finds the similar fields and maps them for indexing).
    - Sometimes this is disconnected for testing **Remember to disconnect the `Stored AI Data` node and connect the `Generate Field Mappings` AI section.**
6. The items are then indexed in batches so that at most `BulkItemLimit` number of items is indexed at a time.
7. During each batch, everything is then properly formatted for the indexing, using either the AI generated mappings (if `GenerateCustomFieldMapping` is true) or the manually inputted mappings of `CustomFieldMapping` (if `GenerateCustomFieldMapping` is false).
8. Indices are then passed to the Hawksearch API, if there is an error, a message is sent to Slack, but the automation doesn't stop, and the next batch is processed.

> **This is WIP**, `Loop over batches` seems to be broken (probably replace with `BatchSize` if its defined, otherwise use num items / `BulkItemLimit`). User needs to be able to define CSV from site. Slack recipient needs to also be defined from site, or replaced with a server response if possible.

### Setup for Developing

1. Create a `.env` file in root and fill in the following:

```.env
N8N_SYNONYMS_URL=[URL to Keywords with poor results n8n webhook]
N8N_CSV2INDEX_URL=[URL to CSV to Index n8n webhook]
```

### TODO

- Switch to slack (requires slack asking user for approval -> not implemented)
- Use Next JS and ___ (for UI)
- Replicate analytics page in terms of UI (clients each can make/setup their own automations so there's a rolling list of automations)
- Login page?
- Ability to schedule automations
- Zod validation
