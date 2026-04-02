import { HEART_COLORS } from "@/data/colors";

export interface Peak {
    timeSeconds: number;
    target: number;
}

export interface LiveConfig {
    profile: {
        username: string;
        avatarUrl: string | null;
    };
    camera: boolean;
    viewers: {
        initial: number;
        min: number;
        max: number;
        peaks: Peak[];
        fluctuationSpeed: number;
    };
    comments: {
        language: "en" | "fr" | "es";
        perMinute: number;
        weights: {
            regular: number;
            join: number;
            badge: number;
        };
    };
    reactions: {
        heartsPerMinute: number;
        colors: string[];
    };
    duration: number | null;
    countdown: boolean;
}

// Defaults of a new live: fluctuationSpeed 1 is normal, 0.5 slow and 2 fast; duration is in seconds, null means unlimited
export const DEFAULT_CONFIG: LiveConfig = {
    profile: {
        username: "",
        avatarUrl: null,
    },
    camera: false,
    viewers: {
        initial: 120,
        min: 80,
        max: 2500,
        peaks: [
            { timeSeconds: 0, target: 120 },
            { timeSeconds: 60, target: 800 },
            { timeSeconds: 180, target: 2200 },
            { timeSeconds: 300, target: 1400 },
        ],
        fluctuationSpeed: 1,
    },
    comments: {
        language: "fr",
        perMinute: 18,
        weights: {
            regular: 65,
            join: 25,
            badge: 10,
        },
    },
    reactions: {
        heartsPerMinute: 24,
        colors: HEART_COLORS.map((c) => c.value),
    },
    duration: null,
    countdown: true,
};
