export const HelpPopup = ({ label, description }: { label: string; description?: string }) => {
    const tooltipText = description || label;

    return (
        <div className="group relative inline-flex shrink-0">
            <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 bg-white text-[11px] font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
                aria-label={`${label} help`}
            >
                ?
            </button>
            <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 hidden w-max max-w-[min(18rem,calc(100vw-4rem))] rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-left text-xs leading-5 text-zinc-600 shadow-sm whitespace-normal wrap-break-word group-hover:block group-focus-within:block">
                {tooltipText}
            </div>
        </div>
    );
};