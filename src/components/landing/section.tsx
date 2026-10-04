import type { ReactNode } from "react";

export const FOCUS = "outline-brand focus-visible:outline-3 focus-visible:outline-offset-3";
export const FOCUS_ON_INK = "outline-highlight focus-visible:outline-3 focus-visible:outline-offset-3";
export const CONTAINER = "mx-auto w-full max-w-[1280px] px-[clamp(16px,4vw,40px)]";
export const BUTTON =
    "inline-flex items-center justify-center rounded-full font-bold whitespace-nowrap motion-safe:transition-transform motion-safe:hover:-translate-y-0.5";
export const TITLE =
    "font-display text-[clamp(40px,6vw,80px)] leading-[0.98] font-extrabold tracking-[-0.02em] text-ink";

interface PillProps {
    tone: string;
    tilt: string;
    children: ReactNode;
}

interface SectionHeadProps {
    id: string;
    tone: string;
    tilt: string;
    title: string;
    intro: string;
    pill: string;
}

/**
 * Tilted sticker label shown above a section title, so sections read as a stack of paper tiles.
 *
 * @param tone - Background class of the pill, resolved by the tile-scope token set (a bg-tile-* class)
 * @param tilt - Rotation class that gives the sticker look, kept small so the text stays readable
 * @param children - Short uppercase label, rendered inside the pill
 */
export function Pill({ tone, tilt, children }: PillProps) {
    return (
        <p
            className={`tile-scope inline-block rounded-full border-2 border-line px-4 py-2 text-[13px] leading-none font-extrabold tracking-[0.08em] text-ink uppercase ${tone} ${tilt}`}
        >
            {children}
        </p>
    );
}

/**
 * Header shared by the landing sections: pill and title on one side, intro paragraph on the other, wrapping on narrow
 * screens.
 *
 * @param id - DOM id of the h2, referenced by the section's aria-labelledby
 * @param pill - Label of the pill above the title
 * @param title - Heading text of the section, rendered inside the h2
 * @param intro - Short paragraph aligned to the baseline of the title
 * @param tone - Background class forwarded to the pill
 * @param tilt - Rotation class forwarded to the pill
 */
export function SectionHead({ id, pill, title, intro, tone, tilt }: SectionHeadProps) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
            <div className="min-w-0 flex-[3_1_320px] md:basis-[520px]">
                <Pill tone={tone} tilt={tilt}>
                    {pill}
                </Pill>
                <h2 id={id} className={`mt-6 ${TITLE}`}>
                    {title}
                </h2>
            </div>
            <p className="max-w-[440px] flex-[1_1_320px] text-lg leading-[1.55] text-soft">{intro}</p>
        </div>
    );
}
