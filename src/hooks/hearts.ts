"use client";

import { useEffect, useState } from "react";

import { AVATAR_COUNT } from "@/data/colors";
import type { LiveConfig } from "@/data/config";
import { appendCapped, jitter, pick, range, uid } from "@/lib/random";

export interface HeartEntry {
    id: string;
    color: string;
    opacity: number;
    x: number;
    duration: number;
    size: number;
    avatar: string | null;
}

const MAX_HEARTS = 30;
const AVATAR_SIZE = 28;
const LIKE_COLOR = "var(--color-like)";

/**
 * Builds one floating heart: viewers' hearts are mostly white like on Instagram, some carry an
 * avatar photo and the rest take the configured colors.
 *
 * @param config - Live config providing the heart colors to pick from
 * @param color - Forces the color (CSS value) and turns off the random avatar and dimming, for the host's own like
 * @returns The heart with a horizontal offset in px, a duration in ms and a size in px
 */
function makeHeart(config: LiveConfig, color?: string): HeartEntry {
    const roll = Math.random();
    const avatar = !color && roll < 1 / 6 ? `/avatars/${range(1, AVATAR_COUNT)}.jpg` : null;
    return {
        id: uid(),
        color: color ?? (roll < 0.6 ? "white" : pick(config.reactions.colors)),
        opacity: !color && roll >= 1 / 6 && roll < 0.35 ? 0.75 : 1,
        x: range(-6, 6),
        duration: range(2400, 3400),
        size: avatar ? AVATAR_SIZE : range(20, 26),
        avatar,
    };
}

/**
 * Spawns floating hearts at the configured rate while running, and on demand for the host's like.
 * The list is capped, so old hearts that were never removed drop off.
 *
 * @param config - Live config; the rate is reactions.heartsPerMinute and 0 disables the automatic hearts
 * @param running - Pass false to pause the automatic hearts
 * @returns The current hearts, a callback to remove one by id once its animation ends, and a callback for the host's like, which always spawns a red heart
 */
export function useHearts(config: LiveConfig, running: boolean) {
    const [hearts, setHearts] = useState<HeartEntry[]>([]);

    useEffect(() => {
        if (!running || config.reactions.heartsPerMinute === 0) return;

        let timer: ReturnType<typeof setTimeout>;
        const scheduleNext = () => {
            const intervalMs = (60 / config.reactions.heartsPerMinute) * 1000;
            timer = setTimeout(
                () => {
                    setHearts((prev) => appendCapped(prev, makeHeart(config), MAX_HEARTS));
                    scheduleNext();
                },
                jitter(intervalMs, 0.5),
            );
        };

        scheduleNext();
        return () => clearTimeout(timer);
    }, [running, config]);

    const removeHeart = (id: string) => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
    };

    const spawnHeart = () => {
        setHearts((prev) => appendCapped(prev, makeHeart(config, LIKE_COLOR), MAX_HEARTS));
    };

    return { hearts, removeHeart, spawnHeart };
}
