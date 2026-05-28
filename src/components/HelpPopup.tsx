import { useState, useRef } from "react";

export const HelpPopup = ({ label, id, description, className }: { label: string, id: string, description?: string, className?: string }) => {
    const tooltipText = description || label;
    const [isRightAligned, setIsRightAligned] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseEnter = () => {
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        
        // If the button is within 300px (approx max width) of the right edge, shift left
        if (screenWidth - rect.left < 300) {
            setIsRightAligned(true);
        } else {
            setIsRightAligned(false);
        }
    };

    return (
        <div 
            ref={containerRef}
            onMouseEnter={handleMouseEnter}
            onFocus={handleMouseEnter}
            className={"group relative inline-flex shrink-0 " + className}
        >
            <button
                type="button"
                className="flex h-5 w-5 items-center justify-center z-100 rounded-full border border-zinc-300 bg-white text-[11px] font-medium text-zinc-500 transition-colors hover:border-zinc-400 hover:text-zinc-700"
                aria-label={`${label} help`}
                id={id}
            >
                ?
            </button>

            {/* Dynamically switches between left-0 and right-0 based on space */}
            <div className={`bg-[#fff] pointer-events-none absolute top-full z-200 mt-2 hidden 
                w-max max-w-[min(18rem,calc(100vw-2rem))] rounded-sm border border-zinc-200 px-2.5 py-2 
                text-left text-xs leading-5 text-zinc-600 shadow-sm whitespace-normal wrap-break-word group-hover:block group-focus-within:block
                ${isRightAligned ? 'right-0' : 'left-0'}`}
            >
                {id && <p className="font-large text-zinc-400 mb-1">{id}</p>}
                {tooltipText}
            </div>
        </div>
    );
};