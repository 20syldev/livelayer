import { Avatar } from "@/components/live/avatar";
import { LiveBadge } from "@/components/live/badge";
import { CaretIcon, CloseIcon } from "@/components/live/icons";
import { ViewerCount } from "@/components/live/viewers";
import { type Language, liveStrings } from "@/data/live";

interface Props {
    username: string;
    avatarUrl: string | null;
    avatarColor: string;
    viewerCount: number;
    language: Language;
    onClose: () => void;
    onTap: () => void;
}

/**
 * Top bar of the live: host identity on the left, LIVE tag, viewer count and close button on the right.
 * The close button keeps a 44px touch target and cancels its extra size with negative margins.
 *
 * @param username - Host name shown next to the avatar
 * @param avatarUrl - Host photo URL, null to show the colored initial
 * @param avatarColor - CSS color of the initial disc when there is no photo
 * @param viewerCount - Current number of viewers shown in the pill
 * @param language - Language of the tag, the count and the close label
 * @param onClose - Called when the close button is pressed
 * @param onTap - Called when the host name is tapped, the live counts these taps to trigger a quick exit
 */
export function TopBar({ username, avatarUrl, avatarColor, viewerCount, language, onClose, onTap }: Props) {
    return (
        <div className="absolute left-3 right-3 top-3 z-[3] flex h-[34px] items-center justify-between gap-3">
            <button
                type="button"
                onClick={onTap}
                className="flex min-w-0 touch-manipulation select-none items-center gap-[9px] text-white outline-none tap-transparent"
            >
                <Avatar username={username} color={avatarColor} url={avatarUrl} size={34} />
                <span className="truncate text-[15px] font-semibold leading-5 tracking-[-0.1px] text-shadow-live">
                    {username}
                </span>
                <CaretIcon className="-ml-[3px]" />
            </button>

            <div className="flex flex-none items-center gap-1.5">
                <LiveBadge language={language} />
                <ViewerCount count={viewerCount} language={language} />
                <button
                    type="button"
                    onClick={onClose}
                    aria-label={liveStrings(language).close}
                    aria-haspopup="dialog"
                    className="-my-[5px] -ml-[5px] -mr-[11px] flex h-11 w-11 flex-none items-center justify-center tap-transparent"
                >
                    <CloseIcon />
                </button>
            </div>
        </div>
    );
}
