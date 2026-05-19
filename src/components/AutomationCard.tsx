"use client";
import { AutomationCardType } from "@/types";
import React from "react";

// Basic card displaying information on automation, opens automation form on click
export default function AutomationCard({ automation, onOpen }: { 
	automation: AutomationCardType, 
	onOpen: (automation: AutomationCardType) => void 
}) {
	return (
		<button
			suppressHydrationWarning
			onClick={() => onOpen(automation)}
			className="cursor-pointer flex h-full min-h-32 w-full flex-col justify-between wrap-anywhere
					rounded border border-zinc-200 bg-white p-4 text-left shadow-sm hover:shadow-md"
		>
			<div>
				<h4 className="text-lg font-semibold">{automation.title}</h4>
				{automation.description && <p className="mt-2 text-sm text-zinc-600">{automation.description}</p>}
			</div>
		</button>
	);
}
