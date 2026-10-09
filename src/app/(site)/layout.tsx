import { getMessages } from "next-intl/server";

import { Shell } from "@/components/shell";
import { routing } from "@/i18n/routing";
import { buildMetadata, siteViewport } from "@/lib/metadata";

export const viewport = siteViewport;

/**
 * Builds the metadata of the default locale, which is served unprefixed at "/".
 *
 * @returns Metadata with the default locale's title, description and alternates
 */
export function generateMetadata() {
    return buildMetadata(routing.defaultLocale);
}

/**
 * Layout of the default locale, served unprefixed at "/": the other locales live under [locale].
 *
 * @param children - Page content, wrapped in the locale shell
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
    const messages = await getMessages({ locale: routing.defaultLocale });

    return (
        <Shell locale={routing.defaultLocale} messages={messages}>
            {children}
        </Shell>
    );
}
