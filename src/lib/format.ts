import type { Language } from "@/data/live";

/**
 * Formats a number in compact notation (1500 -> "1.5k", 1200000 -> "1.2M"), with a decimal comma
 * for fr and es ("1,5k").
 *
 * @param n - Count to format, zero or more
 * @param language - Language of the live; anything other than en gets the decimal comma
 * @returns The compact text, k from 1,000 and M from 999,500 (so it never reads "1000k")
 */
export function formatCount(n: number, language: Language = "en"): string {
    let out: string;
    if (n >= 999_500) out = (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    else if (n >= 10_000) out = Math.round(n / 1_000) + "k";
    else if (n >= 1_000) out = (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    else out = String(n);
    return language === "en" ? out : out.replace(".", ",");
}

/**
 * Formats seconds as mm:ss.
 *
 * @param seconds - Whole seconds, zero or more
 * @returns The duration with both parts zero-padded, minutes unbounded ("125:07")
 */
export function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Formats seconds as m:ss (60 -> "1:00").
 *
 * @param seconds - Seconds, rounded to the nearest whole second and clamped to zero when negative
 * @returns The time with unpadded minutes
 */
export function formatClock(seconds: number): string {
    const total = Math.max(0, Math.round(seconds));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/**
 * Parses "1:30" or "90" into seconds.
 *
 * @param text - Typed time, either m:ss (seconds 00 to 59) or a plain number of seconds, surrounding spaces ignored
 * @returns The time in seconds, or null when the text is not a valid time
 */
export function parseClock(text: string): number | null {
    const value = text.trim();
    const clock = /^(\d+):([0-5]?\d)$/.exec(value);
    if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
    if (/^\d+$/.test(value)) return Number(value);
    return null;
}

/**
 * Groups thousands with a narrow no-break space, as in French (2500 -> "2 500").
 *
 * @param n - Number to format, rounded to a whole number first
 * @returns The digits with a U+202F separator every three digits
 */
export function formatNumber(n: number): string {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
}

/**
 * Formats a number with a decimal comma, French style, without a trailing zero (1.5 -> "1,5", 2 -> "2").
 *
 * @param n - Value to format, negative values keep their sign
 * @param digits - Maximum number of decimals kept
 * @returns The text with a comma as decimal separator
 */
export function formatDecimal(n: number, digits = 1): string {
    const fixed = n.toFixed(digits);
    return (fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed).replace(".", ",");
}
