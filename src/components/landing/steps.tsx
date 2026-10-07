import Image from "next/image";
import { useTranslations } from "next-intl";

import { CONTAINER, SectionHead } from "@/components/landing/section";
import { HeartGlyph } from "@/components/live/icons";
import { HOST, SAMPLE_FEED } from "@/lib/sample";

const [JOINER, COMMENTER] = [SAMPLE_FEED[0], SAMPLE_FEED[1]];

const numeral =
    "relative z-10 -mb-3 pl-3 md:-mb-[34px] font-display text-[clamp(120px,13vw,184px)] leading-[0.8] font-extrabold tracking-[-0.04em] text-transparent [-webkit-text-stroke:3px_var(--color-ink)] dark:z-0 dark:[-webkit-text-stroke-color:var(--color-highlight)]";
const stage =
    "visual tile-scope relative flex h-[236px] overflow-hidden rounded-[32px] border-2 border-line shadow-[6px_6px_0_var(--hard)]";
const segment = "flex h-8 flex-1 items-center justify-center rounded-[10px] text-xs font-bold whitespace-nowrap";
const dot = "flex size-10 items-center justify-center rounded-full border-2 border-line text-[15px] font-extrabold";

/**
 * First step illustration: a miniature audience picker with the creator preset selected and a slider at 60%.
 */
function AudienceStage() {
    const t = useTranslations("landing.steps");

    return (
        <div
            aria-hidden="true"
            className={`${stage} items-center justify-center bg-tile-yellow dark:shadow-[6px_6px_0_var(--color-tile-lilac)]`}
        >
            <div className="w-[min(272px,86%)] rounded-[22px] border-2 border-line bg-paper p-4">
                <div className="text-[11px] font-extrabold tracking-[0.08em] text-quiet uppercase">
                    {t("one.audience")}
                </div>
                <div className="mt-2 flex gap-0.5 rounded-[14px] bg-tile p-1">
                    <span className={`${segment} text-soft`}>{t("one.friends")}</span>
                    <span className={`${segment} bg-ink text-paper`}>{t("one.creator")}</span>
                    <span className={`${segment} text-soft`}>{t("one.viral")}</span>
                </div>
                <div className="mt-4 flex items-baseline justify-between text-xs font-bold text-soft">
                    <span>{t("one.max")}</span>
                    <span className="font-display text-xl font-extrabold whitespace-nowrap text-ink tabular-nums">
                        {t("one.maxValue")}
                    </span>
                </div>
                <div className="relative mt-2.5 h-[22px]">
                    <div className="absolute inset-x-0 top-[9px] h-1 rounded-sm bg-line-soft" />
                    <div className="absolute top-[9px] left-0 h-1 w-[60%] rounded-sm bg-brand" />
                    <div className="absolute top-0 left-[60%] -ml-[11px] size-[22px] rounded-full border-2 border-line bg-paper" />
                </div>
            </div>
        </div>
    );
}

/**
 * Second step illustration: a ring countdown stopped on 2, next to the 3, 2, 1 sequence.
 */
function CountdownStage() {
    return (
        <div aria-hidden="true" className={`${stage} items-center justify-center gap-[22px] bg-tile-pink`}>
            <div className="relative mt-5 size-[132px] flex-none">
                <svg width="132" height="132" viewBox="0 0 132 132" className="block -rotate-90">
                    <circle cx="66" cy="66" r="58" strokeWidth="2" className="fill-paper stroke-line" />
                    <circle cx="66" cy="66" r="50" fill="none" strokeWidth="10" className="stroke-tile" />
                    <circle
                        cx="66"
                        cy="66"
                        r="50"
                        fill="none"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray="314"
                        strokeDashoffset="150"
                        className="stroke-brand"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-display text-[76px] leading-none font-extrabold tracking-[-0.04em] text-ink">
                    2
                </div>
            </div>
            <div className="mt-5 flex flex-col gap-2">
                <span className={`${dot} bg-paper text-quiet`}>3</span>
                <span className={`${dot} bg-ink text-paper`}>2</span>
                <span className={`${dot} bg-paper text-quiet`}>1</span>
            </div>
        </div>
    );
}

/**
 * Third step illustration: a miniature live screen with the host, the LIVE badge, a viewer count, a comment, a join
 * notice and a heart, drawn with the same system font stack as the real live.
 */
function LiveStage() {
    const t = useTranslations("landing.steps");

    return (
        <div aria-hidden="true" className={`${stage} items-end justify-center bg-tile-sky`}>
            <div className="relative h-[178px] w-[min(250px,84%)] overflow-hidden rounded-t-3xl border-2 border-b-0 border-line bg-live-fallback font-live text-white">
                <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-[7px]">
                        <Image
                            src={`/avatars/${HOST.avatar}.jpg`}
                            alt=""
                            width={24}
                            height={24}
                            className="size-6 flex-none rounded-full object-cover"
                        />
                        <span className="text-[11px] font-semibold whitespace-nowrap">{HOST.username}</span>
                    </div>
                    <div className="flex flex-none items-center gap-1">
                        <span className="rounded-[3px] bg-live-badge px-[5px] py-0.5 text-[9px] leading-[14px] font-bold tracking-[0.4px] whitespace-nowrap uppercase">
                            {t("three.live")}
                        </span>
                        <span className="rounded-[3px] bg-chip-viewers px-[5px] py-0.5 text-[10px] leading-[14px] font-semibold whitespace-nowrap">
                            {t("three.viewers")}
                        </span>
                    </div>
                </div>
                <div className="absolute inset-x-3 bottom-3.5 flex flex-col gap-[9px]">
                    <div className="flex items-center gap-2">
                        <Image
                            src={`/avatars/${COMMENTER.avatar}.jpg`}
                            alt=""
                            width={24}
                            height={24}
                            className="size-6 flex-none rounded-full object-cover"
                        />
                        <div className="min-w-0 text-[11px] leading-[14px]">
                            <div className="font-semibold">{COMMENTER.user}</div>
                            <div>{t("three.comment")}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Image
                            src={`/avatars/${JOINER.avatar}.jpg`}
                            alt=""
                            width={24}
                            height={24}
                            className="size-6 flex-none rounded-full object-cover"
                        />
                        <div className="min-w-0 text-[11px] leading-[14px] font-semibold">
                            {t("three.joined", { user: JOINER.user })}
                        </div>
                    </div>
                </div>
                <div className="absolute right-3.5 bottom-14">
                    <HeartGlyph size={22} color="var(--color-like)" />
                </div>
            </div>
        </div>
    );
}

/**
 * Section explaining the three steps to start a live (choose the audience, wait for the countdown, go live), each with
 * a small illustration and a large outlined numeral.
 */
export function Steps() {
    const t = useTranslations("landing.steps");

    const steps = [
        { id: "one", n: "1", stage: <AudienceStage /> },
        { id: "two", n: "2", stage: <CountdownStage /> },
        { id: "three", n: "3", stage: <LiveStage /> },
    ] as const;

    return (
        <section id="steps" aria-labelledby="steps-title" className="scroll-mt-24">
            <div className={`${CONTAINER} py-[clamp(72px,10vw,136px)]`}>
                <SectionHead
                    id="steps-title"
                    pill={t("pill")}
                    title={t("title")}
                    intro={t("intro")}
                    tone="bg-tile-mint"
                    tilt="rotate-[1.5deg]"
                />

                <ol className="mt-[clamp(48px,6vw,80px)] grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-x-8 gap-y-14">
                    {steps.map((step) => (
                        <li key={step.id} className="flex min-w-0 flex-col">
                            <div aria-hidden="true" className={numeral}>
                                {step.n}
                            </div>
                            {step.stage}
                            <h3 className="mt-7 font-display text-[30px] leading-[1.05] font-extrabold tracking-[-0.02em] text-ink">
                                {t(`${step.id}.title`)}
                            </h3>
                            <p className="mt-2.5 text-base leading-[1.6] text-soft">{t(`${step.id}.text`)}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
