"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const prefix = "livelayer:";

/**
 * Hook for persistent state using localStorage with useSyncExternalStore.
 * Automatically prefixes keys with "livelayer:" and syncs across tabs via StorageEvent.
 *
 * @param key - The storage key (automatically prefixed with "livelayer:")
 * @param initialValue - The default value when no stored value exists
 * @returns Tuple of [storedValue, setValue, removeValue]; setValue returns false when the browser refused to save (storage full or blocked)
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    const prefixedKey = prefix + key;
    const cachedJson = useRef<string | null>(null);
    const cachedValue = useRef<T>(initialValue);

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const handler = (e: StorageEvent) => {
                if (e.key === prefixedKey) onStoreChange();
            };
            window.addEventListener("storage", handler);
            return () => window.removeEventListener("storage", handler);
        },
        [prefixedKey],
    );

    const getSnapshot = useCallback((): T => {
        try {
            const raw = localStorage.getItem(prefixedKey);
            if (raw === cachedJson.current) return cachedValue.current;
            cachedJson.current = raw;
            cachedValue.current = raw ? JSON.parse(raw) : initialValue;
            return cachedValue.current;
        } catch {
            return initialValue;
        }
    }, [prefixedKey, initialValue]);

    const getServerSnapshot = useCallback((): T => initialValue, [initialValue]);

    const storedValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setValue = useCallback(
        (value: T | ((val: T) => T)): boolean => {
            const current = (() => {
                try {
                    const item = localStorage.getItem(prefixedKey);
                    return item ? (JSON.parse(item) as T) : initialValue;
                } catch {
                    return initialValue;
                }
            })();
            const next = value instanceof Function ? value(current) : value;

            // An updater that returns its argument changed nothing
            if (Object.is(next, current)) return true;
            try {
                const json = JSON.stringify(next);
                localStorage.setItem(prefixedKey, json);
                window.dispatchEvent(new StorageEvent("storage", { key: prefixedKey, newValue: json }));
                return true;
            } catch {
                return false;
            }
        },
        [prefixedKey, initialValue],
    );

    const removeValue = useCallback(() => {
        localStorage.removeItem(prefixedKey);
        window.dispatchEvent(new StorageEvent("storage", { key: prefixedKey, newValue: null }));
    }, [prefixedKey]);

    return [storedValue, setValue, removeValue] as const;
}
