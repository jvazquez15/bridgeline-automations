import { AutomationCardType, FieldDefinition } from '@/types';

// Input fields for different automations
// id represents the values fetched in n8n (key in the body of the request)
// label is the visual name shown to users
// type is the type of field shown in the UI (text, textarea, number, boolean)
// default is the default value for the field
// placeholder is the placeholder shown in the input field
// description is the text shown in the help popup (if not provided, placeholder is used)
// critical is a boolean representing whether the field requires user input (user cannot just use default value)

export const automationsFields: AutomationCardType[] = [
    { 
        id: "synonyms", 
        title: "Track Searches and Suggest Synonyms", 
        description: "Tracks searches with poor results and suggests synonyms",
        fields: [
            { id: "apiKey", label: "HawkSearch API Key", type: "text", placeholder: "Enter X-HawkSearch-ApiKey", description: "API key for Hawksearch." },
            { id: "syncGuid", label: "syncGuid", type: "text", placeholder: "Client GUID / Tracking Key", description: "Client GUID / Tracking Key in Engine Info" },
            // { id: "email", label: "Email", type: "text", placeholder: "Email", description: "Email address for recipient of suggestions" }
            { id: "recipientSlackID", label: "Recipient Slack ID", type: "text", placeholder: "Slack ID", description: "Slack ID for recipient of suggestions" },
            { id: "internalSlackID", label: "Internal Slack ID", type: "text", placeholder: "Slack ID", description: "Slack ID for internal notifications" },
            { id: "environment", label: "Environment", type: "dropdown", options: [{ label: "Development", value: "development" }, { label: "Test", value: "test" }, { label: "Production", value: "production" }], default: "development", description: "The environment for the automation" },
        ],
        endpoint: "synonyms"
    },
    { 
        id: "CSV2Index", 
        title: "CSV to Index", 
        description: "Index Values from a CSV",
        fields: [
            { id: "apiKey", label: "HawkSearch API Key", type: "text", required: true, placeholder: "Enter X-HawkSearch-ApiKey", description: "API Key for Hawksearch." },
            // Labeled ClientGuid in n8n (but syncGuid is fetched)
            { id: "syncGuid", label: "syncGuid", type: "text", placeholder: "Client GUID / Tracking Key", description: "Client GUID / Tracking Key in Engine Info" },
            { id: "BulkItemLimit", label: "Bulk Item Limit", type: "number", default: 125, placeholder: "Bulk Item Limit", description: "Bulk Indexing Limit (default 125)" },
            { id: "UseCurrentIndex", label: "Use Current Index?", type: "boolean", description: "Whether to use the current index (true) or generate a new one (false)" },
            { id: "DeleteOlder", label: "Delete Older?", type: "boolean", description: "Whether to delete the older index (true) or the newer index (false) (UseCurrentIndex must be false to use)" },
            { id: "BatchSize", label: "Batch Size", type: "number", default: 50, placeholder: "Batch Size", description: "The size of each batch" },
            { id: "GenerateCustomFieldMapping", label: "Generate Custom Field Mapping?", type: "boolean", description: "Whether to generate custom field mapping instead of using a manually inputed mappping." },
            { id: "CustomFieldMapping", label: "Custom Field Mapping", type: "textarea", placeholder: "JSON for Custom Field Mapping", description: "Custom field mapping for indexing (GenerateCustomFieldMapping must be false to use)." }
        ],
        endpoint: "CSV2Index"
    },
    { id: "m4", title: "Test", description: "Quick Test", fields: [{ id: "noteTitle", label: "Title", type: "text", placeholder: "Note title", description: "A short title for the note." }, { id: "noteContent", label: "Content", type: "textarea", placeholder: "Write your note here", description: "The body or main content of the note." }],  endpoint: "synonyms" },
    { id: "m5", title: "Test", description: "Quick Test", fields: [{ id: "noteTitle", label: "Title", type: "text", placeholder: "Note title", description: "A short title for the note." }, { id: "noteContent", label: "Content", type: "textarea", placeholder: "Write your note here", description: "The body or main content of the note." }],  endpoint: "synonyms" },
    { id: "m6", title: "Test", description: "Quick Test", fields: [{ id: "noteTitle", label: "Title", type: "text", placeholder: "Note title", description: "A short title for the note." }, { id: "noteContent", label: "Content", type: "textarea", placeholder: "Write your note here", description: "The body or main content of the note." }],  endpoint: "synonyms" },
    { id: "m7", title: "Test", description: "Quick Test", fields: [{ id: "noteTitle", label: "Title", type: "text", placeholder: "Note title", description: "A short title for the note." }, { id: "noteContent", label: "Content", type: "textarea", placeholder: "Write your note here", description: "The body or main content of the note." }],  endpoint: "synonyms" },
    { id: "m8", title: "Test", description: "Quick Test", fields: [{ id: "noteTitle", label: "Title", type: "text", placeholder: "Note title", description: "A short title for the note." }, { id: "noteContent", label: "Content", type: "textarea", placeholder: "Write your note here", description: "The body or main content of the note." }],  endpoint: "synonyms" },
    { id: "m9", title: "Test", description: "Quick Test", fields: [{ id: "noteTitle", label: "Title", type: "text", placeholder: "Note title", description: "A short title for the note." }, { id: "noteContent", label: "Content", type: "textarea", placeholder: "Write your note here", description: "The body or main content of the note." }],  endpoint: "synonyms" },
    { id: "m10", title: "Test", description: "Testing", fields: [{ id: "noteTitle", label: "Title", type: "text", placeholder: "Note title", description: "A short title for the note." }, { id: "noteContent", label: "Content", type: "textarea", placeholder: "Write your note here", description: "The body or main content of the note." }], endpoint: "synonyms" },
    { id: "m11", title: "Test", description: "Testing", fields: [{ id: "noteTitle", label: "Title", type: "text", placeholder: "Note title", description: "A short title for the note." }, { id: "noteContent", label: "Content", type: "textarea", placeholder: "Write your note here", description: "The body or main content of the note." }], endpoint: "synonyms" },
    { id: "m12", title: "Test", description: "Testing", fields: [{ id: "noteTitle", label: "Title", type: "text", placeholder: "Note title", description: "A short title for the note." }, { id: "noteContent", label: "Content", type: "textarea", placeholder: "Write your note here", description: "The body or main content of the note." }], endpoint: "synonyms" },
    { id: "m13", title: "Test", description: "Testing", fields: [{ id: "noteTitle", label: "Title", type: "text", placeholder: "Note title", description: "A short title for the note." }, { id: "noteContent", label: "Content", type: "textarea", placeholder: "Write your note here", description: "The body or main content of the note." }], endpoint: "synonyms" },
];

export const settingsFields: FieldDefinition[] = [
    { id: "apiKey", label: "Hawksearch API Key", placeholder: "Enter X-HawkSearch-ApiKey", type: "text", description: "API Key for Hawksearch." },
    { id: "syncGuid", label: "syncGuid", type: "text", placeholder: "Client GUID / Tracking Key", description: "Client GUID / Tracking Key in Engine Info" },
    { id: "recipientSlackID", label: "Recipient Slack ID", type: "text", placeholder: "Slack ID", description: "Slack ID for recipient of suggestions" },
    { id: "internalSlackID", label: "Internal Slack ID", type: "text", placeholder: "Slack ID", description: "Slack ID for internal notifications" }
]
