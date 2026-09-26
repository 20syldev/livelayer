import { DEFAULT_CONFIG, type LiveConfig, type Peak } from "@/data/config";

export type PresetId = "potes" | "createur" | "viral";

export interface Preset {
    label: string;
    viewers: LiveConfig["viewers"];
    perMinute: number;
    heartsPerMinute: number;
}

export const PRESETS: Record<PresetId, Preset> = {
    potes: {
        label: "Entre potes",
        viewers: {
            initial: 12,
            min: 8,
            max: 60,
            peaks: [
                { timeSeconds: 0, target: 12 },
                { timeSeconds: 60, target: 28 },
                { timeSeconds: 180, target: 52 },
                { timeSeconds: 300, target: 35 },
            ],
            fluctuationSpeed: 1,
        },
        perMinute: 6,
        heartsPerMinute: 10,
    },
    createur: {
        label: "Créateur",
        viewers: DEFAULT_CONFIG.viewers,
        perMinute: 18,
        heartsPerMinute: 24,
    },
    viral: {
        label: "Viral",
        viewers: {
            initial: 2400,
            min: 2000,
            max: 48000,
            peaks: [
                { timeSeconds: 0, target: 2400 },
                { timeSeconds: 60, target: 14000 },
                { timeSeconds: 180, target: 42000 },
                { timeSeconds: 300, target: 31000 },
            ],
            fluctuationSpeed: 1.2,
        },
        perMinute: 60,
        heartsPerMinute: 90,
    },
};

export const PRESET_IDS: PresetId[] = ["potes", "createur", "viral"];

/**
 * Applies a preset's audience, comment and heart rates, keeping the rest of the config.
 *
 * @param config - Current live config, left untouched
 * @param id - Key of the preset whose audience and rates replace the current ones
 * @returns A new config whose peaks are copies, so later edits never alter the preset
 */
export function applyPreset(config: LiveConfig, id: PresetId): LiveConfig {
    const preset = PRESETS[id];
    return {
        ...config,
        viewers: { ...preset.viewers, peaks: preset.viewers.peaks.map((peak) => ({ ...peak })) },
        comments: { ...config.comments, perMinute: preset.perMinute },
        reactions: { ...config.reactions, heartsPerMinute: preset.heartsPerMinute },
    };
}

/**
 * Compares two peak lists value by value.
 *
 * @param a - First list, in time order
 * @param b - Second list, in time order
 * @returns True when both lists have the same length and every peak has the same time and target
 */
function samePeaks(a: Peak[], b: Peak[]): boolean {
    return (
        a.length === b.length &&
        a.every((peak, i) => peak.timeSeconds === b[i].timeSeconds && peak.target === b[i].target)
    );
}

/**
 * Finds the preset that matches the config exactly.
 *
 * @param config - Live config to compare on audience, comment rate and heart rate
 * @returns The matching preset id, or null when the config was customized ("Perso")
 */
export function matchPreset(config: LiveConfig): PresetId | null {
    const { viewers, comments, reactions } = config;
    return (
        PRESET_IDS.find((id) => {
            const preset = PRESETS[id];
            return (
                viewers.initial === preset.viewers.initial &&
                viewers.min === preset.viewers.min &&
                viewers.max === preset.viewers.max &&
                viewers.fluctuationSpeed === preset.viewers.fluctuationSpeed &&
                samePeaks(viewers.peaks, preset.viewers.peaks) &&
                comments.perMinute === preset.perMinute &&
                reactions.heartsPerMinute === preset.heartsPerMinute
            );
        }) ?? null
    );
}
