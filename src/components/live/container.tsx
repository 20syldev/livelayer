"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Countdown } from "@/components/live/countdown";
import { EndConfirm, EndScreen } from "@/components/live/ending";
import { Feed } from "@/components/live/feed";
import { Hearts } from "@/components/live/hearts";
import { ShareSheet } from "@/components/live/sharesheet";
import { BadgeBar, Toolbar } from "@/components/live/toolbar";
import { TopBar } from "@/components/live/topbar";
import { avatarColor as colorFor } from "@/data/colors";
import type { LiveConfig } from "@/data/config";
import { useCamera } from "@/hooks/camera";
import { type CommentEntry, useComments } from "@/hooks/comments";
import { useFullscreen } from "@/hooks/fullscreen";
import { useHearts } from "@/hooks/hearts";
import { useElapsedTime } from "@/hooks/timer";
import { useViewerCount } from "@/hooks/viewers";
import { uid } from "@/lib/random";
import { cn } from "@/lib/utils";

type Phase = "countdown" | "live" | "confirm" | "ended";

interface Props {
    config: LiveConfig;
}

/**
 * Full screen live: a rounded video card with its overlays above a black toolbar, then the end alert and the end
 * summary. Phases run countdown, live, confirm and ended. The countdown covers the already mounted live so that the
 * camera stream can attach to its video, which is mirrored like a front camera and replaced by a gradient while the
 * camera is off. The simulation stays idle behind the countdown and the live is inert until it is over. Configs
 * saved before the countdown option existed have no countdown field and are treated as enabled. Reaching
 * config.duration skips the confirm alert and ends the live directly, and a camera permission granted after the end
 * is still stopped. Three quick taps on the host name leave instantly without the end screen.
 *
 * @param config - Saved live settings: profile, comment language, camera, countdown, duration and simulation options
 */
export function LiveContainer({ config }: Props) {
    const router = useRouter();
    const { exit } = useFullscreen();
    const { username, avatarUrl } = config.profile;
    const { language } = config.comments;
    const avatarColor = colorFor(username);

    const [phase, setPhase] = useState<Phase>(() => ((config.countdown ?? true) ? "countdown" : "live"));
    const [shareOpen, setShareOpen] = useState(false);
    const counting = phase === "countdown";
    const { elapsed, finished } = useElapsedTime(config.duration, !counting && phase !== "ended");
    const ended = phase === "ended" || finished;
    const running = !counting && !ended;
    const { videoRef, state: camState, start: startCamera, stop: stopCamera } = useCamera();

    useEffect(() => {
        if (config.camera) void startCamera();
    }, [config.camera, startCamera]);

    useEffect(() => {
        if (ended && camState === "active") stopCamera();
    }, [ended, camState, stopCamera]);

    const { count: viewerCount, peak: peakViewers } = useViewerCount(config, elapsed);
    const { comments, total: totalComments, addComment } = useComments(config, running, viewerCount);
    const { hearts, removeHeart, spawnHeart } = useHearts(config, running);

    const leave = useCallback(async () => {
        await exit();
        router.push("/app");
    }, [exit, router]);

    const tapCountRef = useRef(0);
    const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(
        () => () => {
            if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
        },
        [],
    );

    const handleTap = useCallback(() => {
        tapCountRef.current += 1;
        if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
        tapTimerRef.current = setTimeout(() => {
            tapCountRef.current = 0;
        }, 600);
        if (tapCountRef.current >= 3) {
            tapCountRef.current = 0;
            stopCamera();
            void leave();
        }
    }, [leave, stopCamera]);

    const handleSend = useCallback(
        (text: string) => {
            const entry: CommentEntry = {
                id: uid(),
                type: "comment",
                username,
                avatarColor,
                avatarImg: avatarUrl,
                text,
                tier: 0,
            };
            addComment(entry);
        },
        [addComment, username, avatarColor, avatarUrl],
    );

    if (ended) {
        return (
            <div lang={language} className="visual fixed inset-0 overflow-hidden bg-black font-live">
                <EndScreen
                    username={username}
                    avatarUrl={avatarUrl}
                    avatarColor={avatarColor}
                    language={language}
                    elapsed={elapsed}
                    peakViewers={peakViewers}
                    totalComments={totalComments}
                    onDone={() => void leave()}
                />
            </div>
        );
    }

    return (
        <div
            lang={language}
            className="visual fixed inset-0 flex flex-col overflow-hidden bg-black pt-[env(safe-area-inset-top,0px)] font-live text-white"
        >
            <div inert={counting} className="relative isolate min-h-0 flex-1 overflow-hidden rounded-2xl bg-scene">
                <video
                    ref={videoRef}
                    className={cn(
                        "absolute inset-0 h-full w-full -scale-x-100 object-cover",
                        camState !== "active" && "hidden",
                    )}
                    playsInline
                    muted
                    autoPlay
                />

                {camState !== "active" && <div className="absolute inset-0 bg-live-fallback" />}

                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-[110px] bg-scrim-top"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-scrim-bottom"
                />

                <TopBar
                    username={username}
                    avatarUrl={avatarUrl}
                    avatarColor={avatarColor}
                    viewerCount={viewerCount}
                    language={language}
                    onClose={() => setPhase("confirm")}
                    onTap={handleTap}
                />

                <Hearts hearts={hearts} onRemove={removeHeart} />
                <Feed comments={comments} language={language} />
                <BadgeBar username={username} language={language} />
            </div>

            <div inert={counting} className="contents">
                <Toolbar
                    language={language}
                    onSend={handleSend}
                    onShare={() => setShareOpen(true)}
                    onLike={spawnHeart}
                />
                <ShareSheet
                    open={shareOpen}
                    username={username}
                    language={language}
                    onClose={() => setShareOpen(false)}
                />
            </div>

            {phase === "confirm" && (
                <EndConfirm language={language} onEnd={() => setPhase("ended")} onCancel={() => setPhase("live")} />
            )}

            {counting && <Countdown onDone={() => setPhase("live")} />}
        </div>
    );
}
