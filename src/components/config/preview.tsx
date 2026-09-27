"use client";

import { Comment } from "@/components/live/comment";
import { HeartGlyph } from "@/components/live/icons";
import { BadgeBar } from "@/components/live/toolbar";
import { TopBar } from "@/components/live/topbar";
import { AVATAR_COLORS, avatarColor } from "@/data/colors";
import type { LiveConfig } from "@/data/config";
import { type Language, liveStrings } from "@/data/live";
import { COMMENT_POOLS, type CommentEntry } from "@/hooks/comments";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "ton.pseudo";

// Neutral initial until a name is chosen
const PLACEHOLDER_COLOR = "var(--color-avatar-empty)";

/**
 * Builds the fixed chat rows of the preview, oldest first: a join, two comments and a badge purchase covering
 * every chip tier.
 *
 * @param language - Language of the live, picks the comment pool and the join and purchase wording
 * @returns Four entries ready for the Comment component
 */
function sampleComments(language: Language): CommentEntry[] {
    const t = liveStrings(language);
    const pool = COMMENT_POOLS[language] ?? COMMENT_POOLS.en;
    return [
        {
            id: "join",
            type: "join",
            username: "nora_lens",
            avatarColor: AVATAR_COLORS[0],
            avatarImg: "/avatars/12.jpg",
            text: t.joined,
            tier: 0,
        },
        {
            id: "first",
            type: "comment",
            username: "lucas_sky",
            avatarColor: AVATAR_COLORS[1],
            avatarImg: "/avatars/27.jpg",
            text: pool[4],
            tier: 1,
        },
        {
            id: "badge",
            type: "badge",
            username: "emma_vibes",
            avatarColor: AVATAR_COLORS[2],
            avatarImg: "/avatars/41.jpg",
            text: t.bought,
            tier: 2,
        },
        {
            id: "second",
            type: "comment",
            username: "leo_shots",
            avatarColor: AVATAR_COLORS[3],
            avatarImg: "/avatars/56.jpg",
            text: pool[13],
            tier: 3,
        },
    ];
}

/**
 * Handler for the callbacks the decorative preview must ignore.
 */
const noop = () => {};

/**
 * Reaction resting on the right side, gently moving unless reduced motion is requested.
 *
 * @param className - Position and animation classes of the reaction, which differ for each one
 * @param children - Heart or photo shown inside the floating wrapper
 */
function Floating({ className, children }: { className: string; children: React.ReactNode }) {
    return <div className={cn("absolute motion-reduce:animate-none", className)}>{children}</div>;
}

interface Props {
    config: LiveConfig;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    cameraActive: boolean;
    topInset?: number;
    compact?: boolean;
}

/**
 * Decorative miniature of the live screen that follows the config. The wrapper is a size container: on short
 * screens the layers that would reach the top bar are dropped, and compact mode keeps only the top bar.
 *
 * @param config - Live config being edited; profile, comments language, viewers and reaction colors are read
 * @param videoRef - Ref attached to the video element so the parent can bind the camera stream to it
 * @param cameraActive - True when the stream is playing; otherwise the gradient fallback is drawn instead of the video
 * @param topInset - Space in pixels kept above the top bar for the buttons floating over the preview
 * @param compact - Hides the comments, badge bar and hearts when there is little room
 */
export function Preview({ config, videoRef, cameraActive, topInset = 0, compact = false }: Props) {
    const { username, avatarUrl } = config.profile;
    const { language } = config.comments;
    const name = username || PLACEHOLDER;
    const viewers = config.viewers.initial;
    const colors = config.reactions.colors.length > 0 ? config.reactions.colors : ["white"];
    const color = (i: number) => colors[i % colors.length];
    const showHearts = config.reactions.heartsPerMinute > 0 && !compact;

    return (
        <div className="relative h-full overflow-hidden rounded-2xl bg-scene [container-type:size]">
            <p className="sr-only">{username ? `Aperçu du live de ${username}` : "Aperçu du live"}</p>

            <div
                inert
                aria-hidden="true"
                lang={language}
                className="pointer-events-none absolute inset-0 isolate font-live select-none text-white"
            >
                <video
                    ref={videoRef}
                    className={cn(
                        "absolute inset-0 h-full w-full -scale-x-100 object-cover",
                        !cameraActive && "hidden",
                    )}
                    playsInline
                    muted
                    autoPlay
                />
                {!cameraActive && <div className="absolute inset-0 bg-live-fallback" />}

                <div className="absolute inset-x-0 top-0 h-[110px] bg-scrim-top" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-scrim-bottom" />

                <div className="absolute inset-x-0" style={{ top: topInset }}>
                    <TopBar
                        username={name}
                        avatarUrl={avatarUrl}
                        avatarColor={username ? avatarColor(username) : PLACEHOLDER_COLOR}
                        viewerCount={viewers}
                        language={language}
                        onClose={noop}
                        onTap={noop}
                    />
                </div>

                {showHearts && (
                    <div className="absolute inset-0 z-[2] [@container(max-height:300px)]:hidden">
                        <Floating className="bottom-[170px] right-3 animate-[preview-float_3.1s_ease-in-out_infinite]">
                            <HeartGlyph size={24} color={color(1)} opacity={0.8} className="drop-shadow-glyph" />
                        </Floating>
                        <Floating className="bottom-[140px] right-5 animate-[preview-float_2.4s_ease-in-out_0.6s_infinite]">
                            <HeartGlyph size={19} color={color(0)} opacity={0.9} className="drop-shadow-glyph" />
                        </Floating>
                        <Floating className="bottom-[104px] right-3 animate-[preview-bob_2.8s_ease-in-out_infinite]">
                            {/* eslint-disable-next-line @next/next/no-img-element -- 28px decorative photo, nothing to optimize */}
                            <img
                                src="/avatars/8.jpg"
                                alt=""
                                draggable={false}
                                className="block size-7 rounded-full border-[1.5px] border-white object-cover shadow-heart-photo"
                            />
                        </Floating>
                        <Floating className="bottom-[72px] right-3.5 animate-[preview-float_2.7s_ease-in-out_0.3s_infinite]">
                            <HeartGlyph size={22} color={color(colors.length - 1)} className="drop-shadow-glyph" />
                        </Floating>
                    </div>
                )}

                {!compact && (
                    <>
                        <div
                            className="comment-fade absolute right-[82px] bottom-[68px] left-3 z-[2] flex flex-col justify-end gap-3 overflow-hidden [@container(max-height:300px)]:right-3 [@container(max-height:300px)]:bottom-2 [@container(max-height:300px)]:gap-2 [@container(max-height:150px)]:hidden"
                            style={{ top: topInset + 62 }}
                        >
                            {sampleComments(language).map((entry) => (
                                <Comment key={entry.id} entry={entry} language={language} />
                            ))}
                        </div>
                        <div className="[@container(max-height:300px)]:hidden">
                            <BadgeBar username={name} language={language} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
