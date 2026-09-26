"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribes to nothing: the hydration flag never changes after the first client render.
 *
 * @returns An unsubscribe function that does nothing
 */
const subscribeNothing = () => () => {};

/**
 * Tells whether browser-only state (localStorage) is readable yet, false while the static HTML hydrates.
 *
 * @returns False on the server and during hydration, true afterwards
 */
export function useHydrated(): boolean {
    return useSyncExternalStore(
        subscribeNothing,
        () => true,
        () => false,
    );
}
