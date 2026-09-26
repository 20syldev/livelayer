"use client";

import { useEffect, useRef, useState } from "react";

import type { LiveConfig } from "@/data/config";

/**
 * Rounds a value and keeps it inside a range.
 *
 * @param n - Value to constrain, rounded to the nearest integer first
 * @param min - Lower bound, inclusive
 * @param max - Upper bound, inclusive
 * @returns The rounded value, no lower than min and no higher than max
 */
function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(Math.round(n), min), max);
}

/**
 * Interpolates linearly between two values.
 *
 * @param a - Value at t = 0
 * @param b - Value at t = 1
 * @param t - Position between a and b, clamped to 0..1
 * @returns The interpolated value
 */
function lerp(a: number, b: number, t: number) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Computes the target viewer count from the elapsed time and the peak schedule, with organic
 * noise (two sine waves and a small random walk) on top of the interpolated baseline.
 *
 * @param elapsed - Seconds since the live started
 * @param config - Live config providing the peaks, the min and max bounds and the fluctuation speed
 * @returns The target count inside min..max; the initial count when there are no peaks, and the first or last peak outside the schedule
 */
function computeTarget(elapsed: number, config: LiveConfig): number {
    const { peaks, min, max, fluctuationSpeed } = config.viewers;

    if (peaks.length === 0) return config.viewers.initial;

    let before = peaks[0];
    let after = peaks[peaks.length - 1];
    for (let i = 0; i < peaks.length - 1; i++) {
        if (elapsed >= peaks[i].timeSeconds && elapsed <= peaks[i + 1].timeSeconds) {
            before = peaks[i];
            after = peaks[i + 1];
            break;
        }
    }
    if (elapsed < peaks[0].timeSeconds) {
        return clamp(peaks[0].target, min, max);
    }
    if (elapsed > peaks[peaks.length - 1].timeSeconds) {
        return clamp(peaks[peaks.length - 1].target, min, max);
    }

    const range = after.timeSeconds - before.timeSeconds;
    const t = range === 0 ? 1 : (elapsed - before.timeSeconds) / range;
    const baseline = lerp(before.target, after.target, t);

    const noise = Math.sin(elapsed * 0.7) * 0.03 + Math.sin(elapsed * 1.3) * 0.02;
    const walk = (Math.random() - 0.5) * baseline * 0.015 * fluctuationSpeed;

    return clamp(baseline * (1 + noise * fluctuationSpeed) + walk, min, max);
}

/**
 * Returns a live viewer count that fluctuates organically following the configured peak
 * schedule, plus the highest count reached so far. The count only moves when elapsed changes,
 * so it freezes with the timer.
 *
 * @param config - Live config providing the audience settings; the count starts at viewers.initial
 * @param elapsed - Seconds since the live started, usually from useElapsedTime
 * @returns The current viewer count and the highest count reached so far
 */
export function useViewerCount(config: LiveConfig, elapsed: number) {
    const [state, setState] = useState({ count: config.viewers.initial, peak: config.viewers.initial });
    const prevRef = useRef(config.viewers.initial);

    useEffect(() => {
        const target = computeTarget(elapsed, config);
        const next = Math.round(prevRef.current + (target - prevRef.current) * 0.2);
        if (next === prevRef.current) return;
        prevRef.current = next;
        setState((prev) => ({ count: next, peak: Math.max(prev.peak, next) }));
    }, [elapsed, config]);

    return state;
}
