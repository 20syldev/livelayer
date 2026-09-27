import { type Language, liveStrings } from "@/data/live";

/**
 * Pink gradient "LIVE" tag of the top bar, worded in the live language.
 *
 * @param language - Language of the word shown on the tag
 */
export function LiveBadge({ language }: { language: Language }) {
    return (
        <span className="inline-flex items-center whitespace-nowrap rounded bg-live-badge px-1.5 py-[3px] text-xs font-bold uppercase leading-[22px] tracking-[0.4px] text-white">
            {liveStrings(language).live}
        </span>
    );
}
