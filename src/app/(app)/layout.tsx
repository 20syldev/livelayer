import "@/app/globals.css";

import type { Metadata } from "next";

import { BRAND } from "@/data/brand";
import { appFontVariables } from "@/lib/appfonts";
import { appViewport, sharedMetadata } from "@/lib/metadata";

const TITLE = "Configurer le live";
const DESCRIPTION = "Règle les viewers, les commentaires et les réactions, puis lance ton live en plein écran.";

export const metadata: Metadata = {
    ...sharedMetadata,
    title: `${TITLE} - ${BRAND.name}`,
    description: DESCRIPTION,
};

export const viewport = appViewport;

/**
 * Root document of the simulator, which is French-only and always dark: it has its own root layout, outside the
 * landing's theme provider. The font variables sit on the html element because Tailwind resolves --font-sans on
 * :root.
 *
 * @param children - Route content, rendered inside the dark wrapper
 */
export default function AppRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" data-scroll-behavior="smooth" className={appFontVariables}>
            <body className="font-sans antialiased">
                <div className="dark min-h-screen bg-background font-ui text-foreground">{children}</div>
            </body>
        </html>
    );
}
