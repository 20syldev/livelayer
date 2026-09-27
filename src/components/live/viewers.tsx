import { EyeIcon } from "@/components/live/icons";
import { type Language, liveStrings } from "@/data/live";
import { formatCount } from "@/lib/format";

/**
 * Translucent grey pill with an eye and the viewer count, announced as a whole to screen readers.
 *
 * @param count - Current number of viewers, abbreviated by formatCount (e.g. 1.2k)
 * @param language - Language of the abbreviation and of the accessible label
 */
export function ViewerCount({ count, language }: { count: number; language: Language }) {
    const label = formatCount(count, language);
    return (
        <span
            role="img"
            aria-label={liveStrings(language).viewers(label)}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-chip-viewers px-[7px] py-[3px] text-[13px] font-semibold leading-[22px] tabular-nums text-white"
        >
            <EyeIcon />
            {label}
        </span>
    );
}
