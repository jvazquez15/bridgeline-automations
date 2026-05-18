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
	const [payload, setPayload] = useState<PayloadType>({});

	// In order to reflect changes in settings
	const displayPayload = {...payload}
	if (automation?.fields) {
		automation.fields.forEach(field => {
			displayPayload[field.id] = payload[field.id] ?? settings[field.id] ?? field.default ?? "";		
		});
	}

	const [jsonError, setJsonError] = useState<string | null>(null);
	const [showJsonPayload, setShowJsonPayload] = useState(false);

	if (!automation) return null;

	const handleFieldChange = (fieldName: string, value: PayloadType["key"]) => {
		setPayload(prev => ({ ...prev, [fieldName]: value }));
		setJsonError(null);
	};

	const handleJsonChange = (jsonString: string) => {
		try {
			const parsed = JSON.parse(jsonString);
			setPayload(parsed as PayloadType);
			setJsonError(null);
		} catch (e) {
			setJsonError((e as Error).message);
		}
	};

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
				return (
					<div className="rounded border border-zinc-200 bg-zinc-50 p-3">
						<div className="flex items-center gap-2">
							<label className="text-md font-medium text-zinc-700">
                                <input
							    	type="checkbox"
							    	checked={Boolean(displayPayload[field.id])}
							    	onChange={(e) => handleFieldChange(field.id, e.target.checked)}
							    />
                                <p className="inline pl-2 text-md font-medium text-zinc-700">{field.placeholder || field.label}</p>
                            </label>

							<HelpPopup label={field.label} description={field.description || field.placeholder} />
						</div>
					</div>
				)
            default:
                return null;
		}
	}

    const runAutomation = async () => {
        setLoading(true);
        // setResult(null);

        try {
          const response = await fetch('/api/n8n/' + automation.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const json = await response.json();
          console.log(json)
        //   setResult(json);
        } catch (err) {
            console.log(err)
        //   setResult({ success: false, error: 'Failed to communicate with server' });
        } finally {
          setLoading(false);
        }
    }
	
	return (
		<div className="space-y-4">
			<p className="text-md text-zinc-600">{automation.description}</p>
			
			{/* Dynamic Fields */}
			{automation.fields && automation.fields.length > 0 && (
				<div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4">
					{automation.fields.map(field => (
						<div key={field.id}>
							{field.type != "boolean" && (
								<div className="mb-1 flex items-center gap-2">
									<label className="block text-md font-medium text-zinc-700">{field.label}</label>
									<HelpPopup label={field.label} description={field.description || field.placeholder} />
								</div>
							)}

							{renderFieldType(field)}
						</div>
					))}
				</div>
			)}

			<div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
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
							value={JSON.stringify(displayPayload, null, 2)}
							onChange={(e) => handleJsonChange(e.target.value)}
						/>
						{jsonError && <p className="mt-1 text-xs text-red-500">Invalid JSON: {jsonError}</p>}
					</div>
				)}
			</div>

			<div className="flex justify-end gap-2">
				<button 
                    className="cursor-pointer rounded bg-blue-600 px-3 py-1 text-md text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={loading}
                    onClick={() => runAutomation()}
                >
					{loading ? "Running..." : "Run Automation"}
				</button>
			</div>
		</div>
	);
}
