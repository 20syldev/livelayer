"use client";

import { DEFAULT_CONFIG, type LiveConfig } from "@/data/config";
import { useLocalStorage } from "@/hooks/storage";

/**
 * Reads and writes the live configuration persisted in localStorage.
 *
 * @returns The useLocalStorage tuple of config, setter and remover; the config is DEFAULT_CONFIG until hydration
 */
export function useLiveConfig() {
    return useLocalStorage<LiveConfig>("config", DEFAULT_CONFIG);
}
