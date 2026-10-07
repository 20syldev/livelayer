import { ArrowRight, Check, Info } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Demo } from "@/components/landing/demo";
import { BUTTON, FOCUS } from "@/components/landing/section";
import { HeartGlyph } from "@/components/live/icons";
import { SAMPLE_FEED } from "@/lib/sample";

const BUYER = SAMPLE_FEED[4];
const CHIP =
    "visual tile-scope flex items-center border-2 border-line bg-paper shadow-[4px_4px_0_var(--hard)] rounded-[22px]";
const FACES = [21, 8, 41];

/**
 * Hero section: headline, call-to-action and reassurance checks on one side, a tilted phone running the live demo on
 * the other, with decorative floating chips and a spinning sticker around it. The decorations are hidden from
 * assistive technology and the demo is the only interactive part of the visual.
 */
export function Hero() {
    const t = useTranslations("landing.hero");
    const checks = [t("checkFree"), t("checkNoAccount"), t("checkOnDevice")];

    return (
        <section aria-labelledby="hero-title">
            <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-x-[clamp(32px,4.5vw,64px)] gap-y-14 px-[clamp(16px,4vw,40px)] pt-[clamp(28px,4vw,56px)] pb-[clamp(64px,9vw,120px)]">
                <div className="min-w-0 flex-[1.15_1_420px]">
                    <h1
                        id="hero-title"
                        className="font-display text-[44px] leading-[0.96] font-extrabold tracking-[-0.025em] min-[430px]:text-[clamp(52px,7vw,96px)]"
                    >
                        {t("title1")}
                        <br />
                        {t("title2")}
                        <br />
                        <span className="relative isolate inline-block whitespace-nowrap text-on-highlight [box-decoration-break:clone] before:absolute before:inset-x-[-0.13em] before:top-[0.1em] before:-bottom-[0.01em] before:-z-10 before:-rotate-[1.5deg] before:rounded-[0.17em] before:bg-highlight">
                            {t("titleMark")}
                        </span>
                    </h1>

                    <p className="mt-7 max-w-[520px] text-[clamp(17px,1.5vw,20px)] leading-[1.55] text-soft">
                        {t("lead")}
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
                        <Link
                            href="/app/"
                            className={`${BUTTON} h-14 gap-3 bg-ink px-[30px] text-[17px] text-paper ${FOCUS}`}
                        >
                            {t("cta")}
                            <ArrowRight aria-hidden="true" size={20} strokeWidth={2.2} />
                        </Link>
                        <a
                            href="#steps"
                            className={`inline-flex min-h-11 items-center text-base font-bold text-ink underline decoration-2 underline-offset-[5px] ${FOCUS}`}
                        >
                            {t("how")}
                        </a>
                    </div>

                    <ul className="mt-8 flex list-none flex-wrap gap-x-[22px] gap-y-2.5 p-0">
                        {checks.map((label) => (
                            <li key={label} className="inline-flex items-center gap-2 text-sm font-bold text-soft">
                                <Check aria-hidden="true" size={18} strokeWidth={2.6} className="text-ink" />
                                {label}
                            </li>
                        ))}
                    </ul>

                    <p className="mt-[22px] flex max-w-[500px] items-start gap-2.5 text-[13px] leading-normal text-quiet">
                        <Info aria-hidden="true" size={16} strokeWidth={2} className="mt-0.5 flex-none" />
                        <span>{t("notice")}</span>
                    </p>
                </div>

                <div className="relative flex min-w-0 flex-[1_1_400px] items-center justify-center py-10 md:py-14">
                    <div
                        aria-hidden="true"
                        className="visual absolute inset-0 overflow-hidden rounded-[40px] panel-gradient"
                    >
                        <svg
                            viewBox="0 0 600 800"
                            preserveAspectRatio="xMidYMid slice"
                            className="absolute inset-0 block size-full"
                        >
                            <g transform="translate(300 400)" fill="currentColor" fillOpacity="0.1">
                                {Array.from({ length: 12 }, (_, i) => (
                                    <path key={i} d="M0 0 L-110 -1000 L110 -1000 Z" transform={`rotate(${i * 30})`} />
                                ))}
                            </g>
                            <circle
                                cx="300"
                                cy="400"
                                r="250"
                                fill="none"
                                stroke="currentColor"
                                strokeOpacity="0.28"
                                strokeWidth="2"
                            />
                            <circle
                                cx="300"
                                cy="400"
                                r="340"
                                fill="none"
                                stroke="currentColor"
                                strokeOpacity="0.16"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>

                    <div className="relative z-[2] h-[647px] w-[307px] flex-none -rotate-6 rounded-[46px] bg-ground p-[7px] shadow-phone max-[420px]:-my-[45px] max-[420px]:scale-[0.86] max-[359px]:-my-[70px] max-[359px]:scale-[0.78] max-[339px]:-my-[90px] max-[339px]:scale-[0.7]">
                        <div className="relative h-[633px] w-[293px] overflow-hidden rounded-[39px] bg-black">
                            <div className="absolute top-0 left-0 origin-top-left scale-75">
                                <Demo />
                            </div>
                        </div>
                    </div>

                    <div
                        aria-hidden="true"
                        className="absolute top-[31%] left-[-4px] z-[4] -rotate-[4deg] min-[760px]:left-[-32px]"
                    >
                        <div className="motion-safe:animate-[hero-bob_4.2s_ease-in-out_infinite]">
                            <div className={`${CHIP} gap-3 py-2.5 pr-[18px] pl-3`}>
                                <div className="flex flex-none">
                                    {FACES.map((n, i) => (
                                        // eslint-disable-next-line @next/next/no-img-element -- decorative, static export without optimizer
                                        <img
                                            key={n}
                                            src={`/avatars/${n}.jpg`}
                                            alt=""
                                            className={`block size-[34px] rounded-full border-2 border-paper object-cover ${i > 0 ? "-ml-3" : ""}`}
                                        />
                                    ))}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 font-display text-[21px] leading-none font-extrabold tracking-[-0.01em] whitespace-nowrap tabular-nums">
                                        {t("chipCount")}
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-up"
                                        >
                                            <path d="M12 19V5" />
                                            <path d="m5 12 7-7 7 7" />
                                        </svg>
                                    </div>
                                    <div className="mt-1 text-xs leading-none font-bold whitespace-nowrap text-quiet">
                                        {t("chipLabel")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        aria-hidden="true"
                        className="absolute right-[-4px] bottom-[13%] z-[4] rotate-3 min-[760px]:right-[-32px]"
                    >
                        <div className="motion-safe:animate-[hero-bob_5s_ease-in-out_-2s_infinite]">
                            <div className={`${CHIP} gap-2.5 py-2.5 pr-3.5 pl-2.5`}>
                                {/* eslint-disable-next-line @next/next/no-img-element -- decorative, static export without optimizer */}
                                <img
                                    src={`/avatars/${BUYER.avatar}.jpg`}
                                    alt=""
                                    className="block size-[38px] flex-none rounded-full object-cover"
                                />
                                <div>
                                    <div className="text-sm leading-[1.2] font-bold whitespace-nowrap">
                                        {BUYER.user}
                                    </div>
                                    <div className="text-xs leading-[1.3] font-medium whitespace-nowrap text-quiet">
                                        {t("chipBought")}
                                    </div>
                                </div>
                                <span className="inline-flex h-[22px] flex-none items-center gap-[3px] rounded-md bg-chip-3 px-[7px]">
                                    {[0, 1, 2].map((i) => (
                                        <HeartGlyph key={i} size={11} />
                                    ))}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        aria-hidden="true"
                        className="visual absolute -top-[26px] right-[clamp(8px,6%,40px)] z-[4] size-[116px]"
                    >
                        <div className="tile-scope absolute inset-0 rounded-full border-2 border-line bg-highlight shadow-[4px_4px_0_var(--line)]" />
                        <div className="absolute inset-0 motion-safe:animate-[hero-spin_20s_linear_infinite]">
                            <svg viewBox="0 0 116 116" width="116" height="116" className="block">
                                <defs>
                                    <path id="hero-circle" d="M58 58 m-39 0 a39 39 0 1 1 78 0 a39 39 0 1 1 -78 0" />
                                </defs>
                                <text
                                    fontSize="11.5"
                                    fontWeight="800"
                                    letterSpacing="1.2"
                                    className="fill-on-highlight font-ui"
                                >
                                    <textPath href="#hero-circle" textLength="240">
                                        {t("sticker")}
                                    </textPath>
                                </text>
                            </svg>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center text-on-highlight">
                            <HeartGlyph size={30} color="currentColor" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
