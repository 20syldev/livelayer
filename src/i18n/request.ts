import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

/**
 * Resolves the next-intl request config: an explicit locale wins (route handlers cannot read root params), then the
 * locale root param, and routes outside the [locale] segment (the default locale served at "/", and the 404 document)
 * fall back to the default locale.
 *
 * @param locale - Locale passed explicitly to a server function such as getTranslations, when there is one
 * @returns The locale to use and its messages
 */
export default getRequestConfig(async ({ locale: explicit }) => {
    const requested = explicit ?? (await rootParams.locale());
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
