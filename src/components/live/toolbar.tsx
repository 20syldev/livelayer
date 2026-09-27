"use client";

import { useEffect, useRef, useState } from "react";

import { DotsIcon, HeartIcon, QuestionIcon, ShareIcon } from "@/components/live/icons";
import { type Language, liveStrings } from "@/data/live";
import { cn } from "@/lib/utils";

const ICON_BUTTON = "flex h-11 w-11 items-center justify-center";

/**
 * "Buy a badge" strip at the bottom of the video card: a hairline, then the invitation and its frosted button.
 *
 * @param username - Host name inserted in the invitation text
 * @param language - Language of the invitation and of the button label
 */
export function BadgeBar({ username, language }: { username: string; language: Language }) {
    const t = liveStrings(language);
    return (
        <div className="absolute bottom-3 left-3 right-3 z-[2]">
            <div aria-hidden="true" className="h-px bg-white/[0.28]" />
            <div className="mt-[11px] flex h-[30px] items-center gap-2.5">
                <span className="min-w-0 flex-1 truncate text-sm leading-[18px] tracking-[-0.1px] text-white text-shadow-live">
                    {t.badgeBar(username)}
                </span>
                <button
                    type="button"
                    className="h-[30px] flex-none whitespace-nowrap rounded-full bg-white/30 px-3.5 text-sm font-semibold text-white backdrop-blur-md"
                >
                    {t.buy}
                </button>
            </div>
        </div>
    );
}

interface Props {
    language: Language;
    onSend: (text: string) => void;
    onShare: () => void;
    onLike: () => void;
    decorative?: boolean;
}

/**
 * Black bar under the video card: comment field, questions, share and like. The like heart stays red once
 * tapped, and every tap still sends a heart with a short pop.
 *
 * @param language - Language of the placeholder and of the button labels
 * @param onSend - Called with the trimmed text when a non-empty comment is submitted
 * @param onShare - Called when the paper plane is pressed
 * @param onLike - Called on every tap of the heart, not only the first one
 * @param decorative - Makes the questions and share buttons inert, for the non-interactive landing demo
 */
export function Toolbar({ language, onSend, onShare, onLike, decorative = false }: Props) {
    const t = liveStrings(language);
    const [text, setText] = useState("");
    const [liked, setLiked] = useState(false);
    const [pop, setPop] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasText = text.trim().length > 0;

    useEffect(
        () => () => {
            if (popTimerRef.current) clearTimeout(popTimerRef.current);
        },
        [],
    );

    const close = () => {
        setText("");
        inputRef.current?.blur();
    };

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (hasText) onSend(text.trim());
        close();
    };

    const handleLike = () => {
        onLike();
        setLiked(true);
        setPop(true);
        if (popTimerRef.current) clearTimeout(popTimerRef.current);
        popTimerRef.current = setTimeout(() => setPop(false), 150);
    };

    return (
        <div className="flex flex-none items-start gap-[9px] bg-black pb-[calc(10px+env(safe-area-inset-bottom,0px))] pl-3.5 pr-2 pt-3">
            <form onSubmit={handleSubmit} className="relative h-11 min-w-0 flex-1">
                <input
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") close();
                    }}
                    placeholder={t.comment}
                    aria-label={t.commentLabel}
                    enterKeyHint="send"
                    autoComplete="off"
                    className={cn(
                        "h-11 w-full appearance-none rounded-full border border-white/35 bg-transparent pl-[15px] text-sm text-white caret-white outline-none placeholder:text-white/65",
                        hasText ? "pr-[88px]" : "pr-[38px]",
                    )}
                />
                {hasText ? (
                    <button
                        type="submit"
                        className="absolute right-1.5 top-1 h-9 px-2.5 text-sm font-semibold text-live-link"
                    >
                        {t.post}
                    </button>
                ) : (
                    <button
                        type="button"
                        aria-label={t.more}
                        onClick={() => inputRef.current?.focus()}
                        className="absolute right-1 top-1 flex h-9 w-[34px] items-center justify-center"
                    >
                        <DotsIcon />
                    </button>
                )}
            </form>

            <div className="flex flex-none items-center">
                <button type="button" aria-label={t.questions} inert={decorative} className={ICON_BUTTON}>
                    <QuestionIcon />
                </button>
                <button type="button" aria-label={t.share} onClick={onShare} inert={decorative} className={ICON_BUTTON}>
                    <ShareIcon />
                </button>
                <button
                    type="button"
                    aria-label={t.like}
                    aria-pressed={liked}
                    onClick={handleLike}
                    className={cn(
                        ICON_BUTTON,
                        "transition-transform duration-150 ease-[ease]",
                        pop ? "scale-120" : "scale-100",
                    )}
                >
                    <HeartIcon filled={liked} />
                </button>
            </div>
        </div>
    );
}
