"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Accordion } from "radix-ui";

import { FOCUS, Pill, TITLE } from "@/components/landing/section";

const ids = ["what", "real", "exit", "data", "iphone"] as const;

/**
 * Accordion of frequently asked questions. A single item is open at a time and the first one starts open, so the
 * most common answer is visible without a click.
 */
export function Faq() {
    const t = useTranslations("landing.faq");

    return (
        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 px-[clamp(8px,2vw,24px)]">
            <div className="mx-auto w-full max-w-[1360px] rounded-[40px] bg-tile dark:ring-1 dark:ring-line-soft px-[clamp(20px,5vw,72px)] py-[clamp(48px,7vw,96px)]">
                <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-x-[72px] gap-y-10">
                    <div className="min-w-0 flex-[1_1_300px]">
                        <Pill tone="bg-tile-pink" tilt="-rotate-2">
                            {t("pill")}
                        </Pill>
                        <h2 id="faq-title" className={`mt-6 ${TITLE}`}>
                            {t("title")}
                        </h2>
                        <p className="mt-5 max-w-[360px] text-lg leading-[1.55] text-soft">{t("intro")}</p>
                    </div>

                    <Accordion.Root
                        type="single"
                        collapsible
                        defaultValue={ids[0]}
                        className="min-w-0 flex-[2_1_520px] border-t-2 border-rule"
                    >
                        {ids.map((id) => (
                            <Accordion.Item key={id} value={id} className="group border-b-2 border-rule">
                                <Accordion.Header className="m-0">
                                    <Accordion.Trigger
                                        className={`flex min-h-11 w-full items-center justify-between gap-5 py-6 text-left font-display text-[clamp(20px,2.2vw,26px)] leading-[1.15] font-extrabold tracking-[-0.01em] text-ink ${FOCUS}`}
                                    >
                                        <span>{t(`${id}.q`)}</span>
                                        <span
                                            aria-hidden="true"
                                            className="tile-scope flex size-11 flex-none items-center justify-center rounded-full border-2 border-line bg-paper text-ink group-data-[state=open]:bg-highlight group-data-[state=open]:text-on-highlight group-data-[state=open]:rotate-45 motion-safe:transition-transform motion-safe:duration-200"
                                        >
                                            <Plus size={20} strokeWidth={2.6} />
                                        </span>
                                    </Accordion.Trigger>
                                </Accordion.Header>
                                <Accordion.Content className="overflow-hidden motion-safe:data-[state=closed]:animate-accordion-up motion-safe:data-[state=open]:animate-accordion-down">
                                    <p className="pr-[clamp(0px,5vw,64px)] pb-7 text-[17px] leading-[1.65] text-soft">
                                        {t(`${id}.a`)}
                                    </p>
                                </Accordion.Content>
                            </Accordion.Item>
                        ))}
                    </Accordion.Root>
                </div>
            </div>
        </section>
    );
}
