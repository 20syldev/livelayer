"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { AVATAR_COLORS, AVATAR_COUNT } from "@/data/colors";
import { COMMENTS_EN } from "@/data/comments/en";
import { COMMENTS_ES } from "@/data/comments/es";
import { COMMENTS_FR } from "@/data/comments/fr";
import type { LiveConfig } from "@/data/config";
import { type Language, liveStrings } from "@/data/live";
import { USERNAMES } from "@/data/usernames";
import { appendCapped, jitter, pick, range, uid, weightedPick } from "@/lib/random";

export type CommentType = "comment" | "join" | "badge";

export type Tier = 0 | 1 | 2 | 3;

export interface CommentEntry {
    id: string;
    type: CommentType;
    username: string;
    avatarColor: string;
    avatarImg: string | null;
    text: string;
    tier: Tier;
}

const MAX_COMMENTS = 50;

export const COMMENT_POOLS: Record<Language, string[]> = {
    en: COMMENTS_EN,
    fr: COMMENTS_FR,
    es: COMMENTS_ES,
};

/**
 * Caps the comment rate an audience can produce, on a square root scale (100 viewers -> 15 per
 * minute, 1,000 -> 47 per minute).
 *
 * @param viewers - Viewer count, 0 or more
 * @returns Most comments per minute, at least 1
 */
export function viewerCap(viewers: number): number {
    return Math.max(1, Math.floor(Math.sqrt(viewers) * 1.5));
}

/**
 * Shuffles the avatar numbers (Fisher-Yates), so the same avatar is not seen twice within a full
 * cycle of AVATAR_COUNT comments.
 *
 * @returns Every avatar number from 1 to AVATAR_COUNT in random order
 */
function makeAvatarDeck(): number[] {
    const deck = Array.from({ length: AVATAR_COUNT }, (_, i) => i + 1);
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

let avatarDeck: number[] = makeAvatarDeck();
let avatarCursor = 0;

/**
 * Draws the next avatar photo from the shuffled deck, reshuffling once the deck is used up.
 *
 * @returns Public path of the photo
 */
function nextAvatar(): string {
    if (avatarCursor >= avatarDeck.length) {
        avatarDeck = makeAvatarDeck();
        avatarCursor = 0;
    }
    return `/avatars/${avatarDeck[avatarCursor++]}.jpg`;
}

/**
 * Decides the supporter chip of a regular commenter: about 1 in 5 is a supporter, always with
 * the same chip. The tier is the number of hearts on the badge chip, 0 meaning no chip.
 *
 * @param username - Commenter, hashed so the result is stable for a given name
 * @returns The tier, 0 for a non-supporter or 1 to 3
 */
function supporterTier(username: string): Tier {
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
    return hash % 10 < 2 ? ((((hash >>> 4) % 3) + 1) as Tier) : 0;
}

/**
 * Builds a random feed entry, kind chosen by the configured weights.
 *
 * @param config - Live config providing the language and the regular, join and badge weights
 * @returns A comment, join or badge entry; badge entries get a random tier from 1 to 3 and join entries tier 0
 */
function makeComment(config: LiveConfig): CommentEntry {
    const { language, weights } = config.comments;
    const strings = liveStrings(language);
    const type = weightedPick<CommentType>(
        ["comment", "join", "badge"],
        [weights.regular, weights.join, weights.badge],
    );
    const username = pick(USERNAMES);
    const base = { id: uid(), type, username, avatarColor: pick(AVATAR_COLORS), avatarImg: nextAvatar() };

    if (type === "join") return { ...base, text: strings.joined, tier: 0 };
    if (type === "badge") return { ...base, text: strings.bought, tier: range(1, 3) as Tier };
    return { ...base, text: pick(COMMENT_POOLS[language] ?? COMMENT_POOLS.en), tier: supporterTier(username) };
}

interface FeedState {
    list: CommentEntry[];
    total: number;
}

/**
 * Appends an entry to the feed, capped at MAX_COMMENTS, and counts regular comments only.
 *
 * @param state - Current feed, with the entries kept so far and the running count of regular comments
 * @param entry - Comment, join or badge event; only a regular comment increments the running count
 * @returns The next feed, without mutating the previous one
 */
function append(state: FeedState, entry: CommentEntry): FeedState {
    return {
        list: appendCapped(state.list, entry, MAX_COMMENTS),
        total: state.total + (entry.type === "comment" ? 1 : 0),
    };
}

/**
 * Generates the live comment feed in bursts separated by pauses, at a rate bounded by the
 * audience size.
 *
 * @param config - Live config providing the language, the kind weights and the comments per minute
 * @param running - Pass false to stop generating without clearing the feed
 * @param viewerCount - Current viewer count, which caps the rate through viewerCap
 * @returns The feed entries (oldest first), the number of regular comments so far, and a callback to add an entry by hand
 */
export function useComments(config: LiveConfig, running: boolean, viewerCount: number) {
    const [feed, setFeed] = useState<FeedState>({ list: [], total: 0 });
    const viewerCountRef = useRef(viewerCount);
    useEffect(() => {
        viewerCountRef.current = viewerCount;
    }, [viewerCount]);

    useEffect(() => {
        if (!running) return;

        // Burst and pause cycle: a few comments in a row, then a pause, then another burst
        let burstRemaining = range(4, 12);
        let timer: ReturnType<typeof setTimeout>;
        let active = true;

        const scheduleNext = () => {
            const effectiveRate = Math.min(config.comments.perMinute, viewerCap(viewerCountRef.current));

            // Burst exhausted: pause at least 2 s, longer when the rate is low
            if (burstRemaining <= 0) {
                const pauseMs = jitter(Math.max(2000, 12000 / Math.sqrt(Math.max(1, effectiveRate))), 0.35);
                timer = setTimeout(() => {
                    burstRemaining = range(3, 9);
                    scheduleNext();
                }, pauseMs);
                return;
            }

            // Hard minimum 600 ms between comments keeps it readable at any rate
            const intervalMs = Math.max(600, (60 / effectiveRate) * 1000);
            timer = setTimeout(
                () => {
                    setFeed((prev) => append(prev, makeComment(config)));
                    burstRemaining -= 1;

                    // 20% chance of a quick follow-up within the burst
                    if (burstRemaining > 0 && Math.random() < 0.2) {
                        burstRemaining -= 1;
                        setTimeout(
                            () => {
                                if (active) setFeed((prev) => append(prev, makeComment(config)));
                            },
                            jitter(350, 0.4),
                        );
                    }
                    scheduleNext();
                },
                jitter(intervalMs, 0.4),
            );
        };

        scheduleNext();
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [running, config]);

    const addComment = useCallback((entry: CommentEntry) => setFeed((prev) => append(prev, entry)), []);

    return { comments: feed.list, total: feed.total, addComment };
}
