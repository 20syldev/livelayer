"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { FOCUS } from "@/components/landing/section";

/**
 * Button that flips between light and dark. Both icons are always rendered and the dark variant decides which one
 * shows, so the markup is identical on the server and no icon flashes before hydration.
 */
export function ThemeToggle() {
    const t = useTranslations("landing.nav");
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <button
            type="button"
            aria-label={t("theme")}
            title={t("theme")}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={`inline-flex size-11 flex-none items-center justify-center rounded-[14px] border-2 border-line bg-paper text-ink transition-colors hover:bg-tile ${FOCUS}`}
        >
            <Moon aria-hidden="true" className="size-5 dark:hidden" />
            <Sun aria-hidden="true" className="hidden size-5 dark:block" />
        </button>
    );
}
