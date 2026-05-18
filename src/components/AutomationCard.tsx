"use client";
import { AutomationCardType } from "@/types";
import React from "react";

export default function ModuleCard({ module, onOpen }: { 
	module: AutomationCardType, 
	onOpen: (automation: AutomationCardType) => void 
}) {
	return (
		<button
			suppressHydrationWarning
			onClick={() => onOpen(module)}
			className="cursor-pointer flex h-full min-h-32 w-full flex-col justify-between wrap-anywhere
					rounded border border-zinc-200 bg-white p-4 text-left shadow-sm hover:shadow-md"
		>
			<div>
				<h4 className="text-lg font-semibold">{module.title}</h4>
				{module.description && <p className="mt-2 text-sm text-zinc-600">{module.description}</p>}
			</div>
		</button>
	);
}
