"use client";

import { useAutomationsContext } from "@/providers/Provider";
import { AutomationCardType, FieldDefinition, PayloadType } from "@/types";
import { useState } from "react";
import { HelpPopup } from "./HelpPopup";

export const AutomationForm = ({ automation }: { 
	automation: AutomationCardType | null,
}) => {
	const { settings } = useAutomationsContext()

	const [loading, setLoading] = useState(false);

	// JSON Payload -> auto updates when payload changes
	// stops updating when user manually changes JSON payload
	// user can then choose to update payload based on JSON
	const [jsonPayload, setJsonPayload] = useState<string>("{}")
	const [isJsonPayloadChanged, setIsJsonPayloadChanged] = useState(false)
	const [showJsonPayload, setShowJsonPayload] = useState(false);
	const [jsonError, setJsonError] = useState<string | null>(null);

	// Actual payload used for API request
	const [displayPayload, setPayload] = useState<PayloadType>(() => {
		const initialPayload: PayloadType = {};

		if (automation?.fields) {
			automation.fields.forEach(field => {
				initialPayload[field.id] = settings[field.id] ?? field.default ?? ""
			});
		}

		setJsonPayload(JSON.stringify(initialPayload, null, 2))
		return initialPayload;
	});

	const [lastRunResult, setLastRunResult] = useState<{
		success: boolean;
		message: string;
		data?: string;
	} | null>(null);

	// In order to reflect changes in settings
	// When either payload or settings change, display payload is updated
	// (merges payload and settings)
	// const displayPayload = {...payload}
	// if (automation?.fields) { // filling in fields based on payload, then settings, then default
	// 	automation.fields.forEach(field => {
	// 		displayPayload[field.id] = payload[field.id] ?? settings[field.id] ?? field.default ?? "";	
	// 	});
	// }

	if (!automation) return null;

	const automationFieldsMap = new Map<string, FieldDefinition>(automation?.fields ? automation?.fields.map(f => [f.id, f]) : [])

	const validatePayload = (parsed: Record<string, unknown>): { valid: boolean; message?: string } => {
		const fields = Object.keys(parsed)

		for (let i = 0; i < fields.length; i++)
		{
			if (!automationFieldsMap.has(fields[i]))
			{
				return { valid: false, message: "Mismatched fields" };
			} else if (automationFieldsMap.get(fields[i])?.type === "boolean" &&  /^(true|false)$/i.test(String(parsed[fields[i]])) == false) {
				return { valid: false, message: "Boolean fields must be set to either true or false" }
			} else if (automationFieldsMap.get(fields[i])?.type === "number" && isNaN(Number(parsed[fields[i]]))) {
				return { valid: false, message: "Number fields must be valid numbers" }
			} else if (automationFieldsMap.get(fields[i])?.type === "dropdown" && automationFieldsMap.get(fields[i])?.options?.find(option => option.value === parsed[fields[i]]) == null) {
				return { valid: false, message: "Dropdown fields must be set to one of the available options" }
			}
		}

		return { valid:  true };
	}

	// Updates payload, and JSON payload (if it hasn't been manually changed by the user or changes have been merged)
	const handleFieldChange = (fieldName: string, value: PayloadType["key"]) => {
		setPayload(prev => {
			const newPayload = { ...prev, [fieldName]: value }
			
			if (!isJsonPayloadChanged) {
				setJsonPayload(JSON.stringify(newPayload, null, 2))
			}

			return newPayload
		});

		setJsonError(null);
	};

	// Updates JsonPayload and checks for errors in JSON
	const handleJsonChange = (jsonString: string) => {
		setIsJsonPayloadChanged(true)
		setJsonPayload(jsonString)

		try {
			JSON.parse(jsonString || "{}");
			setJsonError(null);
		} catch (e) {
			setJsonError("Invalid JSON: " + (e as Error).message);
		}
	};

	// Updates payload based on JSON
	// If there is an error with the JSOn or the fields in the JSOn don't
	// match the automation fields, and error message is set and payload isn't updated
	const updatePayloadBasedOnJSON = () => {
		if (jsonError != null) return false

		try {
			const parsed = JSON.parse(jsonPayload || "{}");

			const validation = validatePayload(parsed)
			if (validation.valid == false)
			{
				setJsonError("Could not update: " + validation.message)
				return
			}

			// Updating payload (if a field isn't mentioned in JSON, it isn't updated)
			setPayload(payload => ({
				...payload,
				...(parsed as PayloadType)
			}));

			setIsJsonPayloadChanged(false)
			setJsonError(null);
		} catch (e) {
			setJsonError("Could not update, invalid JSON: " + (e as Error).message);
		}
	}

	// Runs automation via API (payload is used, not JSON payload)
    const runAutomation = async () => {
        setLoading(true);

        try {
			const validation = validatePayload(displayPayload)
			if (validation.valid == false)
			{
				setLastRunResult({
					success: false,
					message: "Invalid payload: " + validation.message,
				});

				return;
			}

            const response = await fetch('/api/n8n/' + automation.endpoint, {
              	method: 'POST',
              	headers: { 'Content-Type': 'application/json' },
              	body: JSON.stringify(displayPayload),
            });

            const json = await response.json();

            const checkResponse = () => {
                const code = json?.data?.code
                return response.ok && json?.success !== false && code != 404
            }

            setLastRunResult({
				success: checkResponse(),
				message: checkResponse() ? "Automation ran successfully." : json?.error || "Automation failed.",
				data: JSON.stringify(json, null, 2),
			});
        } catch (err) {
			setLastRunResult({
				success: false,
				message: err instanceof Error ? err.message : "Failed to communicate with server",
			});
        } finally {
          setLoading(false);
        }
    }

	
	// Renders the appropriate input field based on the field type
	const renderFieldType = (field: FieldDefinition) => {
		switch (field.type)
		{
            case "text":
				return <input
					type={field.type}
					className="w-full rounded border px-3 py-2 text-md"
					value={String(displayPayload[field.id] ?? "")}
					onChange={(e) => handleFieldChange(field.id, e.target.value)}
					placeholder={field.placeholder}
					required={field.required}
				/>
			case "textarea":
				return <textarea
					className="w-full rounded border px-3 py-2 text-md"
					value={String(displayPayload[field.id] ?? "")}
					onChange={(e) => handleFieldChange(field.id, e.target.value)}
					placeholder={field.placeholder}
				/>
            case "number":
				return <input
					type="number"
					className="w-full rounded border px-3 py-2 text-md"
					value={String(displayPayload[field.id] ?? "")}
					onChange={(e) => handleFieldChange(field.id, e.target.value === "" ? "" : Number(e.target.value))}
					placeholder={field.placeholder}
					required={field.required}
				/>
            case "boolean":
				return <div className="relative inline-block">
					<select
						className="appearance-none rounded border border-divider px-3 py-2 text-md pr-6"
						value={String(displayPayload[field.id] ?? "false")}
						onChange={(e) => handleFieldChange(field.id, e.target.value == "true")}
					>
						<option disabled value={""}>Select an Option</option>

						<option value="true">True</option>
						<option value="false">False</option>
					</select>

					<div className="pointer-events-none absolute inset-y-0 right-1 flex items-center z-100">
  						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  						</svg>
  					</div>
				</div>
			case "dropdown":
				return <div className="relative inline-block">
					<select
						className="appearance-none rounded border border-divider px-3 py-2 text-md pr-6"
						value={String(displayPayload[field.id] ?? field.default)}
						onChange={(e) => handleFieldChange(field.id, e.target.value)}
					>
						<option disabled value={""}>Select an Option</option>

						{field.options?.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>

					<div className="pointer-events-none absolute inset-y-0 right-1 flex items-center z-100">
  						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  						</svg>
  					</div>
				</div>
            default:
                return null;
		}
	}

	
	return (
		<div className="space-y-4">
			<p className="text-md text-zinc-600">{automation.description}</p>
			
			{/* Dynamic Fields */}
			{automation.fields && automation.fields.length > 0 && (
				<div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
					{/* Field Labels */}
					{automation.fields.map(field => (
						<div key={field.id}>
							{/* Field Label (boolean fields mustn't have one) */}
							<div className="mb-1 flex items-center gap-2">
								<label 
									className={`block text-md font-medium 
									${field.type === "boolean" && /^(true|false)$/i.test(String(displayPayload[field.id])) == false 
										|| field.type === "dropdown" && automationFieldsMap.get(field.id)?.options?.find(option => option.value === displayPayload[field.id]) == null
									? "text-red-500" : "text-zinc-700"}`}>{field.label}</label>
								<HelpPopup label={field.label} description={field.description || field.placeholder} id={field.id} />
							</div>

							{renderFieldType(field)}
						</div>
					))}
				</div>
			)}

			{/* Technical info, normally hidden */}
			<div className={`rounded-lg border bg-zinc-50 p-4 ${lastRunResult ?(lastRunResult?.success ? "border-emerald-400 bg-emerald-50" : "border-rose-400 bg-rose-50"): "border-zinc-200" }`}>
				<div className="flex items-center justify-between gap-3">
					<div>
						<label 
                            className="cursor-pointer block rounded bg-zinc-100 px-3 py-1 text-md hover:bg-zinc-200"
                            onClick={() => setShowJsonPayload((current) => !current)}
                        >
                            Request Info
                        </label>
					</div>
				</div>

				{showJsonPayload && (
					<div className="mt-3">
                        <p className="text-md pb-2 text-zinc-700 rounded bg-white p-2 mb-2 border-zinc-200">Endpoint: {'/api/n8n/' + automation.endpoint}</p>
						<textarea
							className={`w-full rounded px-3 py-2 text-sm font-mono max-h-48 min-h-28 bg-white ${jsonError ? "border-red-500" : ""}`}
							value={jsonPayload}
							onChange={(e) => handleJsonChange(e.target.value)}
						/>
						{jsonError && <p className="mt-1 text-xs text-red-500">{jsonError}</p>}

						<div className="text-sm mt-2 mb-4">
							<label 
                    	        className="cursor-pointer rounded bg-zinc-100 px-3 py-1 text-md hover:bg-zinc-200"
                    	        onClick={() => updatePayloadBasedOnJSON()}
                    	    >
                    	        Update Payload
                    	    </label>
						</div>
						
                        {lastRunResult && (
					        <div
					        	className={`mt-3 rounded-lg border p-3 text-sm ${lastRunResult.success ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}
					        >
					        	<p className="font-medium">Last Run Result</p>
					        	<p className="mt-1">{lastRunResult.message}</p>
					        	{lastRunResult.data && (
					        		<pre className="mt-2 overflow-auto rounded bg-white/70 p-2 text-xs text-zinc-700">
					        			{lastRunResult.data}
					        		</pre>
					        	)}
					        </div>
				        )}
					</div>
				)}
			</div>
			
			<div className="flex justify-end gap-2">
				<button 
                    className="cursor-pointer rounded bg-orange-400 px-3 py-1 text-md text-white hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                    onClick={() => runAutomation()}
                >
					{loading ? "Running..." : "Run Automation"}
				</button>
			</div>
		</div>
	);
}
