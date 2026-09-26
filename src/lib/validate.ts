import type { LiveConfig } from "@/data/config";

export const USERNAME_MAX = 30;

const USERNAME_PATTERN = /^[a-z0-9._]+$/;

/**
 * Normalizes typed input like Instagram does: no leading "@", lowercase, no whitespace.
 *
 * @param raw - Text as typed or pasted in the username field
 * @returns The cleaned name, cut to USERNAME_MAX characters
 */
export function sanitizeUsername(raw: string): string {
    return raw.replace(/^@+/, "").toLowerCase().replace(/\s+/g, "").slice(0, USERNAME_MAX);
}

/**
 * Validates a username for the live, with a French message shown on the config page.
 *
 * @param name - Sanitized username, empty while the field is untouched
 * @returns The error message, or null when the name can be used
 */
export function usernameError(name: string): string | null {
    if (!name) return "Choisis un nom pour lancer le live.";
    if (!USERNAME_PATTERN.test(name)) return "Lettres minuscules, chiffres, points et _ uniquement.";
    return null;
}

/**
 * Validates the audience settings, with a French message shown on the config page.
 *
 * @param viewers - Audience section of the live config: min must stay below max and every peak inside that range
 * @returns The error message, or null when the settings are consistent
 */
export function audienceError(viewers: LiveConfig["viewers"]): string | null {
    if (viewers.min >= viewers.max) return "Le minimum doit être inférieur au maximum.";
    if (viewers.peaks.length === 0) return "Ajoute au moins un pic d'audience.";
    if (viewers.peaks.some((peak) => peak.target < viewers.min || peak.target > viewers.max)) {
        return "Chaque pic doit rester entre le minimum et le maximum.";
    }
    return null;
}
