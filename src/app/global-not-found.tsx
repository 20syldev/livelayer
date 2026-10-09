import type { Metadata } from "next";
import { getMessages } from "next-intl/server";

import { NotFound, type NotFoundCopy } from "@/components/notfound";
import { Shell } from "@/components/shell";
import { BRAND } from "@/data/brand";
import { type AppLocale, routing } from "@/i18n/routing";

export const metadata: Metadata = {
    title: `404 - ${BRAND.name}`,
};

/**
 * Whole 404 document: no layout wraps it because every route group owns its root document. A static export serves
 * a single 404 for every path, so it is built in the default locale and hands the client every locale's copy to
 * pick from the URL.
 */
export default async function GlobalNotFound() {
    const messages = await getMessages({ locale: routing.defaultLocale });
    const entries = await Promise.all(
        routing.locales.map(
            async (locale) =>
                [locale, (await import(`../../messages/${locale}.json`)).default.notFound] as [AppLocale, NotFoundCopy],
        ),
    );
    const copy = Object.fromEntries(entries) as Record<AppLocale, NotFoundCopy>;

    return (
        <Shell locale={routing.defaultLocale} messages={messages}>
            <NotFound copy={copy} />
        </Shell>
    );
}
