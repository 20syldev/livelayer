import { useTranslations } from "next-intl";

import { CONTAINER } from "@/components/landing/section";

/**
 * Page footer: the independence and privacy disclaimer, centered in small print.
 */
export function Footer() {
    const t = useTranslations("landing.footer");

    return (
        <footer>
            <div className={`${CONTAINER} pt-6 pb-12`}>
                <p className="mx-auto max-w-[560px] text-center text-[13px] leading-[1.6] text-quiet">
                    {t("disclaimer")}
                </p>
            </div>
        </footer>
    );
}
