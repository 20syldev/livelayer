import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";

import { BRAND } from "@/data/brand";
import { THEME_COLORS } from "@/data/colors";
import { type AppLocale, localePath, routing } from "@/i18n/routing";

const OG_LOCALES: Record<AppLocale, string> = { fr: "fr_FR", en: "en_US", es: "es_ES" };

// Metadata shared by every page; appleWebApp emits mobile-web-app-capable and apple-mobile-web-app-title (home screen install)
export const sharedMetadata: Metadata = {
    metadataBase: new URL(BRAND.url),
    applicationName: BRAND.name,
    authors: [{ name: BRAND.author.name, url: BRAND.author.url }],
    creator: BRAND.author.name,
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "48x48" },
            { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
            { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    appleWebApp: {
        capable: true,
        title: BRAND.name,
        statusBarStyle: "black-translucent",
    },
    formatDetection: { telephone: false },
};

// Viewport of the simulator screens, a fixed phone UI: no zoom, notch-aware
export const appViewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: THEME_COLORS.app,
    viewportFit: "cover",
};

// Viewport of the landing, which keeps pinch zoom available
export const siteViewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: THEME_COLORS.siteLight },
        { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.siteDark },
    ],
};

/**
 * Builds the per-locale page metadata: title, description, keywords, canonical and hreflang
 * alternates, Open Graph and Twitter cards.
 *
 * @param locale - Locale of the page, used for the translated texts, the canonical URL and og:locale
 * @returns The metadata object to export from a layout or page
 */
export async function buildMetadata(locale: AppLocale): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: "metadata" });
    const title = t("title");
    const languages: Record<string, string> = Object.fromEntries(
        routing.locales.map((code) => [code, localePath(code)]),
    );
    languages["x-default"] = localePath(routing.defaultLocale);

    return {
        ...sharedMetadata,
        title,
        description: t("description"),
        keywords: t("keywords")
            .split(",")
            .map((keyword) => keyword.trim()),
        alternates: { canonical: localePath(locale), languages },
        openGraph: {
            type: "website",
            siteName: BRAND.name,
            title,
            description: t("shortDescription"),
            url: localePath(locale),
            locale: OG_LOCALES[locale],
            alternateLocale: routing.locales.filter((code) => code !== locale).map((code) => OG_LOCALES[code]),
        },
        twitter: {
            card: "summary",
            title,
            description: t("shortDescription"),
        },
    };
}
