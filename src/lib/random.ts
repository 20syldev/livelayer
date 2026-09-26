/**
 * Picks a random element from an array.
 *
 * @param arr - Candidates, must not be empty
 * @returns One element, all equally likely
 */
export function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Picks a random element, each one with the likelihood given by its weight.
 *
 * @param items - Candidates, must not be empty
 * @param weights - One weight per item in the same order, any positive scale (they are summed, not required to total 100)
 * @returns The chosen element, the last one if rounding exhausts the weights
 */
export function weightedPick<T>(items: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        rand -= weights[i];
        if (rand <= 0) return items[i];
    }
    return items[items.length - 1];
}

/**
 * Draws a random integer between two bounds, both included.
 *
 * @param min - Lowest value, an integer
 * @param max - Highest value, an integer not below min
 * @returns An integer in [min, max]
 */
export function range(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Applies random jitter to a base interval so repeated timers do not look mechanical.
 *
 * @param base - Interval to vary, in any unit
 * @param factor - Maximum deviation as a share of base (0.3 means plus or minus 30%)
 * @returns A value between base * (1 - factor) and base * (1 + factor)
 */
export function jitter(base: number, factor = 0.3): number {
    const delta = base * factor;
    return base + (Math.random() * 2 - 1) * delta;
}

/**
 * Generates a random identifier, unique enough for React keys of short-lived lists.
 *
 * @returns A base-36 string mixing random digits and the current time
 */
export function uid(): string {
    return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

/**
 * Appends an item to an array without mutating it, dropping the oldest entries past the cap.
 *
 * @param arr - Current list, oldest first
 * @param item - Element placed last, so it is always among the entries kept
 * @param maxLength - Most entries kept, counted after the append
 * @returns A new array of at most maxLength entries
 */
export function appendCapped<T>(arr: T[], item: T, maxLength: number): T[] {
    const next = [...arr, item];
    return next.length > maxLength ? next.slice(-maxLength) : next;
}
