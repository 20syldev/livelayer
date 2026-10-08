import { useTranslations } from "next-intl";

import { Bento } from "@/components/landing/bento";
import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Steps } from "@/components/landing/steps";
import { Uses } from "@/components/landing/uses";

/**
 * Landing page of the site: navigation, then the sections in reading order, with a skip link that jumps to the main
 * content for keyboard users.
 */
export function Landing() {
    const t = useTranslations("common");

    return (
        <div id="top" className="relative overflow-x-clip bg-paper font-ui text-ink">
            <a
                href="#main"
                className="sr-only rounded-full bg-ink px-5 py-3 font-bold text-paper focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
            >
                {t("skip")}
            </a>
            <Nav />
            <main id="main">
                <Hero />
                <Uses />
                <Steps />
                <Bento />
                <Faq />
                <Cta />
            </main>
            <Footer />
        </div>
    );
}
