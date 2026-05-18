import { AutomationCardType, FieldDefinition } from '@/types';

export const automationsFields: AutomationCardType[] = [
    { 
        id: "synonyms", 
        title: "Track Searches and Suggest Synonyms", 
        description: "Tracks searches with poor results and suggests synonyms",
        fields: [
            { id: "email", label: "Email", type: "text", placeholder: "Email", description: "Email address for recipient of suggestions" },
            { id: "syncGuid", label: "syncGuid", type: "text", placeholder: "syncGuid", description: "The sync GUID" },
            { id: "X-HawkSearch-ApiKey", label: "X-HawkSearch-ApiKey", type: "text", placeholder: "Enter X-HawkSearch-ApiKey", description: "API key for Hawksearch." },
        ],
        endpoint: "synonyms"
    },
    { 
        id: "CSV2Index", 
        title: "CSV to Index", 
        description: "Index Values from a CSV",
        fields: [
            { id: "APIKey", label: "API Key", type: "text", required: true, placeholder: "API Key", description: "API Key" },
            { id: "ClientGuid", label: "ClientGuid", type: "text", placeholder: "ClientGuid", description: "Client GUID=" },
            { id: "BulkItemLimit", label: "Bulk Item Limit", type: "number", default: 125, placeholder: "Bulk Item Limit", description: "Bulk Item Limit" },
            { id: "UseCurrentIndex", label: "Use Current Index?", type: "boolean", description: "" },
            { id: "DeleteOlder", label: "Delete Older?", type: "boolean", description: "" },
            { id: "BatchSize", label: "Batch Size", type: "number", default: 50, placeholder: "Batch Size", description: "" },
            { id: "CustomFieldMapping", label: "Custom Field Mapping", type: "textarea", placeholder: "WIP (will be JSON)", description: "" },
            { id: "GenerateCustomFieldMapping", label: "Generate Custom Field Mapping?", type: "boolean", description: "" },
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
    { id: "X-HawkSearch-ApiKey", label: "Hawksearch API Key", placeholder: "Hawksearch API Key", type: "text", description: "API key shared with automations that need HawkSearch access." }
]
