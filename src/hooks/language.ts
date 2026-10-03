import { useLocale } from "next-intl";

import type { Language } from "@/data/live";
import { routing } from "@/i18n/routing";

/**
 * Reads the language of the page, which is also a language the live comments are written in.
 *
 * @returns The active locale, or the default locale when the provider holds an unknown one
 */
export function useLanguage(): Language {
    const locale = useLocale();

    return (routing.locales as readonly string[]).includes(locale) ? (locale as Language) : routing.defaultLocale;
}
