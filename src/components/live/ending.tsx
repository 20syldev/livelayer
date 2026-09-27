"use client";

import { useState } from "react";

import { Avatar } from "@/components/live/avatar";
import { CheckIcon } from "@/components/live/icons";
import { type Language, liveStrings } from "@/data/live";
import { formatCount, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ConfirmProps {
    language: Language;
    onEnd: () => void;
    onCancel: () => void;
}

/**
 * iOS-style alert shown over the still running live when the host taps the close button. Native alerts show no
 * focus ring, so a light highlight keeps keyboard focus visible. Escape cancels, and Cancel takes the focus.
 *
 * @param language - Language of the title, message and buttons
 * @param onEnd - Called when the destructive action is chosen, the live then ends
 * @param onCancel - Called by the cancel button and by Escape, the live goes on
 */
export function EndConfirm({ language, onEnd, onCancel }: ConfirmProps) {
    const t = liveStrings(language).confirm;
    const action =
        "h-12 w-full border-t border-white/10 px-4 text-[15px] leading-5 outline-none focus-visible:bg-white/[0.08]";

    return (
        <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 duration-200 animate-in fade-in motion-reduce:animate-none"
            onKeyDown={(e) => {
                if (e.key === "Escape") onCancel();
            }}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="live-end-title"
                aria-describedby="live-end-message"
                className="w-[270px] overflow-hidden rounded-[14px] bg-live-dialog text-center duration-200 animate-in fade-in zoom-in-108 motion-reduce:animate-none"
            >
                <div className="px-4 pb-5 pt-[22px]">
                    <h2
                        id="live-end-title"
                        className="text-[15px] font-semibold leading-5 tracking-[-0.1px] text-white"
                    >
                        {t.title}
                    </h2>
                    <p id="live-end-message" className="mt-1.5 text-[13px] leading-[18px] text-white/70">
                        {t.message}
                    </p>
                </div>
                <button type="button" onClick={onEnd} className={`${action} font-semibold text-live-alert`}>
                    {t.end}
                </button>
                <button type="button" onClick={onCancel} autoFocus className={`${action} text-white`}>
                    {t.cancel}
                </button>
            </div>
        </div>
    );
}

interface ScreenProps {
    username: string;
    avatarUrl: string | null;
    avatarColor: string;
    language: Language;
    elapsed: number;
    peakViewers: number;
    totalComments: number;
    onDone: () => void;
}

/**
 * Instagram's "live ended" summary with duration, peak viewers and comment count. It replaces the live once
 * it is over, and the share button only acknowledges the tap.
 *
 * @param username - Host name shown under the title
 * @param avatarUrl - Host photo URL, null to show the colored initial
 * @param avatarColor - CSS color of the initial disc when there is no photo
 * @param language - Language of the labels and of the abbreviated counts
 * @param elapsed - Live duration in seconds
 * @param peakViewers - Highest viewer count reached during the live
 * @param totalComments - Number of comments received during the live
 * @param onDone - Called by the Done button, the app leaves the live
 */
export function EndScreen({
    username,
    avatarUrl,
    avatarColor,
    language,
    elapsed,
    peakViewers,
    totalComments,
    onDone,
}: ScreenProps) {
    const t = liveStrings(language).ended;
    const [shared, setShared] = useState(false);
    const stats = [
        { label: t.duration, value: formatDuration(elapsed) },
        { label: t.viewers, value: formatCount(peakViewers, language) },
        { label: t.comments, value: formatCount(totalComments, language) },
    ];

    return (
        <section
            aria-labelledby="live-ended-title"
            className="absolute inset-0 flex flex-col bg-black px-6 pb-[max(20px,env(safe-area-inset-bottom,0px))] pt-[env(safe-area-inset-top,0px)] text-white"
        >
            <div className="mx-auto flex min-h-0 w-full max-w-sm flex-1 flex-col items-center justify-center pb-2 text-center duration-300 animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
                <div className="rounded-full ring-1 ring-white/[0.12]">
                    <Avatar username={username} color={avatarColor} url={avatarUrl} size={88} />
                </div>
                <h1 id="live-ended-title" className="mt-4 text-[17px] font-semibold leading-[22px] tracking-[-0.2px]">
                    {t.title}
                </h1>
                <p className="mt-1 text-sm leading-[18px] text-white/60">{username}</p>
                <dl className="mt-8 grid w-full grid-cols-3">
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            className={cn(
                                "flex flex-col-reverse items-center gap-0.5 py-1",
                                i > 0 && "border-l border-white/[0.12]",
                            )}
                        >
                            <dt className="text-xs leading-4 text-white/60">{s.label}</dt>
                            <dd className="text-[17px] font-semibold leading-[22px] tabular-nums">{s.value}</dd>
                        </div>
                    ))}
                </dl>
            </div>

            <div className="mx-auto flex w-full max-w-sm flex-none flex-col gap-2 delay-75 duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-both motion-reduce:animate-none">
                <button
                    type="button"
                    aria-pressed={shared}
                    onClick={() => setShared(true)}
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-white/40 px-4 text-sm font-semibold"
                >
                    {shared && <CheckIcon />}
                    <span>{shared ? t.shared : t.share}</span>
                </button>
                <button
                    type="button"
                    onClick={onDone}
                    className="h-11 w-full rounded-lg bg-live-blue px-4 text-sm font-semibold"
                >
                    {t.done}
                </button>
                <p className="mt-1.5 text-center text-xs leading-4 text-white/60">{t.caption}</p>
            </div>
        </section>
    );
}
