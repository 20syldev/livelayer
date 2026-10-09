import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";

import { Shell } from "@/components/shell";
import { routing } from "@/i18n/routing";
import { buildMetadata, siteViewport } from "@/lib/metadata";

export const viewport = siteViewport;

/**
 * Lists the locales to pre-render. The default locale is served unprefixed by (site), so only the other locales
 * are built here.
 *
 * @returns One params object per non-default locale
 */
export function generateStaticParams() {
    return routing.locales.filter((locale) => locale !== routing.defaultLocale).map((locale) => ({ locale }));
}

export const dynamicParams = false;

/**
 * Builds the metadata of the requested locale.
 *
 * @param params - Route params, resolved to read the locale segment
 * @returns The locale's metadata, or an empty object when the segment is not a supported locale
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    return hasLocale(routing.locales, locale) ? buildMetadata(locale) : {};
}

/**
 * Layout of a non-default locale: wraps the page in the locale shell and answers 404 for an unknown segment.
 *
 * @param children - Page content, wrapped in the locale shell
 * @param params - Route params, resolved to read the locale segment
 */
export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();

    const messages = await getMessages({ locale });

    return (
        <Shell locale={locale} messages={messages}>
            {children}
        </Shell>
    );
}
