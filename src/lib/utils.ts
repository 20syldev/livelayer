import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names, letting the last conflicting Tailwind utility win.
 *
 * @param inputs - Class values accepted by clsx (strings, arrays, objects, falsy values to skip)
 * @returns A single class string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
