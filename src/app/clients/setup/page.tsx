// app/client-setup/page.tsx
"use client";

import {
    View,
    Flex,
    Text,
    SelectField,
    Button,
    Card,
    Input,
    Heading,
    useTheme,
    TextAreaField,
    Label,
    Placeholder,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { automationsFields } from "@/fields";
import { AutomationCardType, FieldDefinition,  } from "@/types";
import { HelpPopup } from "@/components/HelpPopup";
import { generateClient } from "aws-amplify/data";
import { AutomationType } from "@/utils/amplify-utils";
import { AutomationsSchema } from "@/../amplify/data/resource";

const amplifyClient = generateClient<AutomationsSchema>();

const defaultPayload: AutomationType = {
    clientId: "",
    clientName: "",
    automationDetails: {
        id: "",
        fieldOptions: {},
        isScheduled: false,

        scheduleStartDate: (new Date()).toISOString().slice(0, 10) + "T00:00", // Today at 12am
        scheduleIntervalUnit: "days"
    },
}

export default function ClientSetupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const automationId: string | null = searchParams.get("id");

    const { tokens } = useTheme();

    const formRef = useRef<HTMLFormElement>(null)
    const [selectedAutomation, setSelectedAutomation] = useState<AutomationCardType | null>(null);

    const [isAutomationParametersOpen, setIsAutomationParametersOpen] = useState(true);
    const [isAutomationDetailsOpen, setIsAutomationDetailsOpen] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false)

    const [payload, setPayload] = useState<AutomationType>(defaultPayload);
    const [originalPayload, setOriginalPayload] = useState<AutomationType>(defaultPayload)

    const getAutomationById = (id: string): AutomationCardType | null => {
        return automationsFields.find((automation) => automation.id === id) || null;
    }
    
    const updateAutomationDetails = (key: string, value: string) => {
        setPayload(prev => ({ ...prev, automationDetails: { ...prev.automationDetails, fieldOptions: { ...prev.automationDetails.fieldOptions, [key]: value } }}))
    }

    // Converts data from amplify to a more usable JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processAmplifyData = (data: any): AutomationType => {
        return ({
            ...defaultPayload,
            ...data,
            automationDetails: {
                ...defaultPayload.automationDetails,
                ...data.automationDetails,

                fieldOptions: JSON.parse(data.automationDetails.fieldOptions as string) ?? defaultPayload.automationDetails.fieldOptions,
                scheduleStartDate: (data.automationDetails.scheduleStartDate && (new Date(data.automationDetails.scheduleStartDate)).toISOString().slice(0, 16)) ?? defaultPayload.automationDetails.scheduleStartDate,
                scheduleEndDate: (data.automationDetails.scheduleEndDate && (new Date(data.automationDetails.scheduleEndDate)).toISOString().slice(0, 16)) ?? defaultPayload.automationDetails.scheduleEndDate,
                scheduleInterval: data.automationDetails.scheduleInterval ? Number(data.automationDetails.scheduleInterval) : defaultPayload.automationDetails.scheduleInterval,
            },
        })
    }

    useEffect(() => {
        let raceCondition = true

        const fetchClients = async () => {
            try {            
                if (!automationId) { 
                    setLoading(false)
                    return
                }

                setLoading(true);

                const { data, errors } = await amplifyClient.models.Automation.get({ id: automationId });

                if (errors || !data) {
                    console.log("Error fetching data for given automation id")
                    return
                }

                const processed: AutomationType = processAmplifyData(data)

                if (raceCondition)
                {
                    setSelectedAutomation(getAutomationById(data.automationDetails.id))
                    setPayload(processed)
                    setOriginalPayload(processed)
                }
            } catch (error) {
                console.error("Error fetching automation:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients()

        return () => {
            raceCondition = false
        }
    }, [automationId]);

    // Ensure all the required fields aren't blank
    // If a field is blank, open the corresponding popup and report the validity
    // TODO is this consistent?
    const validateRequiredFields = () => {
        const fields = selectedAutomation?.fields
        if (!fields) return true

        for (let i = 0; i < fields.length; i++)
        {
            if ((fields[i].required == undefined || fields[i].required) && (payload.automationDetails.fieldOptions[fields[i].id] == null || payload.automationDetails.fieldOptions[fields[i].id] === "")) 
            {
                setIsAutomationParametersOpen(true)

                setTimeout(() => {
                    formRef.current?.reportValidity();
                }, 50);

                return false
            }
        }

        return true
    }

    // Processes payload in a format that can be sent to amplify backend
    const processPayloadForAmplify = (payload: AutomationType): AutomationType => {
        return ({
            ...payload,
            clientId: payload.clientId,
            automationDetails:
            {
                ...payload.automationDetails,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                fieldOptions: JSON.stringify(payload.automationDetails.fieldOptions) as any,
                
                scheduleStartDate: payload.automationDetails.scheduleStartDate ? (new Date(`${payload.automationDetails.scheduleStartDate}Z`)).toISOString() : undefined,
                scheduleEndDate: payload.automationDetails.scheduleEndDate ? (new Date(`${payload.automationDetails.scheduleEndDate}Z`)).toISOString() : undefined,
            }
        })
    }

    // Process payload in a format that can be sent to the next js backend (for n8n)
    const processPayloadForAPI = (payload: AutomationType) => {
        const payloadCopy: Partial<AutomationType["automationDetails"]> = {...payload.automationDetails}
        delete payloadCopy.fieldOptions
        
        return ({
            ...payloadCopy,
            ...payload.automationDetails.fieldOptions,

            scheduleStartDate: payload.automationDetails.scheduleStartDate ? (new Date(payload.automationDetails.scheduleStartDate)).toISOString() : undefined,
            scheduleEndDate: payload.automationDetails.scheduleEndDate ? (new Date(payload.automationDetails.scheduleEndDate)).toISOString() : undefined,
            automationId: automationId
        })
    }

    const handleSaveAutomation = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let isFormValid = formRef.current?.reportValidity();
        isFormValid = isFormValid && validateRequiredFields();
        if (!isFormValid) return

        setIsSaving(true)

        // If the automation ID is defined, then we are updating an automation, otherwise a new one is being made
        if (automationId) {
            console.log(payload, processPayloadForAmplify(payload))

            const { data, errors } = await amplifyClient.models.Automation.update({ ...processPayloadForAmplify(payload), id: automationId })

            if (errors) {
                console.log("Failed to update automation ", errors)
                setIsSaving(false)

                return
            }

            console.log("Success, ")
        } else {
            const { data, errors } = await amplifyClient.models.Automation.create(processPayloadForAmplify(payload))

            if (errors) {
                console.log("Failed to save automation ", errors)
                setIsSaving(false)

                return
            }
        
            console.log("Success, ")
        }

        setIsSaving(false)

        router.push("/clients")
    }

    const startAutomationSchedule = async () => {
        // Validation
        let isFormValid = formRef.current?.reportValidity()
        isFormValid = isFormValid && validateRequiredFields();

        if (!isFormValid || !automationId || !selectedAutomation) return

        if (payload.automationDetails.scheduleStartDate == null || payload.automationDetails.scheduleEndDate == null || payload.automationDetails.scheduleInterval == null || payload.automationDetails.scheduleIntervalUnit == null)
        {
            console.log(payload.automationDetails)
            setIsAutomationDetailsOpen(true)

            setTimeout(() => {
                formRef.current?.reportValidity();
            }, 50);

            return
        }

        try {
            const processedPayload = processPayloadForAPI(payload)
            const response = await fetch('/api/n8n/' + selectedAutomation.endpoint, {
              	method: 'POST',
              	headers: { 'Content-Type': 'application/json' },
              	body: JSON.stringify({ ...processedPayload, isScheduled: true }),
            });

            const json = await response.json();

            const checkResponse = () => {
                const code = json?.data?.code
                return response.ok && json?.success !== false && code != 404
            }

            return {
				success: checkResponse(),
				message: checkResponse() ? "Automation ran successfully." : json?.error || "Automation failed.",
				data: JSON.stringify(json, null, 2),
			}
        } catch (err) {
			return {
				success: false,
				message: err instanceof Error ? err.message : "Failed to communicate with server",
			}
        } finally {
        //   setLoading(false);
        }
    }

    const stopAutomationSchedule = () => {

    }

    // Checks if both parameters and automation details are filled out
    // Then updates payload, and just using the unedited payload, the isScheduled is updated in the backend
    const toggleAutomationSchedule = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let isFormValid = formRef.current?.reportValidity()
        isFormValid = isFormValid && validateRequiredFields();

        if (!isFormValid || !automationId || !selectedAutomation) return

        if (payload.automationDetails.scheduleStartDate == null || payload.automationDetails.scheduleEndDate == null || payload.automationDetails.scheduleInterval == null || payload.automationDetails.scheduleIntervalUnit == null)
        {
            console.log(payload.automationDetails)
            setIsAutomationDetailsOpen(true)

            setTimeout(() => {
                formRef.current?.reportValidity();
            }, 50);

            return
        }

        let originalIsScheduled: boolean = false

        setPayload(prev => {
            originalIsScheduled = prev.automationDetails.isScheduled
            return ({ ...prev, automationDetails: { ...prev.automationDetails, isScheduled: !prev.automationDetails.isScheduled } })
        })

        const processedPayload = processPayloadForAmplify(originalPayload)
        const { data, errors } = await amplifyClient.models.Automation.update({ ...processedPayload, id: automationId, automationDetails: { ...processedPayload.automationDetails, isScheduled: !originalIsScheduled } })

        if (errors || !data) {
            console.log("Failed to start schedule", errors)
            return
        }

        // Starting/Stopping schedule via n8n
        // setLoading(true);

        if (originalIsScheduled) // If originally scheduled, its no longer scheduled so stop
        {
            return 
        }

        try {
            const processedPayload = processPayloadForAPI(payload)
            const response = await fetch('/api/n8n/' + selectedAutomation.endpoint, {
              	method: 'POST',
              	headers: { 'Content-Type': 'application/json' },
              	body: JSON.stringify({ ...processedPayload, isScheduled: true }),
            });

            const json = await response.json();

            const checkResponse = () => {
                const code = json?.data?.code
                return response.ok && json?.success !== false && code != 404
            }

            return {
				success: checkResponse(),
				message: checkResponse() ? "Automation ran successfully." : json?.error || "Automation failed.",
				data: JSON.stringify(json, null, 2),
			}
        } catch (err) {
			return {
				success: false,
				message: err instanceof Error ? err.message : "Failed to communicate with server",
			}
        } finally {
        //   setLoading(false);
        }

    }

    const runAutomationOnce = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        let isFormValid = formRef.current?.reportValidity()
        isFormValid = isFormValid && validateRequiredFields();
        
        if (!isFormValid || !selectedAutomation) return

        // setLoading(true);

        try {
            const processedPayload = processPayloadForAPI(payload)
            const response = await fetch('/api/n8n/' + selectedAutomation.endpoint, {
              	method: 'POST',
              	headers: { 'Content-Type': 'application/json' },
              	body: JSON.stringify({ ...processedPayload, isScheduled: false }),
            });

            const json = await response.json();

            const checkResponse = () => {
                const code = json?.data?.code
                return response.ok && json?.success !== false && code != 404
            }

            return {
				success: checkResponse(),
				message: checkResponse() ? "Automation ran successfully." : json?.error || "Automation failed.",
				data: JSON.stringify(json, null, 2),
			}
        } catch (err) {
			return {
				success: false,
				message: err instanceof Error ? err.message : "Failed to communicate with server",
			}
        } finally {
        //   setLoading(false);
        }
    }

    const eraseAutomation = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!automationId) return;

        const { data, errors } = await amplifyClient.models.Automation.delete({id: automationId })

        if (errors)
        {
            console.log("Error deleting automation")
            return
        }

        router.push("/clients")
    }

    // Renders field for automation based on its type
    const renderFieldType = (field: FieldDefinition) => {
        switch (field.type)
        {
            case "text":
                return <Input
                    size="large"
                    backgroundColor="#fff"
                    onFocus={() => setFocusedField(field.id)}

                    required={field.required == undefined || field.required}
                    key={field.id}
                    placeholder={field.placeholder || field.label}
                    value={String(payload.automationDetails.fieldOptions[field.id] ?? "")}
                    onChange={(e) => updateAutomationDetails(field.id, e.target.value)}
                />
            case "textarea":
                return <TextAreaField
                    labelHidden
                    size="large"
                    label={field.label}
                    width="100%"
                    onFocus={() => setFocusedField(field.id)}
                    required={field.required == undefined || field.required}
                    key={field.id}
                    placeholder={field.placeholder || field.label}
                    value={String(payload.automationDetails.fieldOptions[field.id] ?? "")}
                    onChange={(e) => updateAutomationDetails(field.id, e.target.value)}
                />
            case "number":
                return <Input
                    size="large"
                    type="number"
                    onFocus={() => setFocusedField(field.id)}
                    required={field.required == undefined || field.required}
                    key={field.id}
                    placeholder={field.placeholder || field.label}
                    value={String(payload.automationDetails.fieldOptions[field.id] ?? "")}
                    onChange={(e) => updateAutomationDetails(field.id, e.target.value)}
                />
            case "boolean":
                return <SelectField
                    size="large"
                    width="100%"

                    label={field.label}
                    labelHidden={true}
                    onFocus={() => setFocusedField(field.id)}
                    required={field.required == undefined || field.required}
                    key={field.id}
                    placeholder={field.placeholder || field.label}
                    value={String(payload.automationDetails.fieldOptions[field.id] ?? "")}
                    onChange={(e) => updateAutomationDetails(field.id, e.target.value)}
                >
                    <option value="true">True</option>
                    <option value="false">False</option>
                </SelectField>
            case "dropdown":
                return <SelectField
                    size="large"
                    width="100%"

                    label={field.label}
                    labelHidden={true}
                    onFocus={() => setFocusedField(field.id)}
                    required={field.required == undefined || field.required}
                    key={field.id}
                    placeholder={field.placeholder || field.label}
                    value={String(payload.automationDetails.fieldOptions[field.id] ?? "")}
                    onChange={(e) => updateAutomationDetails(field.id, e.target.value)}
                >
                    {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            default:
                return null;
        }
    }

    return (
        <View
            backgroundColor="#f7f7f7"
            minHeight="100vh"
            width="100%"
            fontFamily="'Segoe UI', sans-serif"
        >
            {/* MAIN CONTENT */}
            <Flex justifyContent="center" padding="36px 24px">
                <View width="100%" maxWidth="980px">
                    {/* TITLE + BUTTON */}
                    <Flex justifyContent="space-between" alignItems="center">
                        <Heading level={1}>
                            Automation Setup
                        </Heading>

                        <Button
                            variation="link"
                            backgroundColor="#fff"
                            border={"1px solid " + tokens.colors.font.orange}
                            color={tokens.colors.font.orange}
                            borderRadius="4px"
                            padding="12px 24px"
                            fontWeight={500}
                            fontSize="16px"
                            onClick={() => router.push("/clients")}
                        >
                            BACK TO AUTOMATIONS
                        </Button>
                    </Flex>

                    {/* Loading State Placeholders */}
                    {loading && (
                        <Flex direction="column" gap="28px" marginTop="32px">
                            <Flex direction="column" gap="small">
                                <Placeholder height="20px" width="60px" />
                                <Placeholder height="44px" width="100%" borderRadius="4px" />
                            </Flex>
                            <Flex direction="column" gap="small">
                                <Placeholder height="20px" width="90px" />
                                <Placeholder height="44px" width="100%" borderRadius="4px" />
                            </Flex>
                            <Card padding="26px 24px" backgroundColor="#fff" border="1px solid #e5e7eb" borderRadius="2px">
                                <Flex justifyContent="space-between" alignItems="center">
                                    <Placeholder height="28px" width="150px" />
                                    <Placeholder height="24px" width="24px" borderRadius="50%" />
                                </Flex>
                            </Card>
                            <Flex direction="row" justifyContent="space-between">
                                <Placeholder height="40px" width="160px" borderRadius="4px" />
                                <Flex direction="row" gap="medium">
                                    <Placeholder height="40px" width="140px" borderRadius="4px" />
                                    <Placeholder height="40px" width="120px" borderRadius="4px" />
                                </Flex>
                            </Flex>
                        </Flex>
                    )}

                    {/* FORM */}
                    <View 
                        marginTop="32px"
                        as="form"
                        ref={formRef}
                        hidden={loading}
                    >
                        <Flex direction="column" gap="28px">
                            {/* Select Client */}
                            <Flex direction="column" gap="small">
                                <Label color="#7c7c7c" htmlFor="client">Client</Label>
                                <Input
                                    id="client"
                                    size="large"
                                    backgroundColor="none"
                                    required
                                    disabled={automationId !== null}
                                    value={payload.clientName ?? ""}
                                    onChange={(e) => setPayload(prev => ({ ...prev, clientName: e.target.value }))}
                                />
                            </Flex>

                            {/* Select Automation */}
                            <Flex direction="column" gap="small">
                                <Label color="#7c7c7c" htmlFor="automationSelection">Automation</Label>
                                <SelectField
                                    label="Automation"
                                    id="automationSelection"
                                    labelHidden
                                    required
                                    size="large"
                                    value={selectedAutomation?.id}
                                    onChange={(e) => { 
                                        setSelectedAutomation(getAutomationById(e.target.value)); 
                                        setPayload(prev => ({...prev, automationDetails: { ...prev.automationDetails, id: e.target.value } })); 
                                        setIsAutomationParametersOpen(true); 
                                    }}
                                >
                                    <option value=""></option>
                                    {automationsFields.map((automation) => (
                                        <option key={automation.id} value={automation.id}>
                                            {automation.title}
                                        </option>
                                    ))}
                                </SelectField>
                            </Flex>

                            {/* Automation Parameters Card */}
                            <Card
                                padding="0"
                                backgroundColor="#fff"
                                borderRadius="2px"
                                boxShadow="none"
                                border="1px solid #e5e7eb"
                            >
                                <Flex
                                    justifyContent="space-between"
                                    alignItems="center"
                                    padding="26px 24px"
                                    onClick={() => setIsAutomationParametersOpen(prev => !prev)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <Heading
                                        level={3}
                                        fontWeight={350}
                                    >
                                        Parameters
                                    </Heading>

                                    {isAutomationParametersOpen ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path transform="rotate(90 480 -480)" d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path transform="rotate(-90 480 -480)" d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
                                    )}
                                </Flex>

                                {isAutomationParametersOpen && (
                                    <View padding="0 20px 20px">
                                        <Text padding="0 0 20px 0" color="#7c7c7c">
                                            {selectedAutomation?.title || "Please select an automation"}
                                        </Text>

                                        <Flex direction="column" gap="16px">
                                            {selectedAutomation?.fields ? selectedAutomation?.fields.map((field) => (
                                                <Flex key={field.id} alignItems={"center"} width="100%" direction="row" style={{ transition: 'gap 0.3s ease-in-out' }}>
                                                    
                                                    <div style={{flex: 1, transition: 'width 0.3s'}}>{renderFieldType(field)}</div>
                                                    
                                                    <div
                                                        style={{
                                                            width: focusedField === field.id ? '32px' : '0px',
                                                            opacity: focusedField === field.id ? 1 : 0,
                                                            transition: 'width 0.3s ease-in-out, opacity 0.3s ease-in-out',
                                                        }}
                                                    >
                                                        <HelpPopup 
                                                            label={field.label} 
                                                            id={field.id} 
                                                            description={field.description || ""} 
                                                        />
                                                    </div>
                                                </Flex>
                                            )) : null}
                                        </Flex>
                                    </View>
                                )}
                            </Card>

                            {/* Scheduling */}
                            <Card
                                padding="0"
                                backgroundColor="#fff"
                                borderRadius="2px"
                                boxShadow="none"
                                border="1px solid #e5e7eb"
                            >
                                <Flex
                                    justifyContent="space-between"
                                    alignItems="center"
                                    padding="26px 24px"
                                    onClick={() => setIsAutomationDetailsOpen(prev => !prev)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <Heading
                                        level={3}
                                        fontWeight={350}
                                    >
                                        Automation Details
                                    </Heading>

                                    {isAutomationDetailsOpen ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path transform="rotate(90 480 -480)" d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path transform="rotate(-90 480 -480)" d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
                                    )}
                                </Flex>
                                {isAutomationDetailsOpen && (
                                    <Flex padding="0 20px 20px" direction="column" gap="16px">
                                        <Flex direction="column" gap="small">
                                            <Label color="#7c7c7c" htmlFor="automationStartDate">Start Date</Label>
                                            <Input
                                                type="datetime-local"
                                                id="automationStartDate"
                                                size="large"
                                                backgroundColor="none"
                                                required

                                                value={payload.automationDetails.scheduleStartDate ?? ""}
                                                onChange={(e) => setPayload(prev => ({ ...prev, automationDetails: { ...prev.automationDetails, scheduleStartDate: e.target.value } }))}
                                            />
                                        </Flex>

                                        <Flex direction="column" gap="small">
                                            <Label color="#7c7c7c" htmlFor="automationEndDate">End Date</Label>
                                            <Input
                                                type="datetime-local"
                                                id="automationEndDate"
                                                size="large"
                                                backgroundColor="none"
                                                required
                                                min={payload.automationDetails.scheduleStartDate ?? ""}
                                                value={payload.automationDetails.scheduleEndDate ?? ""}
                                                onChange={(e) => setPayload(prev => ({ ...prev, automationDetails: { ...prev.automationDetails, scheduleEndDate: e.target.value } }))}
                                            />
                                        </Flex>

                                        <Flex direction="column" gap="small">
                                            <Label color="#7c7c7c" htmlFor="interval">Interval</Label>
                                            <Flex >
                                                <Input
                                                    type="number"
                                                    id="interval"
                                                    size="large"
                                                    backgroundColor="none"
                                                    required

                                                    value={payload.automationDetails.scheduleInterval ?? ""}
                                                    onChange={(e) => setPayload(prev => ({ ...prev, automationDetails: { ...prev.automationDetails, scheduleInterval: Number(e.target.value) } }))}
                                                />
                                                <SelectField
                                                    label="intervalRange"
                                                    size="large"
                                                    width="max-content"
                                                    minWidth="max-content"
                                                    labelHidden

                                                    value={payload.automationDetails.scheduleIntervalUnit ?? ""}
                                                    onChange={(e) => setPayload(prev => ({ ...prev, automationDetails: { ...prev.automationDetails, scheduleIntervalUnit: e.target.value as AutomationType["automationDetails"]["scheduleIntervalUnit"] } }))}
                                                >
                                                    <option value='seconds'>Second{payload.automationDetails.scheduleInterval && payload.automationDetails.scheduleInterval > 1 && "s"}</option>
                                                    <option value="minutes">Minute{payload.automationDetails.scheduleInterval && payload.automationDetails.scheduleInterval > 1 && "s"}</option>
                                                    <option value='hours'>Hour{payload.automationDetails.scheduleInterval && payload.automationDetails.scheduleInterval > 1 && "s"}</option>
                                                    <option value='days'>Day{payload.automationDetails.scheduleInterval && payload.automationDetails.scheduleInterval > 1 && "s"}</option>
                                                </SelectField>
                                            </Flex>
                                        </Flex>
                                    </Flex>
                                )}
                            </Card>
                            
                            {/* Bottom buttons */}
                            <Flex direction="row" justifyContent="space-between">
                                <Flex direction="row">
                                    <Button
                                        width="fit-content"
                                        variation="primary"
                                        loadingText="Saving..."
                                        isLoading={isSaving}
                                        onClick={handleSaveAutomation}
                                    >
                                        SAVE AUTOMATION
                                    </Button>

                                    {automationId && <Button
                                        width="fit-content"
                                        colorTheme="error"
                                        onClick={() => setIsConfirmDeleteOpen(true)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
                                    </Button>}
                                </Flex>

                                
                                <Flex direction="row">
                                    <Button
                                        width="fit-content"
                                        variation="primary"
                                        onClick={toggleAutomationSchedule}
                                        disabled={selectedAutomation == null}
                                        type="submit"
                                    >
                                        {/* sorry */}
                                        <p className="mr-2">SCHEDUL{!payload.automationDetails.isScheduled && "E"}{automationId ? payload.automationDetails.isScheduled && "ED" : payload.automationDetails.isScheduled && "ING"}</p>
                                        <div className="w-8 h-8">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"
                                                fill={selectedAutomation == null ? "#89949F" : "white"}
                                                className={payload.automationDetails.isScheduled && automationId ? "animate-spin ease-linear [animation-duration:4s]" : ""}
                                            >
                                                <path d="M129.9 292.5C143.2 199.5 223.3 128 320 128C373 128 421 149.5 455.8 184.2C456 184.4 456.2 184.6 456.4 184.8L464 192L416.1 192C398.4 192 384.1 206.3 384.1 224C384.1 241.7 398.4 256 416.1 256L544.1 256C561.8 256 576.1 241.7 576.1 224L576.1 96C576.1 78.3 561.8 64 544.1 64C526.4 64 512.1 78.3 512.1 96L512.1 149.4L500.8 138.7C454.5 92.6 390.5 64 320 64C191 64 84.3 159.4 66.6 283.5C64.1 301 76.2 317.2 93.7 319.7C111.2 322.2 127.4 310 129.9 292.6zM573.4 356.5C575.9 339 563.7 322.8 546.3 320.3C528.9 317.8 512.6 330 510.1 347.4C496.8 440.4 416.7 511.9 320 511.9C267 511.9 219 490.4 184.2 455.7C184 455.5 183.8 455.3 183.6 455.1L176 447.9L223.9 447.9C241.6 447.9 255.9 433.6 255.9 415.9C255.9 398.2 241.6 383.9 223.9 383.9L96 384C87.5 384 79.3 387.4 73.3 393.5C67.3 399.6 63.9 407.7 64 416.3L65 543.3C65.1 561 79.6 575.2 97.3 575C115 574.8 129.2 560.4 129 542.7L128.6 491.2L139.3 501.3C185.6 547.4 249.5 576 320 576C449 576 555.7 480.6 573.4 356.5z"/>
                                            </svg>
                                        </div>
                                    </Button>

                                    <Button
                                        width="fit-content"
                                        variation="primary"
                                        onClick={runAutomationOnce}
                                        disabled={selectedAutomation == null}
                                    >
                                        RUN ONCE
                                    </Button>
                                </Flex>
                            </Flex>
                        </Flex>
                    </View>
                </View>
            </Flex>

            {/* Confirm Popup Modal */}
            {isConfirmDeleteOpen && (
                <Flex
                    position="fixed"
                    top="0"
                    left="0"
                    width="100vw"
                    height="100vh"
                    backgroundColor="rgba(0, 0, 0, 0.4)"
                    style={{ zIndex: 1000, backdropFilter: 'blur(2px)' }}
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                    onClick={() => setIsConfirmDeleteOpen(false)}
                >
                    <Card
                        backgroundColor="#fff"
                        padding="32px"
                        width="90%"
                        maxWidth="440px"
                        borderRadius="4px"
                        boxShadow="0px 4px 16px rgba(0, 0, 0, 0.12)"
                    >
                        <Flex direction="column" gap="20px">
                            <Heading level={4} fontWeight={600} color="#1f1f1f">
                                Delete Automation?
                            </Heading>

                            <Text color="#5c5c5c" fontSize="15px" lineHeight="1.5">
                                Are you sure you want to delete this automation?
                            </Text>

                            <Flex direction="row" gap="12px" marginTop="8px">
                                {/* Cancel Button */}
                                <Button
                                    variation="link"
                                    color="#5c5c5c"
                                    fontWeight={500}
                                    onClick={() => setIsConfirmDeleteOpen(false)}
                                >
                                    CANCEL
                                </Button>

                                {/* Confirm Delete Button */}
                                <Button
                                    backgroundColor="#dc2626"
                                    color="#fff"
                                    fontWeight={500}
                                    borderRadius="4px"
                                    padding="10px 20px"
                                    border="none"
                                    loadingText="DELETING..."
                                    onClick={eraseAutomation}
                                    style={{
                                        cursor: 'pointer'
                                    }}
                                >
                                    DELETE PERMANENTLY
                                </Button>
                            </Flex>
                        </Flex>
                    </Card>
                </Flex>
            )}
        </View>
    );
}
