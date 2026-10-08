import { ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { BUTTON, CONTAINER, FOCUS_ON_INK } from "@/components/landing/section";

/**
 * Closing call-to-action card: big title, short lead and a button that opens the simulator, with a note about the
 * phone-first experience.
 */
export function Cta() {
    const t = useTranslations("landing.cta");

    return (
        <section aria-labelledby="cta-title">
            <div className={`${CONTAINER} pt-[clamp(56px,8vw,112px)] pb-[clamp(40px,5vw,64px)]`}>
                <div className="relative overflow-hidden rounded-[28px] bg-tile-ink dark:ring-1 dark:ring-line-soft px-[clamp(24px,6vw,96px)] py-[clamp(40px,8vw,112px)] text-on-ink max-md:pb-40 sm:rounded-[40px]">
                    <div
                        aria-hidden="true"
                        className="absolute -right-20 -bottom-28 size-56 rounded-full panel-gradient md:-right-[140px] md:-bottom-[190px] md:size-[480px]"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute -right-10 -bottom-16 hidden size-80 rounded-full border-2 border-white/35 md:block md:-right-[60px] md:-bottom-[110px]"
                    />
                    <div className="relative">
                        <h2
                            id="cta-title"
                            className="max-w-[1000px] font-display text-[clamp(2.5rem,9vw,8rem)] leading-[0.92] font-extrabold tracking-[-0.03em] text-balance"
                        >
                            {t.rich("title", {
                                hl: (chunks) => <span className="text-highlight">{chunks}</span>,
                            })}
                        </h2>
                        <p className="mt-7 max-w-[520px] text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-on-ink-soft">
                            {t("lead")}
                        </p>
                        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                            <Link
                                href="/app/"
                                className={`${BUTTON} h-14 gap-3 bg-white px-[30px] text-[17px] text-ground ${FOCUS_ON_INK}`}
                            >
                                {t("button")}
                                <ArrowRight aria-hidden="true" className="size-5" />
                            </Link>
                            <p className="flex max-w-[340px] items-start gap-2.5 text-sm leading-[1.4] text-on-ink-soft md:max-w-none md:items-center">
                                <Smartphone aria-hidden="true" className="mt-px size-[18px] flex-none md:mt-0" />
                                {t("note")}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
