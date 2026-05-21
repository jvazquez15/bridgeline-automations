"use client";

import React, { useState } from "react";
import AutomationCard from "@/components/AutomationCard";
import Modal from "@/components/Modal";
import Settings from "@/components/Settings";
import { AutomationCardType } from "@/types";
import { automationsFields } from "@/fields";
import { AutomationForm } from "@/components/AutomationForm";
import Image from "next/image";

export default function Home() {
	const [openAutomationForm, setAutomationForm] = useState<AutomationCardType | null>(null);
	const [openSettings, setOpenSettings] = useState(false);

	// const [mounted, setMounted] = useState(false);

  	// For hydration issues
  	// useEffect(() => {
  	//   	// eslint-disable-next-line react-hooks/set-state-in-effect
  	//   	setMounted(true);
  	// }, []);

  	// if (!mounted) {
  	//   	return <div className="w-full min-h-screen flex flex-1 items-start justify-center bg-zinc-50 font-sans text-zinc-900" />;
  	// }
	
	const handleOpenModule = (automation: AutomationCardType) => {
		setAutomationForm(automation);
	}
	
	const handleCloseModule = () => {
		setAutomationForm(null);
	}
	
	return (
		<div className="bg-zinc-50 w-full min-h-screen flex flex-1 items-start justify-center font-sans text-zinc-900">
			<div className="flex h-full w-full flex-col gap-6 p-8 max-w-5xl">
				<header className="flex items-center justify-between">
					{/* <Image src="/Hawksearch_Logo.gif" alt="Hawksearch Logo" width={100} height={32} /> */}
					<h1 className="text-gradient-3-newhomehero text-2xl font-semibold">Hawksearch Automations</h1>
					<div className="flex items-center gap-3">
						<button className="cursor-pointer rounded bg-zinc-100 px-3 py-2 text-sm" onClick={() => setOpenSettings(true)}>Settings</button>
					</div>
				</header>

				{/* Different Automations */}
				<section>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						{automationsFields.map((automation) => 
							<AutomationCard key={automation.id} automation={automation} onOpen={handleOpenModule} />
						)}
					</div>
				</section>
				
				{/* Popup */}
				<Modal open={!!openAutomationForm} onClose={handleCloseModule} title={openAutomationForm?.title}>
					<AutomationForm automation={openAutomationForm} />
				</Modal>

				<Settings open={openSettings} onClose={() => setOpenSettings(false)} />
			</div>
		</div>
	);
}

