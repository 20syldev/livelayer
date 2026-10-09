import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";

import { BRAND } from "@/data/brand";
import { THEME_COLORS } from "@/data/colors";
import { routing } from "@/i18n/routing";

// Required for the static export
export const dynamic = "force-static";

/**
 * Web app manifest of the installable simulator, localized in the default locale.
 *
 * @returns The manifest served at /manifest.webmanifest
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const t = await getTranslations({ locale: routing.defaultLocale, namespace: "metadata" });

    return {
        name: t("title"),
        short_name: BRAND.name,
        description: t("shortDescription"),
        lang: routing.defaultLocale,

        // Installed from the home screen, the app opens straight on the config screen
        start_url: "/app/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",

        // The manifest is plain JSON: its colors cannot reference a CSS variable
        background_color: THEME_COLORS.app,
        theme_color: THEME_COLORS.app,
        categories: ["entertainment", "utilities"],
        icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
    };
}
