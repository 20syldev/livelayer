"use client";

import { useFormatter, useTranslations } from "next-intl";
import { type ReactNode, useEffect, useId, useState } from "react";

import { CONTAINER, FOCUS, SectionHead } from "@/components/landing/section";
import { Comment } from "@/components/live/comment";
import { HeartGlyph } from "@/components/live/icons";
import { type Language, liveStrings } from "@/data/live";
import { PRESET_IDS, type PresetId } from "@/data/presets";
import { useInView } from "@/hooks/inview";
import { useLanguage } from "@/hooks/language";
import { useReducedMotion } from "@/hooks/motion";
import { CHART, CHARTS, clock, fixed } from "@/lib/chart";
import { SAMPLE_FEED, sampleEntry } from "@/lib/sample";

const DURATIONS = [5, 15, 30, 0] as const;

const HEARTS = [
    { id: "heartRed", color: "var(--color-like)", swatch: "bg-like" },
    { id: "heartPink", color: "var(--color-pink)", swatch: "bg-pink" },
    { id: "heartYellow", color: "var(--color-highlight)", swatch: "bg-highlight" },
    { id: "heartGreen", color: "var(--color-success)", swatch: "bg-success" },
    { id: "heartBlue", color: "var(--color-live-link)", swatch: "bg-live-link" },
] as const;

// Hearts fade out under the top edge of their box (rise-fade), so the resting positions stay below that fade
const RISING = [
    {
        box: "left-[8%] size-[34px]",
        size: 34,
        stroke: 1.4,
        animate: "motion-safe:animate-[bento-rise_4.2s_linear_infinite] [--dir:1] motion-safe:[animation-delay:0s]",
        still: "motion-reduce:-translate-y-5",
    },
    {
        box: "left-[26%] size-[24px]",
        size: 24,
        stroke: 1.6,
        animate: "motion-safe:animate-[bento-rise_4.2s_linear_infinite] [--dir:-1] motion-safe:[animation-delay:-1.4s]",
        still: "motion-reduce:-translate-y-20",
    },
    {
        box: "left-[44%] size-[40px]",
        size: 40,
        stroke: 1.2,
        animate: "motion-safe:animate-[bento-rise_4.2s_linear_infinite] [--dir:1] motion-safe:[animation-delay:-2.8s]",
        still: "motion-reduce:-translate-y-12",
    },
    {
        box: "left-[64%] size-[28px]",
        size: 28,
        stroke: 1.5,
        animate: "motion-safe:animate-[bento-rise_4.2s_linear_infinite] [--dir:-1] motion-safe:[animation-delay:-0.7s]",
        still: "motion-reduce:-translate-y-24",
    },
    {
        box: "left-[82%] size-[32px]",
        size: 32,
        stroke: 1.4,
        animate: "motion-safe:animate-[bento-rise_4.2s_linear_infinite] [--dir:1] motion-safe:[animation-delay:-2.1s]",
        still: "motion-reduce:-translate-y-8",
    },
] as const;

const LANGUAGE_SAMPLE = [SAMPLE_FEED[0], SAMPLE_FEED[2], SAMPLE_FEED[5]];

const VISIBLE = 5;
const TICK_MS = 2400;

interface TileProps {
    title: string;
    tone: string;
    text?: string;
    textClass?: string;
    aside?: ReactNode;
    className?: string;
    heading?: string;
    children?: ReactNode;
}

/**
 * Rounded card of the feature grid: heading, optional text and an optional aside, then the tile's own interactive
 * content. The section is labelled by its heading, and the content wrapper uses display contents so children take part
 * in the card layout.
 *
 * @param title - Heading text, also the accessible name of the section
 * @param tone - Background and token-scope classes of the card
 * @param text - Paragraph under the heading, omitted when the tile has none
 * @param textClass - Classes of that paragraph, to adapt spacing and color to the tone
 * @param aside - Element aligned to the right of the heading, such as the camera preview
 * @param className - Extra classes of the card, mostly grid spans
 * @param heading - Classes of the heading that set its responsive size
 * @param children - Tile content placed under the heading
 */
function Tile({
    title,
    tone,
    text,
    textClass = "mt-2.5 text-[15px] leading-[1.5] text-soft",
    aside,
    className = "",
    heading = "text-[28px] md:text-[30px]",
    children,
}: TileProps) {
    const id = useId();
    return (
        <section
            aria-labelledby={id}
            className={`flex min-w-0 flex-col rounded-[28px] p-6 md:rounded-[36px] md:p-8 ${tone} ${className}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 id={id} className={`font-display leading-[1.02] font-extrabold tracking-[-0.02em] ${heading}`}>
                        {title}
                    </h3>
                    {text && <p className={textClass}>{text}</p>}
                </div>
                {aside}
            </div>
            <div className="visual contents">{children}</div>
        </section>
    );
}

interface ChipOption<T> {
    value: T;
    label: string;
    name?: string;
}

interface ChipsProps<T> {
    label: string;
    options: ChipOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

/**
 * Row of toggle chips acting as a single-choice group. The pressed chip is inverted, and a chip can carry an accessible
 * name when its visible label is short, such as FR.
 *
 * @param label - Accessible name of the whole group
 * @param options - Chips to render, each with the value it selects, its visible label and an optional accessible name
 * @param value - Currently selected value, compared strictly with each option
 * @param onChange - Called with the value of the clicked chip, even when it is already selected
 * @param className - Extra classes of the group, mostly vertical spacing
 */
function Chips<T extends string | number>({ label, options, value, onChange, className = "" }: ChipsProps<T>) {
    return (
        <div role="group" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={option.value === value}
                    aria-label={option.name}
                    onClick={() => onChange(option.value)}
                    className={`h-11 rounded-full border-2 border-line bg-transparent px-[18px] text-[15px] font-bold whitespace-nowrap text-ink transition-colors aria-pressed:bg-ink aria-pressed:text-paper motion-reduce:transition-none ${FOCUS}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

/**
 * Audience tile: scenario chips and a chart of the audience curve for the chosen scenario, with its peak, its range and
 * a time axis. The chart is announced through one aria-label because its marks are decorative.
 */
function AudienceTile() {
    const t = useTranslations("landing.bento");
    const format = useFormatter();
    const [scenario, setScenario] = useState<PresetId>("createur");
    const chart = CHARTS[scenario];
    const names: Record<PresetId, string> = {
        potes: t("scenarioPotes"),
        createur: t("scenarioCreateur"),
        viral: t("scenarioViral"),
    };
    const min = format.number(chart.min, { useGrouping: "always" });
    const max = format.number(chart.max, { useGrouping: "always" });
    const peak = format.number(chart.peak, { useGrouping: "always" });

    return (
        <Tile
            title={t("audienceTitle")}
            text={t("audienceText")}
            textClass="mt-3 max-w-[520px] text-base leading-[1.55] text-soft"
            tone="tile-scope bg-tile-yellow"
            heading="text-[28px] md:text-[clamp(28px,3vw,38px)]"
            className="md:col-span-2 lg:col-span-1 lg:row-span-2"
        >
            <Chips
                label={t("scenarioLabel")}
                value={scenario}
                onChange={setScenario}
                options={PRESET_IDS.map((id) => ({ value: id, label: names[id] }))}
                className="mt-[22px]"
            />
            <div className="mt-[18px] rounded-[26px] border-2 border-line bg-paper p-5 pb-4 text-ink">
                <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
                    <div>
                        <div className="font-display text-[44px] leading-none font-extrabold tracking-[-0.03em] whitespace-nowrap tabular-nums">
                            {peak}
                        </div>
                        <div className="mt-1 text-[13px] font-bold text-quiet">{t("peakCaption")}</div>
                    </div>
                    <div className="text-[13px] font-bold whitespace-nowrap text-soft tabular-nums">
                        {t("range", { min, max })}
                    </div>
                </div>
                <svg
                    viewBox={`0 0 ${CHART.width} 220`}
                    role="img"
                    aria-label={t("chartLabel", { scenario: names[scenario], min, max, peak })}
                    className="mt-3 block h-auto w-full overflow-visible"
                >
                    {[CHART.top, (CHART.top + CHART.bottom) / 2].map((y) => (
                        <line
                            key={y}
                            x1={CHART.left}
                            x2={CHART.right}
                            y1={y}
                            y2={y}
                            strokeWidth={2}
                            strokeDasharray="4 8"
                            strokeLinecap="round"
                            className="stroke-line-soft"
                        />
                    ))}
                    <line
                        x1={CHART.left}
                        x2={CHART.right}
                        y1={CHART.bottom}
                        y2={CHART.bottom}
                        strokeWidth={2}
                        strokeLinecap="round"
                        className="stroke-line"
                    />
                    <path d={chart.area} className="fill-brand/15" />
                    <path
                        d={chart.line}
                        fill="none"
                        strokeWidth={5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="stroke-brand"
                    />
                    {chart.points.slice(1).map((point, i) => (
                        <circle
                            key={point.seconds}
                            cx={fixed(point.x)}
                            cy={fixed(point.y)}
                            r={i + 1 === chart.top ? 10 : 7}
                            strokeWidth={3}
                            className="fill-paper stroke-line"
                        />
                    ))}
                </svg>
                <div aria-hidden="true" className="relative mt-1.5 h-4 text-xs font-bold text-quiet">
                    {chart.points.map((point, i) => (
                        <span
                            key={point.seconds}
                            className="absolute -translate-x-1/2 whitespace-nowrap tabular-nums"
                            style={{ left: `${(point.x / CHART.width) * 100}%` }}
                        >
                            {i === 0 ? t("axisStart") : clock(point.seconds)}
                        </span>
                    ))}
                </div>
            </div>
        </Tile>
    );
}

/**
 * Camera tile: a miniature phone preview and a switch that turns the fake camera feed on or off, to show that the
 * simulator works with or without a camera.
 */
function CameraTile() {
    const t = useTranslations("landing.bento");
    const language = useLanguage();
    const [on, setOn] = useState(true);

    const preview = (
        <div
            aria-hidden="true"
            className="relative h-[150px] w-[104px] flex-none overflow-hidden rounded-[22px] border-2 border-line bg-live-fallback"
        >
            <div
                className={`absolute inset-0 bg-scene-camera transition-opacity motion-reduce:transition-none ${on ? "opacity-100" : "opacity-0"}`}
            />
            <span className="absolute top-2 left-2 rounded-[3px] bg-live-badge px-[5px] py-0.5 text-[8px] leading-3 font-bold tracking-[0.4px] text-white">
                {liveStrings(language).live}
            </span>
        </div>
    );

    return (
        <Tile title={t("cameraTitle")} text={t("cameraText")} tone="tile-scope bg-tile-mint" aside={preview}>
            <div className="mt-auto pt-[22px]">
                <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={t("cameraSwitch")}
                    onClick={() => setOn(!on)}
                    className={`group inline-flex min-h-11 items-center gap-3.5 text-base font-bold text-ink ${FOCUS}`}
                >
                    <span
                        aria-hidden="true"
                        className="relative block h-8 w-14 flex-none rounded-full border-2 border-line bg-paper transition-colors group-aria-checked:bg-ink motion-reduce:transition-none"
                    >
                        <span className="absolute top-[3px] left-[3px] size-[22px] rounded-full bg-ink transition-transform group-aria-checked:translate-x-6 group-aria-checked:bg-paper motion-reduce:transition-none" />
                    </span>
                    <span aria-hidden="true">{on ? t("cameraOn") : t("cameraOff")}</span>
                </button>
            </div>
        </Tile>
    );
}

/**
 * Duration tile: chips for the length of the live (or unlimited) and a summary card that says when it will end.
 */
function DurationTile() {
    const t = useTranslations("landing.bento");
    const [minutes, setMinutes] = useState<number>(15);

    return (
        <Tile title={t("durationTitle")} tone="tile-scope bg-tile-peach">
            <Chips
                label={t("durationLabel")}
                value={minutes}
                onChange={setMinutes}
                options={DURATIONS.map((value) => ({
                    value,
                    label: value ? t("durationMinutes", { minutes: value }) : t("durationUnlimited"),
                }))}
                className="mt-4"
            />
            <div className="mt-4 flex items-center gap-3 rounded-[18px] bg-ground px-3.5 py-3 text-on-ink">
                <span
                    aria-hidden="true"
                    className="panel-gradient flex size-9 flex-none items-center justify-center rounded-full"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                    </svg>
                </span>
                <div className="min-w-0">
                    <div className="text-sm leading-[1.3] font-bold">
                        {minutes ? t("durationEndTitle") : t("durationOpenTitle")}
                    </div>
                    <div className="text-xs leading-[1.4] text-on-ink-soft">
                        {minutes ? t("durationEndText", { minutes, time: clock(minutes * 60) }) : t("durationOpenText")}
                    </div>
                </div>
            </div>
        </Tile>
    );
}

/**
 * Comments tile: a list of sample comments that scrolls by one entry every 2.4 s while the tile is on screen and
 * motion is allowed. The list is decorative, so it is hidden from assistive technology.
 */
function ArrivalsTile() {
    const t = useTranslations("landing.bento");
    const language = useLanguage();
    const [ref, inView] = useInView<HTMLDivElement>();
    const reduced = useReducedMotion();
    const [count, setCount] = useState(VISIBLE);

    useEffect(() => {
        if (!inView || reduced) return;
        const timer = setInterval(() => setCount((n) => n + 1), TICK_MS);
        return () => clearInterval(timer);
    }, [inView, reduced]);

    const entries = Array.from({ length: VISIBLE }, (_, k) => {
        const n = count - VISIBLE + k;
        return sampleEntry(SAMPLE_FEED[n % SAMPLE_FEED.length], `arrival-${n}`, language);
    });

    return (
        <Tile
            title={t("commentsTitle")}
            text={t("commentsText")}
            textClass="mt-2.5 text-[15px] leading-[1.5] text-on-ink-soft"
            tone="bg-tile-ink text-on-ink dark:ring-1 dark:ring-line-soft"
            className="md:col-span-2 lg:col-span-1"
        >
            <div
                ref={ref}
                aria-hidden="true"
                className="comment-fade mt-[22px] flex h-[212px] flex-col justify-end gap-3.5 overflow-hidden font-live"
            >
                {entries.map((entry) => (
                    <Comment key={entry.id} entry={entry} language={language} />
                ))}
            </div>
        </Tile>
    );
}

/**
 * Hearts tile: swatches that pick the color of the hearts and a field of hearts rising in a loop, which only animates
 * while it is on screen. Under reduced motion the hearts stay still at staggered heights.
 */
function HeartsTile() {
    const t = useTranslations("landing.bento");
    const [choice, setChoice] = useState(0);
    const [ref, inView] = useInView<HTMLDivElement>();

    return (
        <Tile title={t("heartsTitle")} text={t("heartsText")} tone="tile-scope bg-tile-lilac">
            <div role="group" aria-label={t("heartsLabel")} className="mt-4 flex flex-wrap gap-1">
                {HEARTS.map((heart, i) => (
                    <button
                        key={heart.id}
                        type="button"
                        aria-label={t(heart.id)}
                        aria-pressed={i === choice}
                        onClick={() => setChoice(i)}
                        className={`flex size-11 items-center justify-center rounded-full border-2 border-transparent aria-pressed:border-line ${FOCUS}`}
                    >
                        <span className={`block size-7 rounded-full border-2 border-line ${heart.swatch}`} />
                    </button>
                ))}
            </div>
            <div
                ref={ref}
                aria-hidden="true"
                className="rise-fade relative mt-auto h-[172px] overflow-hidden pt-6 text-ink"
            >
                {RISING.map((heart) => (
                    <div
                        key={heart.box}
                        className={`absolute bottom-0 ${heart.box} ${heart.animate} ${heart.still} ${
                            inView
                                ? "motion-safe:[animation-play-state:running]"
                                : "motion-safe:[animation-play-state:paused]"
                        }`}
                    >
                        <HeartGlyph
                            size={heart.size}
                            color={HEARTS[choice].color}
                            stroke="currentColor"
                            strokeWidth={heart.stroke}
                        />
                    </div>
                ))}
            </div>
        </Tile>
    );
}

/**
 * Languages tile: chips for the language of the comments and a sample of three comments rendered in the chosen one.
 * It starts on the language of the page.
 */
function LanguagesTile() {
    const t = useTranslations("landing.bento");
    const pageLanguage = useLanguage();
    const [language, setLanguage] = useState<Language>(pageLanguage);

    return (
        <Tile title={t("langTitle")} text={t("langText")} tone="tile-scope bg-tile-sky">
            <Chips
                label={t("langLabel")}
                value={language}
                onChange={setLanguage}
                options={[
                    { value: "fr", label: "FR", name: t("langFr") },
                    { value: "en", label: "EN", name: t("langEn") },
                    { value: "es", label: "ES", name: t("langEs") },
                ]}
                className="mt-4 mb-5"
            />
            <div lang={language} className="mt-auto flex flex-col gap-3 rounded-3xl bg-ground p-4 font-live">
                {LANGUAGE_SAMPLE.map((seed) => (
                    <Comment key={seed.user} entry={sampleEntry(seed, seed.user, language)} language={language} />
                ))}
            </div>
        </Tile>
    );
}

/**
 * Features section: two rows of interactive tiles (audience, camera, duration, comments, hearts, languages) that let
 * visitors try each option of the simulator.
 */
export function Bento() {
    const t = useTranslations("landing.bento");

    return (
        <section id="features" aria-labelledby="features-title" className="scroll-mt-24">
            <div className={`${CONTAINER} pb-[clamp(72px,10vw,136px)]`}>
                <SectionHead
                    id="features-title"
                    pill={t("pill")}
                    title={t("title")}
                    intro={t("intro")}
                    tone="bg-tile-lilac"
                    tilt="-rotate-[1.5deg]"
                />

                <div className="mt-[clamp(40px,5vw,64px)] flex flex-col gap-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.8fr_1fr]">
                        <AudienceTile />
                        <CameraTile />
                        <DurationTile />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr]">
                        <ArrivalsTile />
                        <HeartsTile />
                        <LanguagesTile />
                    </div>
                </div>
            </div>
        </section>
    );
}
