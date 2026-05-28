// Object representing a field of an automation parameter
export interface FieldDefinition {
    id: string, // id is the key passed to the payload of the automation
    label: string,
    type: "text" | "textarea" | "number" | "boolean" | "dropdown",
    default?: string | number,
    required?: boolean, // Makes sure that empty string and null/undefined types aren't allowed as parameters
    placeholder?: string,
    description?: string,
    options?: {
        label: string,
        value: string
    }[]
}

// Type representing the details of an automation
export interface AutomationCardType {
    id: string,
    title: string,
    endpoint: `${string}`,
    isSchedulingSetup: boolean,
    description?: string,
    fields?: FieldDefinition[],
}

export interface PayloadType
{
    [key: FieldDefinition["id"]]: string | number | boolean
}

export interface AutomationsContextType
{
    settings: PayloadType,
    resetSettings: () => void,
    updateSettingsByField: (id: string, value: PayloadType["key"]) => void
}