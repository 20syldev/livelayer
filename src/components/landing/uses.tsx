import { FlaskConical, GraduationCap, type LucideIcon, MonitorPlay, Target } from "lucide-react";
import { useTranslations } from "next-intl";

import { SectionHead } from "@/components/landing/section";

const items: {
    id: "demos" | "tests" | "practice" | "talks";
    icon: LucideIcon;
    tile: string;
    card: string;
    tilt: string;
}[] = [
    { id: "demos", icon: MonitorPlay, tile: "bg-tile-yellow", card: "dark:bg-tile-yellow", tilt: "-rotate-[1.2deg]" },
    { id: "tests", icon: FlaskConical, tile: "bg-tile-mint", card: "dark:bg-tile-mint", tilt: "rotate-1" },
    { id: "practice", icon: Target, tile: "bg-tile-lilac", card: "dark:bg-tile-lilac", tilt: "-rotate-[0.8deg]" },
    { id: "talks", icon: GraduationCap, tile: "bg-tile-peach", card: "dark:bg-tile-peach", tilt: "rotate-[1.2deg]" },
];

/**
 * Section listing the four intended uses of the simulator (demos, tests, practice, talks) as tilted cards.
 */
export function Uses() {
    const t = useTranslations("landing.uses");

    return (
        <section id="uses" aria-labelledby="uses-title" className="scroll-mt-24 px-[clamp(8px,2vw,24px)]">
            <div className="mx-auto w-full max-w-[1360px] rounded-[40px] bg-tile dark:ring-1 dark:ring-line-soft px-[clamp(20px,5vw,72px)] pt-[clamp(48px,7vw,96px)] pb-[clamp(56px,8vw,104px)]">
                <div className="mx-auto max-w-[1200px]">
                    <SectionHead
                        id="uses-title"
                        pill={t("pill")}
                        title={t("title")}
                        intro={t("intro")}
                        tone="bg-tile-yellow"
                        tilt="-rotate-2"
                    />

                    <ul className="mt-[clamp(40px,5vw,64px)] grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-6 gap-y-7 pb-3">
                        {items.map(({ id, icon: Icon, tile, card, tilt }) => (
                            <li
                                key={id}
                                className={`tile-scope flex min-h-0 flex-col sm:min-h-[340px] rounded-[32px] border-2 border-line bg-paper ${card} p-7 shadow-[6px_6px_0_var(--hard)] motion-safe:transition-[translate] motion-safe:duration-200 motion-safe:hover:-translate-y-1 ${tilt}`}
                            >
                                <div
                                    className={`flex size-[60px] items-center justify-center rounded-[20px] border-2 border-line text-ink ${tile} dark:bg-paper`}
                                >
                                    <Icon size={28} strokeWidth={2} aria-hidden="true" />
                                </div>
                                <h3 className="mt-6 font-display text-[32px] leading-none font-extrabold tracking-[-0.01em] text-ink">
                                    {t(`${id}.title`)}
                                </h3>
                                <p className="mt-3 text-base leading-[1.55] text-soft">{t(`${id}.text`)}</p>
                                <p className="mt-auto pt-6 text-[13px] font-extrabold tracking-[0.04em] text-ink uppercase">
                                    {t(`${id}.tags`)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
