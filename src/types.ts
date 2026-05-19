// id is the key passed to the payload
export interface FieldDefinition {
    id: string,
    label: string,
    type: "text" | "textarea" | "number" | "boolean",
    default?: string | number,
    required?: boolean,
    placeholder?: string,
    description?: string,
    critical?: boolean
}

export interface AutomationCardType {
    id: string,
    title: string,
    endpoint: `${string}`
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