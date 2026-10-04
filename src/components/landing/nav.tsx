"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { LocaleSwitch } from "@/components/landing/locale";
import { FOCUS } from "@/components/landing/section";
import { ThemeToggle } from "@/components/landing/theme";
import { BRAND } from "@/data/brand";

const links = ["uses", "steps", "features", "faq"] as const;
type LinkId = (typeof links)[number];

const CTA =
    "h-11 flex-none items-center justify-center gap-2 rounded-[14px] brand-gradient px-[22px] text-[15.5px] leading-none font-extrabold whitespace-nowrap text-white motion-safe:transition-transform motion-safe:hover:-translate-y-0.5";

/**
 * Tracks which landing section is crossing the reading band of the viewport (from 30% to 50% of its height), so the
 * nav can highlight the matching link.
 *
 * @returns The id of the section in the band, or null when none of the nav sections is
 */
function useActiveSection() {
    const [active, setActive] = useState<LinkId | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const id = entry.target.id as LinkId;
                    if (entry.isIntersecting) setActive(id);
                    else setActive((current) => (current === id ? null : current));
                }
            },
            { rootMargin: "-30% 0px -50% 0px" },
        );
        for (const id of links) {
            const node = document.getElementById(id);
            if (node) observer.observe(node);
        }
        return () => observer.disconnect();
    }, []);

    return active;
}

/**
 * Tilted logo sticker that links back to the top of the page, with a light sweep that is skipped under reduced
 * motion.
 */
function BrandBadge() {
    return (
        <a
            href="#top"
            aria-label={BRAND.name}
            className={`inline-flex min-h-11 items-center justify-self-start rounded-2xl pl-0.5 ${FOCUS}`}
        >
            <span
                aria-hidden="true"
                className="relative inline-flex h-10 origin-[20%_60%] -rotate-2 items-center gap-[7px] overflow-hidden rounded-[11px] border-2 border-ink bg-logo-badge pr-[13px] pl-[9px] text-white shadow-[3px_3px_0_var(--color-ink)] sm:h-12 sm:gap-2.5 sm:rounded-xl sm:pr-5 sm:pl-3.5 sm:shadow-[4px_4px_0_var(--color-ink)]"
            >
                <span className="pointer-events-none absolute inset-y-0 left-[-60px] w-9 -skew-x-[18deg] bg-badge-shine motion-safe:animate-[badge-sweep_5s_ease-in-out_infinite]" />
                <svg viewBox="0 0 64 64" className="-mr-0.5 size-[25px] flex-none sm:size-[30px]">
                    <path
                        d="M20 11L50 32L20 53"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M10 22L28 32L10 42Z"
                        fill="currentColor"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className="font-display text-[20px] leading-none font-extrabold tracking-[-0.03em] sm:text-[25px]">
                    {BRAND.name}
                </span>
            </span>
        </a>
    );
}

/**
 * Sticky top navigation: brand badge, section links, locale and theme switches and the call-to-action. Below 1100px
 * the links move into a menu card that closes on Escape, on an outside tap and when the viewport grows.
 */
export function Nav() {
    const t = useTranslations("landing.nav");
    const active = useActiveSection();
    const [open, setOpen] = useState(false);
    const card = useRef<HTMLDivElement>(null);
    const toggle = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const query = window.matchMedia("(min-width: 1100px)");
        const onChange = () => {
            if (query.matches) setOpen(false);
        };
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setOpen(false);
            toggle.current?.focus();
        };
        const onPointer = (event: PointerEvent) => {
            if (!card.current?.contains(event.target as Node)) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onPointer);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onPointer);
        };
    }, [open]);

    const item = (id: LinkId, size: string) => (
        <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "location" : undefined}
            onClick={() => setOpen(false)}
            className={`flex items-center rounded-[14px] font-bold transition-colors ${size} ${FOCUS} ${
                active === id ? "bg-ink text-paper" : "text-soft hover:bg-paper hover:text-ink"
            }`}
        >
            {t(id)}
        </a>
    );

    return (
        <header className="sticky top-3 z-40 mt-3 w-full">
            <div className="mx-auto w-full max-w-[1280px] px-[clamp(16px,4vw,40px)]">
                <div className="relative h-16 min-[1100px]:h-[78px]">
                    <div
                        ref={card}
                        className="absolute inset-x-0 top-0 rounded-[20px] border-2 border-line bg-paper shadow-[4px_4px_0_var(--hard)] min-[1100px]:rounded-3xl min-[1100px]:shadow-[6px_6px_0_var(--hard)]"
                    >
                        <div className="flex h-[60px] items-center justify-between gap-2 pr-2.5 pl-3 min-[1100px]:grid min-[1100px]:h-[74px] min-[1100px]:grid-cols-[1fr_auto_1fr] min-[1100px]:pr-4 min-[1100px]:pl-[18px]">
                            <BrandBadge />

                            <nav
                                aria-label={t("label")}
                                className="hidden gap-0.5 rounded-[18px] border border-ink/15 bg-tile dark:border-ink/20 p-1 min-[1100px]:flex"
                            >
                                {links.map((id) => item(id, "min-h-11 px-4 text-[15px] min-[1200px]:px-5"))}
                            </nav>

                            <div className="flex items-center justify-end gap-1.5 min-[1100px]:gap-2.5">
                                <div className="flex items-center gap-1.5 max-[359px]:hidden min-[1100px]:gap-2.5">
                                    <LocaleSwitch />
                                    <ThemeToggle />
                                </div>
                                <Link href="/app/" className={`${CTA} ml-1 hidden min-[1100px]:inline-flex ${FOCUS}`}>
                                    {t("try")}
                                    <ArrowRight aria-hidden="true" size={18} strokeWidth={2.4} />
                                </Link>
                                <button
                                    ref={toggle}
                                    type="button"
                                    aria-expanded={open}
                                    aria-controls={open ? "nav-menu" : undefined}
                                    aria-label={open ? t("closeMenu") : t("openMenu")}
                                    onClick={() => setOpen((value) => !value)}
                                    className={`inline-flex size-11 flex-none items-center justify-center rounded-[14px] bg-ink text-paper min-[1100px]:hidden ${FOCUS}`}
                                >
                                    {open ? (
                                        <X aria-hidden="true" className="size-5" />
                                    ) : (
                                        <Menu aria-hidden="true" className="size-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {open && (
                            <div
                                id="nav-menu"
                                className="max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain px-2.5 pb-3 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 min-[1100px]:hidden"
                            >
                                <nav
                                    aria-label={t("label")}
                                    className="flex flex-col gap-0.5 rounded-[18px] border border-ink/15 bg-tile dark:border-ink/20 p-1"
                                >
                                    {links.map((id) => item(id, "min-h-12 px-4 text-[17px]"))}
                                </nav>
                                <div className="mt-2.5 flex items-center gap-2.5 min-[360px]:hidden">
                                    <LocaleSwitch inline />
                                    <ThemeToggle />
                                </div>
                                <Link
                                    href="/app/"
                                    onClick={() => setOpen(false)}
                                    className={`${CTA} mt-2.5 flex h-12 w-full text-base ${FOCUS}`}
                                >
                                    {t("try")}
                                    <ArrowRight aria-hidden="true" size={18} strokeWidth={2.4} />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
