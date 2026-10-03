import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["en", "fr", "es"],
    defaultLocale: "en",
    localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];

/**
 * Builds the URL path of a locale's home page, "/" for the default locale and "/fr/" for the others.
 *
 * @param locale - Locale whose home path is built, the default locale yields "/"
 * @returns The path, always with a trailing slash
 */
export const localePath = (locale: AppLocale) => (locale === routing.defaultLocale ? "/" : `/${locale}/`);
