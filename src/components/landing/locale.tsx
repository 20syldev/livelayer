"use client";

import { useLocale, useTranslations } from "next-intl";
import { type MouseEvent, useEffect, useRef, useState } from "react";

import { FOCUS } from "@/components/landing/section";
import { type AppLocale, localePath, routing } from "@/i18n/routing";

const BUTTON =
    "inline-flex size-11 flex-none items-center justify-center rounded-[14px] border-2 border-line bg-paper text-[13.5px] font-extrabold tracking-wide text-ink uppercase transition-colors hover:bg-tile";

/**
 * Keeps the visitor on the same section when the language changes, by carrying the current hash over to the link.
 *
 * @param event - Click on a locale link, whose hash is replaced by the one of the current page
 */
function keepHash(event: MouseEvent<HTMLAnchorElement>) {
    event.currentTarget.hash = window.location.hash;
}

/**
 * Link to the home page of one locale. It is a plain anchor because each locale is a static page.
 *
 * @param code - Locale the link leads to
 * @param current - Whether it is the locale of the page, which is then marked as the current one
 * @param className - Classes of the link, since the menu and the inline row do not share the same shape
 */
function LocaleLink({ code, current, className }: { code: AppLocale; current: boolean; className: string }) {
    const t = useTranslations("landing.nav");

    return (
        <a
            href={localePath(code)}
            hrefLang={code}
            lang={code}
            aria-current={current ? "true" : undefined}
            aria-label={current ? undefined : t("switchTo", { language: t(`languages.${code}`) })}
            onClick={keepHash}
            className={`${className} ${FOCUS}`}
        >
            {current ? t(`languages.${code}`) : code.toUpperCase()}
        </a>
    );
}

/**
 * Language switch of the header. A button shows the current locale and opens a small menu with the others; it closes on
 * Escape and on an outside tap. With inline set, the locales are shown side by side instead, for a container that
 * would clip a popup.
 *
 * @param inline - Renders every locale as a button in a row, with no popup
 */
export function LocaleSwitch({ inline = false }: { inline?: boolean }) {
    const t = useTranslations("landing.nav");
    const locale = useLocale() as AppLocale;
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const toggle = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            setOpen(false);
            toggle.current?.focus();
        };
        const onPointer = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node)) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onPointer);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onPointer);
        };
    }, [open]);

    if (inline) {
        return (
            <div role="group" aria-label={t("language")} className="flex items-center gap-1.5">
                {routing.locales.map((code) => (
                    <LocaleLink
                        key={code}
                        code={code}
                        current={false}
                        className={`${BUTTON} ${code === locale ? "bg-ink text-paper hover:bg-ink" : ""}`}
                    />
                ))}
            </div>
        );
    }

    return (
        <div ref={root} className="relative">
            <button
                ref={toggle}
                type="button"
                aria-expanded={open}
                aria-haspopup="true"
                aria-label={`${locale.toUpperCase()}, ${t("language")}`}
                onClick={() => setOpen((value) => !value)}
                className={`${BUTTON} ${FOCUS}`}
            >
                {locale}
            </button>
            {open && (
                <ul className="absolute top-full right-0 z-50 mt-2 flex min-w-36 flex-col gap-0.5 rounded-[18px] border-2 border-line bg-paper p-1 shadow-[4px_4px_0_var(--hard)] motion-safe:animate-in motion-safe:fade-in">
                    {routing.locales.map((code) => (
                        <li key={code}>
                            <LocaleLink
                                code={code}
                                current={code === locale}
                                className={`flex min-h-11 items-center rounded-[14px] px-4 text-[15px] font-bold ${
                                    code === locale ? "bg-ink text-paper" : "text-soft hover:bg-tile hover:text-ink"
                                }`}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
