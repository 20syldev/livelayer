"use client";

import { useEffect, useState } from "react";

/**
 * Counts elapsed seconds while running and stops at the limit when there is one.
 *
 * @param maxSeconds - Limit in seconds, or null for no limit
 * @param running - Pass false to freeze the count without resetting it
 * @returns The elapsed whole seconds and whether the limit has been reached (always false without a limit)
 */
export function useElapsedTime(maxSeconds: number | null, running = true) {
    const [elapsed, setElapsed] = useState(0);
    const finished = maxSeconds !== null && elapsed >= maxSeconds;

    useEffect(() => {
        if (!running || finished) return;
        const id = setInterval(() => {
            setElapsed((prev) => (maxSeconds !== null ? Math.min(prev + 1, maxSeconds) : prev + 1));
        }, 1000);
        return () => clearInterval(id);
    }, [maxSeconds, running, finished]);

    return { elapsed, finished };
}
