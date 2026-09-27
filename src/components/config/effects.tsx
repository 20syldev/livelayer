"use client";

import { Infinity as InfinityIcon } from "lucide-react";
import { useId } from "react";

import { Range } from "@/components/config/range";
import { LABEL, SECTIONS, VALUE } from "@/components/config/section";
import { Segmented } from "@/components/config/segmented";
import { Toggle } from "@/components/config/toggle";
import { HeartGlyph } from "@/components/live/icons";
import { HEART_COLORS } from "@/data/colors";
import type { LiveConfig } from "@/data/config";
import type { CameraState } from "@/hooks/camera";
import { formatDecimal } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
    config: LiveConfig;
    onChange: (config: LiveConfig) => void;
    camera: { state: CameraState; onToggle: () => void };
}

// Segment values are strings: "inf" or a duration in seconds
const UNLIMITED = "inf";
const DURATIONS = [300, 900, 1800];

/**
 * Formats a duration in minutes with a decimal comma when needed (90 gives "1,5").
 *
 * @param seconds - Duration in seconds
 * @returns Minutes as French text, without unit
 */
function minutes(seconds: number): string {
    return formatDecimal(seconds / 60);
}

/**
 * Config tab for the live effects: heart rate and colors, front camera and live duration. Only palette colors
 * count as selected, so the last visible selection can never be removed, and a stored duration outside the
 * presets gets its own segment.
 *
 * @param config - Live config being edited; its reactions and duration are read
 * @param onChange - Called with the whole updated config on every edit
 * @param camera - Front camera status and the toggle that asks for or releases it
 */
export function EffectsTab({ config, onChange, camera }: Props) {
    const { reactions, duration } = config;
    const id = useId();
    const update = (patch: Partial<LiveConfig["reactions"]>) =>
        onChange({ ...config, reactions: { ...reactions, ...patch } });

    const palette = HEART_COLORS.map((c) => c.value);
    const selected = palette.filter((c) => reactions.colors.includes(c));
    const toggleColor = (color: string) => {
        const active = selected.includes(color);
        if (active && selected.length === 1) return;
        update({
            colors: active
                ? selected.filter((c) => c !== color)
                : palette.filter((c) => c === color || selected.includes(c)),
        });
    };

    const presets = duration === null || DURATIONS.includes(duration) ? DURATIONS : [...DURATIONS, duration];
    const durationOptions = [
        {
            value: UNLIMITED,
            label: <InfinityIcon aria-hidden="true" className="size-3.5" strokeWidth={2} />,
            aria: "Illimitée",
        },
        ...[...presets]
            .sort((a, b) => a - b)
            .map((seconds) => ({
                value: String(seconds),
                label: `${minutes(seconds)} min`,
                aria: `${minutes(seconds)} minutes`,
            })),
    ];

    return (
        <div className={SECTIONS}>
            <div>
                <div className="flex items-baseline justify-between">
                    <span className={LABEL}>Cœurs</span>
                    <span className={VALUE}>{reactions.heartsPerMinute} / min</span>
                </div>
                <Range
                    value={reactions.heartsPerMinute}
                    min={0}
                    max={120}
                    onChange={(heartsPerMinute) => update({ heartsPerMinute })}
                    label="Cœurs par minute"
                    valueText={`${reactions.heartsPerMinute} cœurs par minute`}
                />
            </div>

            <div>
                <div id={`${id}-colors`} className={cn(LABEL, "mb-2")}>
                    Couleurs des cœurs
                </div>
                <div role="group" aria-labelledby={`${id}-colors`} className="flex gap-2">
                    {HEART_COLORS.map(({ value, name }) => {
                        const on = selected.includes(value);
                        return (
                            <button
                                key={value}
                                type="button"
                                aria-pressed={on}
                                aria-label={name}
                                onClick={() => toggleColor(value)}
                                className={cn(
                                    "relative flex size-9 items-center justify-center rounded-full border transition-colors outline-none after:absolute after:-inset-1 after:content-[''] focus-visible:ring-2 focus-visible:ring-pink",
                                    on ? "border-pink bg-pink/14" : "border-hairline",
                                )}
                            >
                                <HeartGlyph size={17} color={value} opacity={on ? undefined : 0.35} />
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <div className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                        <label htmlFor={`${id}-camera`} className={cn(LABEL, "block")}>
                            Caméra frontale
                        </label>
                        <p className="mt-0.5 text-xs leading-4 text-caption">
                            Aucune donnée n’est envoyée. Tout reste sur ton appareil.
                        </p>
                    </div>
                    <Toggle
                        id={`${id}-camera`}
                        checked={camera.state === "active"}
                        onChange={() => camera.onToggle()}
                        label="Caméra frontale"
                        disabled={camera.state === "requesting"}
                    />
                </div>
                {camera.state === "requesting" && (
                    <p role="status" className="mt-2 text-xs leading-4 text-soft">
                        Autorise l’accès à la caméra dans la fenêtre du navigateur.
                    </p>
                )}
                {camera.state === "denied" && (
                    <p role="alert" className="mt-2 text-xs leading-4 text-danger">
                        Accès refusé : autorise la caméra dans les réglages du navigateur.
                    </p>
                )}
                {camera.state === "unavailable" && (
                    <p role="alert" className="mt-2 text-xs leading-4 text-danger">
                        {window.isSecureContext
                            ? "Caméra indisponible sur cet appareil ou ce navigateur."
                            : "La caméra demande une connexion sécurisée (HTTPS)."}
                    </p>
                )}
            </div>

            <div>
                <div className={cn(LABEL, "mb-2")}>Durée du live</div>
                <Segmented
                    value={duration === null ? UNLIMITED : String(duration)}
                    options={durationOptions}
                    onChange={(value) => onChange({ ...config, duration: value === UNLIMITED ? null : Number(value) })}
                    label="Durée du live"
                />
                <p className="mt-1.5 text-xs leading-4 text-caption">
                    {duration === null
                        ? "Pour quitter, touche 3 fois le coin en haut à gauche du live."
                        : `Le live se termine tout seul après ${minutes(duration)} min et affiche l’écran de fin.`}
                </p>
            </div>
        </div>
    );
}
