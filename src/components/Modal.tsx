"use client";
import React from "react";

export default function Modal({ children, open, onClose, title }: {
	children: React.ReactNode;
	open: boolean;
	onClose: () => void;
	title?: string;
}) {
	if (!open) return null;
	
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="relative w-full max-w-xl max-h-5/6 overflow-y-auto
							rounded bg-white p-6 shadow-lg">
				{title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
				
				{children}

				<div className="mt-4 text-right">
					<button
						className="rounded bg-zinc-100 px-3 py-1 text-sm hover:bg-zinc-200 cursor-pointer"
						onClick={onClose}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
