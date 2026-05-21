// id is the key passed to the payload
export interface FieldDefinition {
    id: string,
    label: string,
    type: "text" | "textarea" | "number" | "boolean" | "dropdown",
    default?: string | number,
    required?: boolean,
    placeholder?: string,
    description?: string,
    options?: {
        label: string,
        value: string
    }[]
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