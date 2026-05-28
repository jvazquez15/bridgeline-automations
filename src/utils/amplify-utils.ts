// src/utils/amplify-server-utils.ts
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import outputs from '@/../amplify_outputs.json';
import { AutomationsSchema } from "@/../amplify/data/resource";

// for proxy
export const { runWithAmplifyServerContext } = createServerRunner({
    config: outputs
});

// Modified type derived from the amplify schema for Automation
// fieldOptions is .json type which is weird with ts, so converted it to { [fieldId: string]: string }
// Omitted id, createdAt, and updatedAt since those shouldn't be touched
type BaseAutomation = AutomationsSchema["Automation"]["type"];
type BaseDetails = BaseAutomation["automationDetails"];

export type AutomationType = 
    Omit<BaseAutomation, "automationDetails" | "id" | "createdAt" | "updatedAt"> & 
    {
        automationDetails: Omit<BaseDetails, "fieldOptions"> & {
            fieldOptions: { [fieldId: string]: string };
        };
    };