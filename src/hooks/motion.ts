"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Subscribes to changes of the reduced motion preference.
 *
 * @param notify - Called by the browser each time the preference flips
 * @returns A function that removes the listener
 */
const subscribe = (notify: () => void) => {
    const query = window.matchMedia(QUERY);
    query.addEventListener("change", notify);
    return () => query.removeEventListener("change", notify);
};

/**
 * Tells whether the user asks for reduced motion, live-updated when the system setting changes.
 *
 * @returns True when reduced motion is requested; false on the server
 */
export function useReducedMotion(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(QUERY).matches,
        () => false,
    );
}
