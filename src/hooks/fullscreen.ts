"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Requests fullscreen on the document element and acquires a Wake Lock to prevent the screen
 * from dimming during the live simulation. Both are best effort: refusals are swallowed.
 *
 * @returns The enter and exit callbacks; a visibility listener requests the wake lock again whenever none is held
 */
export function useFullscreen() {
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const enter = useCallback(async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }
        } catch {
            // Fullscreen not supported or denied: continue without it
        }
        try {
            if ("wakeLock" in navigator) {
                wakeLockRef.current = await navigator.wakeLock.request("screen");
            }
        } catch {
            // Wake lock not supported or denied: continue without it
        }
    }, []);

    const exit = useCallback(async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch {
            // A refused exit leaves the document as it is, which is acceptable
        }
        try {
            await wakeLockRef.current?.release();
            wakeLockRef.current = null;
        } catch {
            // A failed release must not break the exit, the lock is dropped with the page anyway
        }
    }, []);

    // Request the wake lock again on return to the tab when none is held
    useEffect(() => {
        const handler = async () => {
            if (document.visibilityState === "visible" && wakeLockRef.current === null) {
                try {
                    if ("wakeLock" in navigator) {
                        wakeLockRef.current = await navigator.wakeLock.request("screen");
                    }
                } catch {
                    // Best effort like on enter: without the lock the screen may dim
                }
            }
        };
        document.addEventListener("visibilitychange", handler);
        return () => document.removeEventListener("visibilitychange", handler);
    }, []);

    return { enter, exit };
}
