import { Avatar } from "@/components/live/avatar";
import { HeartGlyph } from "@/components/live/icons";
import { type Language, liveStrings } from "@/data/live";
import type { CommentEntry, Tier } from "@/hooks/comments";

const CHIP_BACKGROUNDS: Record<Exclude<Tier, 0>, string> = {
    1: "bg-chip-1",
    2: "bg-chip-2",
    3: "bg-chip-3",
};

/**
 * Supporter badge: 1 to 3 small hearts on a colored tag, one heart per tier.
 *
 * @param tier - Supporter level, sets the number of hearts and the tag color
 * @param label - Accessible name of the badge, announced instead of the hearts
 */
function Chip({ tier, label }: { tier: Exclude<Tier, 0>; label: string }) {
    return (
        <span
            role="img"
            aria-label={label}
            className={`inline-flex h-4 flex-none items-center gap-0.5 rounded px-1 ${CHIP_BACKGROUNDS[tier]}`}
        >
            {Array.from({ length: tier }, (_, i) => (
                <HeartGlyph key={i} size={8} />
            ))}
        </span>
    );
}

interface Props {
    entry: CommentEntry;
    language: Language;
}

/**
 * Instagram live row: no bubble, name on the first line and the comment text below. Joins and badge purchases
 * have no body, so they fit on a single line after the name.
 *
 * @param entry - Comment, join or badge event to display, its tier above 0 adds a supporter chip
 * @param language - Language of the chip labels
 */
export function Comment({ entry, language }: Props) {
    const single = entry.type !== "comment";
    return (
        <div className="flex min-h-8 shrink-0 animate-comment-appear items-center gap-2.5">
            <Avatar username={entry.username} color={entry.avatarColor} url={entry.avatarImg} size={32} />
            <div className="flex min-w-0 flex-col text-sm leading-[18px] text-white text-shadow-live">
                <div className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate font-semibold">
                        {single ? `${entry.username} ${entry.text}` : entry.username}
                    </span>
                    {entry.tier > 0 && (
                        <Chip tier={entry.tier as Exclude<Tier, 0>} label={liveStrings(language).chips[entry.tier]} />
                    )}
                </div>
                {!single && <div className="wrap-anywhere">{entry.text}</div>}
            </div>
        </div>
    );
}
