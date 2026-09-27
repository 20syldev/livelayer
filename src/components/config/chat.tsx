"use client";

import { Minus, Plus } from "lucide-react";
import { useId } from "react";

import { Range } from "@/components/config/range";
import { LABEL, SECTIONS, VALUE } from "@/components/config/section";
import { Segmented } from "@/components/config/segmented";
import type { LiveConfig } from "@/data/config";
import type { Language } from "@/data/live";
import { viewerCap } from "@/hooks/comments";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
    config: LiveConfig;
    onChange: (config: LiveConfig) => void;
}

type Weights = LiveConfig["comments"]["weights"];
type Adjustable = "join" | "badge";

const LANGUAGES: { value: Language; label: string; aria: string }[] = [
    { value: "fr", label: "FR", aria: "Français" },
    { value: "en", label: "EN", aria: "Anglais" },
    { value: "es", label: "ES", aria: "Espagnol" },
];

const KINDS: { key: keyof Weights; label: string; swatch: string; stepper?: { less: string; more: string } }[] = [
    { key: "regular", label: "Commentaires", swatch: "bg-pink" },
    {
        key: "join",
        label: "Arrivées",
        swatch: "bg-kind-join",
        stepper: { less: "Retirer 5 % aux arrivées", more: "Ajouter 5 % aux arrivées" },
    },
    {
        key: "badge",
        label: "Badges",
        swatch: "bg-kind-badge",
        stepper: { less: "Retirer 5 % aux badges", more: "Ajouter 5 % aux badges" },
    },
];

const STEP = 5;

/**
 * Moves join or badge by one step, snapped to the grid, and gives the remainder to regular comments.
 *
 * @param weights - Current percentages of the three comment kinds, summing to 100
 * @param key - Kind to adjust, the other adjustable kind caps how far it can grow
 * @param direction - 1 to add a step, -1 to remove one; the result stays between 0 and 100
 * @returns New weights, still summing to 100
 */
function stepWeight(weights: Weights, key: Adjustable, direction: 1 | -1): Weights {
    const other = key === "join" ? weights.badge : weights.join;
    const snapped =
        direction > 0 ? Math.floor(weights[key] / STEP) * STEP + STEP : Math.ceil(weights[key] / STEP) * STEP - STEP;
    const next = Math.min(100 - other, Math.max(0, snapped));
    const updated = { ...weights, [key]: next };
    return { ...updated, regular: 100 - updated.join - updated.badge };
}

/**
 * Config tab for the simulated chat: comment language, frequency and the mix of regular comments, arrivals and
 * badge purchases, each kind shown in the same color in the mix bar and in its legend.
 *
 * @param config - Live config being edited; its comments and viewers sections are read
 * @param onChange - Called with the whole updated config on every edit
 */
export function ChatTab({ config, onChange }: Props) {
    const { comments } = config;
    const { weights } = comments;
    const id = useId();
    const update = (patch: Partial<LiveConfig["comments"]>) =>
        onChange({ ...config, comments: { ...comments, ...patch } });

    const start = config.viewers.initial;
    const cap = viewerCap(start);
    const rateHelp =
        comments.perMinute > cap
            ? `≈ ${cap} / min au démarrage, limité par ${formatNumber(start)} viewers`
            : `Environ un commentaire toutes les ${Math.max(1, Math.round(60 / comments.perMinute))} s`;

    return (
        <div className={SECTIONS}>
            <div>
                <div className={cn(LABEL, "mb-2")}>Langue des commentaires</div>
                <Segmented
                    value={comments.language}
                    options={LANGUAGES}
                    onChange={(language) => update({ language })}
                    label="Langue des commentaires"
                />
                <p className="mt-1.5 text-xs leading-4 text-caption">Toute l’interface du live suit cette langue.</p>
            </div>

            <div>
                <div className="flex items-baseline justify-between">
                    <span className={LABEL}>Fréquence</span>
                    <span className={VALUE}>{comments.perMinute} / min</span>
                </div>
                <Range
                    value={comments.perMinute}
                    min={2}
                    max={75}
                    onChange={(perMinute) => update({ perMinute })}
                    label="Fréquence des commentaires"
                    valueText={`${comments.perMinute} commentaires par minute`}
                />
                <p className="text-xs leading-4 text-caption tabular-nums">{rateHelp}</p>
            </div>

            <div role="group" aria-labelledby={`${id}-mix`}>
                <div id={`${id}-mix`} className={cn(LABEL, "mb-2")}>
                    Répartition
                </div>
                <div aria-hidden="true" className="flex h-2.5 gap-[3px] overflow-hidden rounded-full">
                    {KINDS.filter(({ key }) => weights[key] > 0).map(({ key, swatch }) => (
                        <div key={key} className={swatch} style={{ flex: `${weights[key]} 1 0` }} />
                    ))}
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-3">
                    {KINDS.map(({ key, label, swatch, stepper }) => (
                        <div key={key} className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs leading-4 text-soft">
                                <span className={cn("size-2 flex-none rounded-full", swatch)} />
                                <span className="truncate">{label}</span>
                            </div>
                            <div className="mt-0.5 font-display text-base leading-5 font-semibold tracking-[-0.02em] tabular-nums">
                                {weights[key]} %
                            </div>
                            {stepper ? (
                                <div className="mt-1 flex gap-3">
                                    <StepButton
                                        label={stepper.less}
                                        disabled={weights[key] <= 0}
                                        onClick={() => update({ weights: stepWeight(weights, key as Adjustable, -1) })}
                                    >
                                        <Minus className="size-[18px]" strokeWidth={2.25} />
                                    </StepButton>
                                    <StepButton
                                        label={stepper.more}
                                        disabled={weights.regular <= 0 || weights[key] >= 100}
                                        onClick={() => update({ weights: stepWeight(weights, key as Adjustable, 1) })}
                                    >
                                        <Plus className="size-[18px]" strokeWidth={2.25} />
                                    </StepButton>
                                </div>
                            ) : (
                                <p className="mt-1 flex h-8 items-center text-xs leading-4 text-caption">Le reste</p>
                            )}
                        </div>
                    ))}
                </div>
                <p aria-live="polite" className="sr-only">
                    {KINDS.map(({ key, label }) => `${label} ${weights[key]} %`).join(", ")}
                </p>
            </div>
        </div>
    );
}

/**
 * Round 32px icon button used to step a percentage; the ::after pad extends the hit area to 44px.
 *
 * @param label - Accessible name, since the button only shows an icon
 * @param disabled - True when the step would leave the 0 to 100 range
 * @param onClick - Called when the user presses the button
 * @param children - Icon drawn inside the button
 */
function StepButton({
    label,
    disabled,
    onClick,
    children,
}: {
    label: string;
    disabled: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className="relative flex size-8 flex-none items-center justify-center rounded-full text-pink transition-colors outline-none after:absolute after:-inset-1.5 after:content-[''] hover:bg-pink/10 focus-visible:ring-2 focus-visible:ring-pink disabled:cursor-not-allowed disabled:opacity-35"
        >
            {children}
        </button>
    );
}
