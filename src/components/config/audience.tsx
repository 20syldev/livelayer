"use client";

import { ArrowRight, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { RadioGroup } from "radix-ui";
import { useEffect, useId, useRef, useState } from "react";

import { CHIP } from "@/components/config/chip";
import { FIELD, FIELD_INVALID } from "@/components/config/field";
import { Range } from "@/components/config/range";
import { LABEL, SECTIONS, VALUE } from "@/components/config/section";
import type { LiveConfig, Peak } from "@/data/config";
import { applyPreset, matchPreset, PRESET_IDS, type PresetId, PRESETS } from "@/data/presets";
import { formatClock, formatDecimal, formatNumber, parseClock } from "@/lib/format";
import { cn } from "@/lib/utils";
import { audienceError } from "@/lib/validate";

type Viewers = LiveConfig["viewers"];

interface Props {
    config: LiveConfig;
    onChange: (config: LiveConfig) => void;
}

const MAX_PEAKS = 6;

// 99:59, the largest time the m:ss field can show
const MAX_TIME = 5999;
const MAX_DIGITS = 7;

/**
 * Restricts a number to an inclusive range.
 *
 * @param n - Value to bound, any finite number
 * @param min - Lower bound, returned when n is below it
 * @param max - Upper bound, returned when n is above it; wins over min if the bounds are inverted
 * @returns n, or the bound it exceeds
 */
function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
}

/**
 * Rounds to a believable figure for the magnitude (1234 gives 1200).
 *
 * @param n - Viewer count to round, 0 or more
 * @returns n rounded to the nearest unit, ten, hundred or thousand depending on its size
 */
function nice(n: number): number {
    if (n < 100) return Math.round(n);
    if (n < 1000) return Math.round(n / 10) * 10;
    if (n < 10000) return Math.round(n / 100) * 100;
    return Math.round(n / 1000) * 1000;
}

/**
 * Sorts peaks by time and starts the count on the peak at 0 s, which is the first one once sorted.
 *
 * @param viewers - Audience settings to update
 * @param peaks - New peaks in any order
 * @returns Copy of the settings with sorted peaks and the initial count of the first peak
 */
function withPeaks(viewers: Viewers, peaks: Peak[]): Viewers {
    const sorted = [...peaks].sort((a, b) => a.timeSeconds - b.timeSeconds);
    return { ...viewers, peaks: sorted, initial: sorted[0]?.target ?? viewers.initial };
}

/**
 * Moves the peaks proportionally from the base bounds to new ones, so the curve keeps its shape.
 *
 * @param base - Settings as they were when the bound field got focus, so the rescale is not cumulative per keystroke
 * @param min - New lower bound
 * @param max - New upper bound
 * @returns Rescaled peaks, or the base peaks unchanged when either pair of bounds is invalid or equal
 */
function rescale(base: Viewers, min: number, max: number): Peak[] {
    if (base.min >= base.max || min >= max || (min === base.min && max === base.max)) return base.peaks;
    return base.peaks.map((peak) => {
        const ratio = clamp((peak.target - base.min) / (base.max - base.min), 0, 1);
        return { ...peak, target: clamp(nice(min + ratio * (max - min)), min, max) };
    });
}

interface NumberFieldProps {
    value: number;
    onValue: (value: number) => void;
    id?: string;
    label?: string;
    invalid?: boolean;
    describedBy?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    suffix?: boolean;
    className?: string;
}

/**
 * Digits-only field showing grouped thousands. Left empty on blur, it goes back to the value it had before the
 * edit instead of keeping the last digit that was erased.
 *
 * @param value - Current number, shown with grouped thousands
 * @param onValue - Called with the parsed number each time digits are typed, never with an empty field
 * @param id - DOM id of the input so an external label can target it with htmlFor
 * @param label - Accessible name used when no external label exists
 * @param invalid - Draws the field in its error state and flags it to screen readers
 * @param describedBy - Id of the element describing the error, read after the label
 * @param onFocus - Called when the input gets focus, after its content was selected
 * @param onBlur - Called when the input loses focus, after an empty field was restored
 * @param suffix - Shows the "viewers" unit after the digits, true when omitted
 * @param className - Extra classes merged onto the field wrapper, e.g. to make it grow
 */
function NumberField({
    value,
    onValue,
    id,
    label,
    invalid,
    describedBy,
    onFocus,
    onBlur,
    suffix = true,
    className,
}: NumberFieldProps) {
    const input = useRef<HTMLInputElement>(null);
    const start = useRef(value);
    const [empty, setEmpty] = useState(false);

    return (
        <div
            className={cn(FIELD, "h-11 min-w-0", invalid && FIELD_INVALID, className)}
            onClick={() => input.current?.focus()}
        >
            <input
                ref={input}
                id={id}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="done"
                aria-label={label}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                value={empty ? "" : formatNumber(value)}
                onFocus={(event) => {
                    start.current = value;
                    event.currentTarget.select();
                    onFocus?.();
                }}
                onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, MAX_DIGITS);
                    setEmpty(digits === "");
                    if (digits) onValue(Number(digits));
                }}
                onBlur={() => {
                    if (empty && value !== start.current) onValue(start.current);
                    setEmpty(false);
                    onBlur?.();
                }}
                onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                }}
                className={cn(
                    "h-full w-full min-w-0 bg-transparent pl-3.5 text-base font-semibold text-foreground tabular-nums outline-none",
                    suffix ? "pr-1" : "pr-2",
                )}
            />
            {suffix && (
                <span aria-hidden="true" className="pr-3 text-[13px] text-caption">
                    viewers
                </span>
            )}
        </div>
    );
}

interface TimeFieldProps {
    value: number;
    onValue: (value: number) => void;
    label: string;
}

/**
 * Minutes and seconds field, committed on blur so the rows do not reorder while typing. The French iOS keypad
 * has no colon, so "1,30" and "1.30" are accepted too.
 *
 * @param value - Current time in seconds, shown as minutes and seconds
 * @param onValue - Called on blur with a valid new time in seconds, capped to MAX_TIME
 * @param label - Accessible name, since the field has no visible label of its own
 */
function TimeField({ value, onValue, label }: TimeFieldProps) {
    const [draft, setDraft] = useState<string | null>(null);
    const parsed = draft === null ? value : parseClock(draft.replace(/[.,]/g, ":"));

    return (
        <input
            type="text"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            aria-label={label}
            aria-invalid={parsed === null || undefined}
            value={draft ?? formatClock(value)}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => setDraft(event.target.value.replace(/[^\d:.,]/g, "").slice(0, 5))}
            onBlur={() => {
                if (parsed !== null && parsed !== value) onValue(Math.min(parsed, MAX_TIME));
                setDraft(null);
            }}
            onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
            }}
            className={cn(
                FIELD,
                "h-11 w-[76px] shrink-0 px-2 text-center text-base font-semibold text-foreground tabular-nums outline-none",
                parsed === null && FIELD_INVALID,
            )}
        />
    );
}

const HEIGHT = 56;
const INSET = 8;
const TICK_GAP = 36;

/**
 * Smooth area chart of the peak schedule, sized to its container.
 *
 * @param viewers - Audience settings; nothing is drawn while there is no peak
 */
function Curve({ viewers }: { viewers: Viewers }) {
    const box = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(318);

    useEffect(() => {
        const node = box.current;
        if (!node) return;
        const observer = new ResizeObserver(([entry]) => setWidth(Math.max(120, Math.round(entry.contentRect.width))));
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={box} className="mt-1.5 min-h-[76px]">
            {viewers.peaks.length > 0 && <Plot viewers={viewers} width={width} />}
        </div>
    );
}

/**
 * Draws the curve, the peak dots and the time labels for a given width. The count holds the first target until
 * the first peak and the last one after it, and there is one label per peak time: labels that would overlap are
 * skipped, the last one winning over its neighbor.
 *
 * @param viewers - Audience settings with at least one peak
 * @param width - Width of the chart in pixels, measured from its container
 */
function Plot({ viewers, width }: { viewers: Viewers; width: number }) {
    const peaks = [...viewers.peaks].sort((a, b) => a.timeSeconds - b.timeSeconds);
    const last = peaks[peaks.length - 1];
    const end = Math.max(60, last.timeSeconds);
    const low = Math.min(viewers.min, ...peaks.map((peak) => peak.target));
    const high = Math.max(viewers.max, ...peaks.map((peak) => peak.target), low + 1);
    const x = (seconds: number) => INSET + (seconds / end) * (width - 2 * INSET);
    const y = (count: number) => INSET + (1 - (count - low) / (high - low)) * (HEIGHT - 2 * INSET);
    const dots = peaks.map((peak) => ({ x: x(peak.timeSeconds), y: y(peak.target) }));
    const top = peaks.reduce((best, peak, i) => (peak.target > peaks[best].target ? i : best), 0);
    const inRange = (peak: Peak) =>
        viewers.min >= viewers.max || (peak.target >= viewers.min && peak.target <= viewers.max);

    const line = [...dots];
    if (peaks[0].timeSeconds > 0) line.unshift({ x: x(0), y: dots[0].y });
    if (last.timeSeconds < end) line.push({ x: x(end), y: dots[dots.length - 1].y });

    const r = (n: number) => n.toFixed(1);
    let path = `M${r(line[0].x)} ${r(line[0].y)}`;
    for (let i = 1; i < line.length; i++) {
        const mid = (line[i - 1].x + line[i].x) / 2;
        path += ` C${r(mid)} ${r(line[i - 1].y)} ${r(mid)} ${r(line[i].y)} ${r(line[i].x)} ${r(line[i].y)}`;
    }
    const area = `${path} L${r(line[line.length - 1].x)} ${HEIGHT - INSET} L${r(line[0].x)} ${HEIGHT - INSET} Z`;

    const ticks: { seconds: number; x: number }[] = [];
    for (const peak of peaks) {
        const tick = { seconds: peak.timeSeconds, x: x(peak.timeSeconds) };
        const prev = ticks[ticks.length - 1];
        if (!prev || tick.x - prev.x >= TICK_GAP) ticks.push(tick);
        else if (peak === last && ticks.length > 1) ticks[ticks.length - 1] = tick;
    }

    return (
        <>
            <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} aria-hidden="true" className="block">
                <line x1="0" y1="7.5" x2={width} y2="7.5" className="stroke-white/10" strokeDasharray="2 4" />
                <line x1="0" y1="48.5" x2={width} y2="48.5" className="stroke-white/10" strokeDasharray="2 4" />
                <path d={area} className="fill-pink/14" />
                <path
                    d={path}
                    fill="none"
                    className="stroke-pink"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {dots.map((dot, i) =>
                    i === top ? null : (
                        <circle
                            key={i}
                            cx={r(dot.x)}
                            cy={r(dot.y)}
                            r="3.5"
                            strokeWidth="2"
                            className={cn("stroke-ground", inRange(peaks[i]) ? "fill-pink" : "fill-danger")}
                        />
                    ),
                )}
                <circle
                    cx={r(dots[top].x)}
                    cy={r(dots[top].y)}
                    r="4.5"
                    strokeWidth="2.5"
                    className={cn("fill-white", inRange(peaks[top]) ? "stroke-pink" : "stroke-danger")}
                />
            </svg>
            <div
                aria-hidden="true"
                className="relative mt-1.5 h-3.5 text-[11px] leading-[14px] text-caption tabular-nums"
            >
                {ticks.map((tick) => {
                    const atStart = tick.x < 20;
                    const atEnd = !atStart && tick.x > width - 20;
                    return (
                        <span
                            key={tick.seconds}
                            className={cn(
                                "absolute top-0",
                                atStart && "left-0",
                                atEnd && "right-0",
                                !atStart && !atEnd && "-translate-x-1/2",
                            )}
                            style={atStart || atEnd ? undefined : { left: tick.x }}
                        >
                            {formatClock(tick.seconds)}
                        </span>
                    );
                })}
            </div>
        </>
    );
}

interface Row {
    key: number;
    peak: Peak;
}

/**
 * Peak rows from time to viewers, kept sorted by time with stable row keys so inputs keep focus while sorting.
 *
 * @param id - DOM id of the editor, referenced by the button that opens it
 * @param viewers - Audience settings whose peaks are edited, with the bounds used to flag out-of-range targets
 * @param onPeaks - Called with the full updated peak list, sorted by time
 */
function PeakEditor({ id, viewers, onPeaks }: { id: string; viewers: Viewers; onPeaks: (peaks: Peak[]) => void }) {
    const { peaks, min, max } = viewers;
    const [keys, setKeys] = useState(() => peaks.map((_, i) => i));
    const nextKey = useRef(peaks.length);

    const update = (change: (rows: Row[]) => Row[]) => {
        const rows = peaks.map((peak, i) => ({ peak, key: keys[i] ?? nextKey.current++ }));
        const next = change(rows).sort((a, b) => a.peak.timeSeconds - b.peak.timeSeconds);
        setKeys(next.map((row) => row.key));
        onPeaks(next.map((row) => row.peak));
    };

    const edit = (index: number, patch: Partial<Peak>) =>
        update((rows) => rows.map((row, i) => (i === index ? { ...row, peak: { ...row.peak, ...patch } } : row)));

    const add = () =>
        update((rows) => {
            const after = Math.max(0, ...rows.map((row) => row.peak.timeSeconds));
            const peak = { timeSeconds: Math.min(after + 60, MAX_TIME), target: clamp(Math.round(max / 2), min, max) };
            return [...rows, { key: nextKey.current++, peak }];
        });

    return (
        <div id={id} className="mt-2.5 border-t border-hairline pt-2.5">
            <div aria-hidden="true" className="mb-2 flex gap-2 text-xs text-caption">
                <span className="w-[76px] text-center">Moment</span>
                <span className="w-4" />
                <span className="pl-3.5">Viewers</span>
            </div>
            <ul className="flex flex-col gap-2">
                {peaks.map((peak, i) => {
                    const clock = formatClock(peak.timeSeconds);
                    return (
                        <li key={keys[i] ?? -1 - i} className="flex items-center gap-2">
                            <TimeField
                                value={peak.timeSeconds}
                                onValue={(seconds) => edit(i, { timeSeconds: seconds })}
                                label={`Moment du pic ${i + 1} (minutes:secondes)`}
                            />
                            <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-caption" />
                            <NumberField
                                value={peak.target}
                                onValue={(target) => edit(i, { target })}
                                label={`Viewers au pic ${i + 1}`}
                                invalid={min < max && (peak.target < min || peak.target > max)}
                                suffix={false}
                                className="flex-1"
                            />
                            <button
                                type="button"
                                aria-label={`Supprimer le pic à ${clock}`}
                                disabled={peaks.length <= 1}
                                onClick={() => update((rows) => rows.filter((_, index) => index !== i))}
                                className="flex size-11 shrink-0 items-center justify-center rounded-xl text-caption transition-colors outline-none hover:text-danger focus-visible:ring-2 focus-visible:ring-pink disabled:pointer-events-none disabled:opacity-35"
                            >
                                <Trash2 className="size-[18px]" />
                            </button>
                        </li>
                    );
                })}
            </ul>
            <button
                type="button"
                onClick={add}
                disabled={peaks.length >= MAX_PEAKS}
                className="mt-1 -ml-2 flex h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-pink outline-none focus-visible:ring-2 focus-visible:ring-pink disabled:opacity-40"
            >
                <Plus className="size-[18px]" />
                Ajouter un pic
            </button>
            <p className="mt-1 text-xs text-caption">Le compteur part du premier pic puis glisse d’un pic à l’autre.</p>
        </div>
    );
}

/**
 * Config tab for the audience: scenario presets, viewer bounds, peak schedule with its curve, and the speed of
 * the fluctuations. The bounds rescale the peaks from their value when the field got focus, not cumulatively per
 * keystroke. The scenario chips form one scrollable row, because wrapping when "Perso" appears would push the
 * fields below while typing, and the selected scenario is kept in view on narrow screens.
 *
 * @param config - Live config being edited; its viewers section is read
 * @param onChange - Called with the whole updated config on every edit
 */
export function AudienceTab({ config, onChange }: Props) {
    const { viewers } = config;
    const id = useId();
    const [editing, setEditing] = useState(false);
    const base = useRef<Viewers | null>(null);
    const scenarios = useRef<HTMLDivElement>(null);

    const preset = matchPreset(config);
    const error = audienceError(viewers);
    const boundsInvalid = viewers.min >= viewers.max;
    const top = viewers.peaks.reduce<Peak | null>(
        (best, peak) => (!best || peak.target > best.target ? peak : best),
        null,
    );
    const speed = `${formatDecimal(viewers.fluctuationSpeed)}×`;

    useEffect(() => {
        scenarios.current?.querySelector<HTMLElement>("[data-state=checked]")?.scrollIntoView({
            block: "nearest",
            inline: "nearest",
        });
    }, [preset]);

    const setViewers = (next: Viewers) => onChange({ ...config, viewers: next });

    const setBound = (key: "min" | "max", value: number) => {
        const next = { ...viewers, [key]: value };
        setViewers(withPeaks(next, rescale(base.current ?? viewers, next.min, next.max)));
    };

    const pickPreset = (value: string) => {
        if (PRESET_IDS.includes(value as PresetId)) onChange(applyPreset(config, value as PresetId));
    };

    const bound = (key: "min" | "max", label: string) => (
        <div className="min-w-0">
            <label htmlFor={`${id}-${key}`} className={cn(LABEL, "mb-1 block text-soft")}>
                {label}
            </label>
            <NumberField
                id={`${id}-${key}`}
                value={viewers[key]}
                onValue={(value) => setBound(key, value)}
                invalid={boundsInvalid}
                describedBy={error ? `${id}-error` : undefined}
                onFocus={() => {
                    base.current = viewers;
                }}
                onBlur={() => {
                    base.current = null;
                }}
            />
        </div>
    );

    return (
        <div className={SECTIONS}>
            <div>
                <div id={`${id}-scenario`} className={cn(LABEL, "mb-2")}>
                    Scénario
                </div>
                <RadioGroup.Root
                    ref={scenarios}
                    value={preset ?? "perso"}
                    onValueChange={pickPreset}
                    orientation="horizontal"
                    aria-labelledby={`${id}-scenario`}
                    className="-m-1 flex gap-2 overflow-x-auto p-1"
                >
                    {PRESET_IDS.map((presetId) => (
                        <RadioGroup.Item key={presetId} value={presetId} className={CHIP}>
                            {PRESETS[presetId].label}
                        </RadioGroup.Item>
                    ))}
                    {preset === null && (
                        <RadioGroup.Item value="perso" disabled className={cn(CHIP, "cursor-default")}>
                            Perso
                        </RadioGroup.Item>
                    )}
                </RadioGroup.Root>
            </div>

            <div>
                <div className="grid grid-cols-2 gap-3">
                    {bound("min", "Minimum")}
                    {bound("max", "Maximum")}
                </div>
                <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-danger empty:hidden">
                    {error}
                </p>
            </div>

            <div>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className={LABEL}>Courbe d’audience</p>
                        <p className="text-xs leading-4 text-caption tabular-nums">
                            {top
                                ? `Pic de ${formatNumber(top.target)} viewers à ${formatClock(top.timeSeconds)}`
                                : "Aucun pic pour l’instant"}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-expanded={editing}
                        aria-controls={editing ? `${id}-editor` : undefined}
                        onClick={() => setEditing(!editing)}
                        className="-my-3 -mr-2.5 flex h-11 shrink-0 items-center gap-1.5 rounded-[10px] px-2.5 text-[13px] font-semibold text-pink outline-none focus-visible:ring-2 focus-visible:ring-pink"
                    >
                        {editing ? <Check className="size-[15px]" /> : <Pencil className="size-[15px]" />}
                        {editing ? "Terminé" : "Modifier les pics"}
                    </button>
                </div>
                <Curve viewers={viewers} />
                {editing && (
                    <PeakEditor
                        id={`${id}-editor`}
                        viewers={viewers}
                        onPeaks={(peaks) => setViewers(withPeaks(viewers, peaks))}
                    />
                )}
            </div>

            <div>
                <div className="flex items-baseline justify-between">
                    <span className={LABEL}>Variations</span>
                    <span className={VALUE}>{speed}</span>
                </div>
                <Range
                    value={viewers.fluctuationSpeed}
                    min={0.2}
                    max={3}
                    step={0.1}
                    onChange={(fluctuationSpeed) => setViewers({ ...viewers, fluctuationSpeed })}
                    label="Variations"
                    valueText={speed}
                />
                <div className="flex justify-between text-xs text-caption">
                    <span>Douces</span>
                    <span>Fortes</span>
                </div>
            </div>
        </div>
    );
}
