# Bridgeline Automations

Bridgeline Automations is a Next.js app for launching small automation workflows from a lightweight dashboard. Each automation is represented as a card, and opening a card launches a form modal where the user can review fields, edit JSON directly, and submit the payload to a matching n8n endpoint.

## What The App Does

The app is organized around a simple flow:

1. The dashboard loads a list of automations from `src/fields.ts`.
2. Clicking a card opens `AutomationForm` in a modal.
3. The form renders fields based on the automation.
4. When the user runs the automation, the payload is posted to the automation-specific API route under `src/app/api/n8n/...`.
5. The API route forwards the request to the matching n8n webhook URL from environment variables.
