import "@/app/globals.css";

import { type AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import type { AppLocale } from "@/i18n/routing";
import { siteFontVariables } from "@/lib/fonts";

interface ShellProps {
    locale: AppLocale;
    messages: AbstractIntlMessages;
    children: ReactNode;
}

/**
 * Root document shared by the layouts: html and body, theme provider and translation provider, so every page gets
 * dark mode and its messages without wiring them itself.
 *
 * @param locale - Locale written on the html lang attribute and given to the translation provider
 * @param messages - Messages of that locale, already loaded on the server
 * @param children - Page content rendered inside both providers
 */
export function Shell({ locale, messages, children }: ShellProps) {
    return (
        <html lang={locale} data-scroll-behavior="smooth" className={siteFontVariables} suppressHydrationWarning>
            <body className="font-ui antialiased">
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        {children}
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
