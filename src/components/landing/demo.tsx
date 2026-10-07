"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { Feed } from "@/components/live/feed";
import { Hearts } from "@/components/live/hearts";
import { BadgeBar, Toolbar } from "@/components/live/toolbar";
import { TopBar } from "@/components/live/topbar";
import { AVATAR_COUNT, avatarColor as colorFor } from "@/data/colors";
import { USERNAMES } from "@/data/usernames";
import type { CommentType, Tier } from "@/hooks/comments";
import type { HeartEntry } from "@/hooks/hearts";
import { useInView } from "@/hooks/inview";
import { useLanguage } from "@/hooks/language";
import { useReducedMotion } from "@/hooks/motion";
import { appendCapped } from "@/lib/random";
import { HOST, SAMPLE_FEED, sampleEntry, type SampleSeed } from "@/lib/sample";

interface Seed extends SampleSeed {
    id: string;
    text?: string;
}

interface HeartSpec {
    color: string;
    opacity: number;
    size: number;
    avatar?: number;
}

const MAX_ROWS = 8;
const MAX_HEARTS = 12;

// Comment pools share the same order in every language, so one index list works for fr and en
const STREAM_LINES = [1, 2, 4, 8, 9, 13, 17, 21, 25, 27, 29, 37, 42, 45, 49, 58, 63, 69];

const STREAM_PATTERN: { type: CommentType; tier: Tier }[] = [
    { type: "join", tier: 0 },
    { type: "comment", tier: 0 },
    { type: "comment", tier: 1 },
    { type: "badge", tier: 1 },
    { type: "comment", tier: 0 },
    { type: "join", tier: 0 },
    { type: "comment", tier: 0 },
    { type: "badge", tier: 3 },
    { type: "comment", tier: 2 },
    { type: "comment", tier: 0 },
];

const BASE_FEED: Seed[] = SAMPLE_FEED.slice(0, 6).map((seed, i) => ({ ...seed, id: `base-${i}` }));

const HEART_CYCLE: HeartSpec[] = [
    { color: "white", opacity: 1, size: 26 },
    { color: "var(--color-like)", opacity: 1, size: 24 },
    { color: "white", opacity: 0.75, size: 22 },
    { color: "white", opacity: 1, size: 28, avatar: 3 },
    { color: "white", opacity: 1, size: 22 },
    { color: "var(--color-chip-2)", opacity: 1, size: 24 },
    { color: "white", opacity: 0.75, size: 20 },
];
const HEART_DRIFT = [-4, 3, -2, 5, -5, 2, 0];

/**
 * Builds the n-th scripted comment of the demo stream by cycling through the type and tier pattern, the usernames and
 * the shared comment lines, so the stream never repeats visibly.
 *
 * @param n - Zero-based position in the stream, unbounded
 * @returns A seed with a unique id, ready for sampleEntry
 */
function streamSeed(n: number): Seed {
    const { type, tier } = STREAM_PATTERN[n % STREAM_PATTERN.length];
    return {
        id: `stream-${n}`,
        type,
        tier,
        user: USERNAMES[(n * 7 + 5) % USERNAMES.length],
        avatar: ((n * 11 + 2) % AVATAR_COUNT) + 1,
        line: STREAM_LINES[n % STREAM_LINES.length],
    };
}

/**
 * Builds the n-th floating heart of the demo, drifting sideways by a fixed offset taken from a cycle.
 *
 * @param n - Zero-based position in the heart stream, unbounded
 * @param like - True for a heart sent with the like button, which is always the red one without an avatar
 * @returns A heart entry that lives 3.4 s, with a unique id
 */
function heartAt(n: number, like = false): HeartEntry {
    const spec = like ? { color: "var(--color-like)", opacity: 1, size: 24 } : HEART_CYCLE[n % HEART_CYCLE.length];
    const avatar = "avatar" in spec && spec.avatar ? `/avatars/${spec.avatar}.jpg` : null;
    return {
        id: `heart-${n}`,
        color: spec.color,
        opacity: spec.opacity,
        x: HEART_DRIFT[n % HEART_DRIFT.length],
        duration: 3400,
        size: spec.size,
        avatar,
    };
}

/**
 * Fake viewer count that swings around 2400 so the number in the top bar keeps moving.
 *
 * @param tick - Number of comment ticks since the demo started
 * @returns A whole number of viewers, between about 1900 and 3000
 */
function viewersAt(tick: number): number {
    return 2400 + Math.round(520 * Math.sin(tick / 3)) + (tick % 5) * 12;
}

/**
 * Blurred room behind the host, standing in for the camera. Every shape is a blurred, tinted div over a dark base.
 */
function Scene() {
    return (
        <div aria-hidden="true" className="visual absolute inset-0 overflow-hidden bg-scene">
            <div className="absolute inset-0 bg-scene-wash" />
            <div className="absolute -top-5 left-[182px] h-[520px] w-11 bg-scene-beam blur-[10px]" />
            <div className="absolute top-24 left-[30px] size-24 rounded-full bg-scene-lamp blur-[5px]" />
            <div className="absolute top-28 -right-[34px] h-80 w-[150px] rounded-lg bg-scene-window blur-[14px]" />
            <div className="absolute top-[120px] right-[46px] h-[300px] w-[7px] bg-scene-pillar blur-[5px]" />
            <div className="absolute top-[150px] left-[122px] size-[22px] rounded-full bg-scene-glow-a blur-[3px]" />
            <div className="absolute top-[252px] left-[72px] size-3.5 rounded-full bg-scene-glow-b blur-[2px]" />
            <div className="absolute top-[72px] left-[258px] size-[18px] rounded-full bg-scene-glow-c blur-[3px]" />
            <div className="absolute top-[214px] left-[300px] size-3 rounded-full bg-scene-glow-d blur-[2px]" />
            <div className="absolute -right-[60px] -bottom-20 -left-[60px] h-[300px] rounded-full bg-scene-floor blur-[28px]" />
        </div>
    );
}

/**
 * Interactive live screen at phone size (390 by 844), fed by a scripted stream of comments, joins and hearts that only
 * runs while it is on screen and motion is allowed. Visitors can send a comment or a like.
 *
 * The decorative parts (top bar, feed, badge bar) are inert, so only the like button and the comment field take part
 * in the tab order.
 */
export function Demo() {
    const t = useTranslations("landing.demo");
    const language = useLanguage();
    const descId = useId();

    const [rootRef, inView] = useInView<HTMLDivElement>();
    const reduced = useReducedMotion();
    const tickRef = useRef(0);
    const heartRef = useRef(0);
    const [tick, setTick] = useState(0);
    const [feed, setFeed] = useState<Seed[]>(BASE_FEED);
    const [hearts, setHearts] = useState<HeartEntry[]>([]);

    const running = inView && !reduced;

    useEffect(() => {
        if (!running) return;
        const feedTimer = setInterval(() => {
            const n = tickRef.current++;
            setTick(n + 1);
            setFeed((prev) => appendCapped(prev, streamSeed(n), MAX_ROWS));
        }, 2400);
        const heartTimer = setInterval(() => {
            const n = heartRef.current++;
            setHearts((prev) => appendCapped(prev, heartAt(n), MAX_HEARTS));
        }, 700);
        return () => {
            clearInterval(feedTimer);
            clearInterval(heartTimer);
        };
    }, [running]);

    const removeHeart = useCallback((id: string) => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
    }, []);

    const handleLike = useCallback(() => {
        if (reduced) return;
        const n = heartRef.current++;
        setHearts((prev) => appendCapped(prev, heartAt(n, true), MAX_HEARTS));
    }, [reduced]);

    const handleSend = useCallback((text: string) => {
        const n = tickRef.current++;
        const own: Seed = {
            id: `own-${n}`,
            type: "comment",
            tier: 0,
            user: HOST.username,
            avatar: HOST.avatar,
            text,
        };
        setFeed((prev) => appendCapped(prev, own, MAX_ROWS));
    }, []);

    const comments = useMemo(
        () => feed.map((seed) => sampleEntry(seed, seed.id, language, seed.text)),
        [feed, language],
    );
    const hostColor = colorFor(HOST.username);

    return (
        <div
            ref={rootRef}
            role="group"
            aria-label={t("label")}
            aria-describedby={descId}
            lang={language}
            className="relative flex h-[844px] w-[390px] flex-col overflow-hidden bg-black pt-[47px] font-live text-white antialiased [&_input]:text-base"
        >
            <p id={descId} className="sr-only">
                {t("description")}
            </p>

            <div className="relative isolate min-h-0 flex-1 overflow-hidden rounded-2xl bg-scene">
                <Scene />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-[110px] bg-scrim-top"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-scrim-bottom"
                />

                <Hearts hearts={hearts} onRemove={removeHeart} />

                <div inert aria-hidden="true" className="contents">
                    <TopBar
                        username={HOST.username}
                        avatarUrl={`/avatars/${HOST.avatar}.jpg`}
                        avatarColor={hostColor}
                        viewerCount={viewersAt(tick)}
                        language={language}
                        onClose={() => {}}
                        onTap={() => {}}
                    />
                    <Feed comments={comments} language={language} />
                    <BadgeBar username={HOST.username} language={language} />
                </div>
            </div>

            <div className="h-[100px] flex-none">
                <Toolbar language={language} onSend={handleSend} onShare={() => {}} onLike={handleLike} decorative />
            </div>
        </div>
    );
}
