import { PRESET_IDS, type PresetId, PRESETS } from "@/data/presets";

export const CHART = { width: 560, left: 24, right: 536, top: 36, bottom: 196 } as const;

export interface ChartPoint {
    x: number;
    y: number;
    target: number;
    seconds: number;
}

export interface Chart {
    line: string;
    area: string;
    points: ChartPoint[];
    top: number;
    peak: number;
    min: number;
    max: number;
}

/**
 * Formats a coordinate with a single decimal, enough precision for SVG path data.
 *
 * @param n - Coordinate in SVG user units
 * @returns The coordinate as a string with one decimal
 */
export const fixed = (n: number) => n.toFixed(1);

/**
 * Builds the audience curve of a preset as SVG paths: cubic segments with flat tangents at
 * every local extreme, so the curve never overshoots a peak.
 *
 * @param id - Preset whose viewer peaks are plotted inside the CHART frame
 * @returns The line and closed area paths, the plotted points and the index of the highest peak (first one on a tie)
 */
function buildChart(id: PresetId): Chart {
    const { peaks, min, max } = PRESETS[id].viewers;
    const last = peaks[peaks.length - 1].timeSeconds;
    const points = peaks.map((p) => ({
        x: CHART.left + ((CHART.right - CHART.left) * p.timeSeconds) / last,
        y: CHART.bottom - (p.target / max) * (CHART.bottom - CHART.top),
        target: p.target,
        seconds: p.timeSeconds,
    }));
    const slope = (i: number) => (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x);
    const tangents = points.map((_, i) => {
        if (i === 0) return slope(0);
        if (i === points.length - 1) return slope(i - 1);
        const before = slope(i - 1);
        const after = slope(i);
        return before * after <= 0 ? 0 : (2 * before * after) / (before + after);
    });

    let line = `M${fixed(points[0].x)} ${fixed(points[0].y)}`;
    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];
        const reach = (b.x - a.x) / 3;
        line += ` C${fixed(a.x + reach)} ${fixed(a.y + tangents[i] * reach)} ${fixed(b.x - reach)} ${fixed(b.y - tangents[i + 1] * reach)} ${fixed(b.x)} ${fixed(b.y)}`;
    }

    const peak = Math.max(...peaks.map((p) => p.target));
    return {
        line,
        area: `${line} L${CHART.right} ${CHART.bottom} L${CHART.left} ${CHART.bottom} Z`,
        points,
        top: points.findIndex((p) => p.target === peak),
        peak,
        min,
        max,
    };
}

// Chart geometry of every preset, computed once at module load
export const CHARTS = Object.fromEntries(PRESET_IDS.map((id) => [id, buildChart(id)])) as Record<PresetId, Chart>;

/**
 * Formats a duration as m:ss for the chart axis.
 *
 * @param seconds - Whole seconds, zero or more
 * @returns The duration as m:ss, minutes unpadded ("1:05")
 */
export function clock(seconds: number): string {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
