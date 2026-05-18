"use client";

import React from "react";
import Modal from "./Modal";
import { settingsFields } from "@/fields";
import { useAutomationsContext } from "@/providers/Provider";
import { HelpPopup } from "./HelpPopup";

export default function SettingsPanel({ open, onClose }: { 
	open: boolean,
	onClose: () => void
}) {
	const { settings, updateSettingsByField } = useAutomationsContext()

	return (
		<Modal open={open} onClose={onClose} title="Settings">
			<div className="space-y-3">
				{settingsFields.map(field => (
					<div key={field.id}>
						<label className="inline text-md text-zinc-700 pr-2">{field.label}</label>
						<HelpPopup label={field.label} description={field.description || field.placeholder} />
						<div className="pt-2">
							<input className="w-full rounded border px-3 py-2" value={String(settings[field.id] ?? "")} onChange={(e) => updateSettingsByField(field.id, e.target.value)} placeholder={field.placeholder} />
						</div>
					</div>
				))}

				{/* <div className="flex justify-end">
					<button className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700" onClick={() => { onClose(); }}>
						Save
					</button>
				</div> */}
			</div>
		</Modal>
	);
}
