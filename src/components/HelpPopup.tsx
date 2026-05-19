// Popup with a question mark icon that shows a tooltip with a description when hovered
// Id is displayed on top, with description on bottom
export const HelpPopup = ({ label, id, description }: { label: string, id: string, description?: string }) => {
    const tooltipText = description || label;

    return (
        <div className="group relative inline-flex shrink-0">
            <button
                type="button"
                className="flex h-5 w-5 items-center justify-center z-100 rounded-full border border-zinc-300 bg-white text-[11px] font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
                aria-label={`${label} help`}
                id={id}
            >
                ?
            </button>
            <div className="pointer-events-none absolute left-0 top-full z-200 mt-2 hidden w-max max-w-[min(18rem,calc(100vw-4rem))] rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-left text-xs leading-5 text-zinc-600 shadow-sm whitespace-normal wrap-break-word group-hover:block group-focus-within:block">
                {id && <p className="font-medium text-zinc-400 mb-1">{id}</p>}
                {tooltipText}
            </div>
        </div>
    );
};