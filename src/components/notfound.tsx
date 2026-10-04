"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { type AppLocale, localePath, routing } from "@/i18n/routing";

export interface NotFoundCopy {
    title: string;
    description: string;
    home: string;
    simulator: string;
}

interface NotFoundProps {
    copy: Record<AppLocale, NotFoundCopy>;
}

const BUTTON =
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-base font-bold whitespace-nowrap outline-none transition-transform focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-paper motion-safe:hover:-translate-y-0.5";

/**
 * Store subscription for useSyncExternalStore. The 404 document never navigates, so there is nothing to subscribe to.
 *
 * @returns An unsubscribe function that does nothing
 */
const subscribe = () => () => {};

/**
 * Reads the locale from the first path segment when it is a known prefix. The default locale is unprefixed.
 *
 * @returns The locale of the current URL, or the default locale when the first segment is not a locale prefix
 */
const getLocale = (): AppLocale => {
    const segment = window.location.pathname.split("/")[1];
    return (routing.locales as readonly string[]).includes(segment) ? (segment as AppLocale) : routing.defaultLocale;
};

/**
 * Locale used for the server render, which matches the static HTML built in the default locale.
 *
 * @returns The default locale
 */
const getServerLocale = (): AppLocale => routing.defaultLocale;

/**
 * 404 screen. A static export serves one document for every path, so the locale is read from the URL on the client
 * and the html lang attribute is updated to match.
 *
 * @param copy - Texts of the screen for every locale, indexed by locale code
 */
export function NotFound({ copy }: NotFoundProps) {
    const locale = useSyncExternalStore(subscribe, getLocale, getServerLocale);
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const t = copy[locale];
    const home = localePath(locale);

    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-8 bg-paper px-4 text-center font-ui text-ink">
            <span
                aria-hidden="true"
                className="tile-scope -rotate-3 rounded-[28px] border-2 border-line bg-highlight px-8 py-3 font-display text-7xl font-extrabold tracking-tight text-on-highlight shadow-[6px_6px_0_var(--color-line)] dark:shadow-[6px_6px_0_var(--color-tile-lilac)] select-none sm:text-8xl"
            >
                404
            </span>
            <div className="flex max-w-md flex-col gap-3">
                <h1 className="font-display text-4xl leading-none font-extrabold tracking-tight text-balance sm:text-5xl">
                    {t.title}
                </h1>
                <p className="text-lg text-soft text-balance">{t.description}</p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Link href={home} className={`${BUTTON} bg-ink text-paper`}>
                    {t.home}
                    <ArrowRight className="size-5" strokeWidth={2.2} aria-hidden="true" />
                </Link>
                <Link href="/app/" className={`${BUTTON} border-2 border-line text-ink`}>
                    {t.simulator}
                </Link>
            </div>
        </main>
    );
}
