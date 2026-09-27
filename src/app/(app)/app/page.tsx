"use client";

import { ChevronLeft, Maximize, Minimize, Radio, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import { AudienceTab } from "@/components/config/audience";
import { ChatTab } from "@/components/config/chat";
import { EffectsTab } from "@/components/config/effects";
import { LaunchSheet } from "@/components/config/launch";
import { Preview } from "@/components/config/preview";
import { ProfileTab } from "@/components/config/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_CONFIG, type LiveConfig } from "@/data/config";
import { useCamera } from "@/hooks/camera";
import { useLiveConfig } from "@/hooks/config";
import { useHydrated } from "@/hooks/hydrated";
import { cn } from "@/lib/utils";
import { audienceError, usernameError } from "@/lib/validate";

type TabId = "profile" | "audience" | "chat" | "effects";

const TABS: { id: TabId; label: string }[] = [
    { id: "profile", label: "Profil" },
    { id: "audience", label: "Audience" },
    { id: "chat", label: "Chat" },
    { id: "effects", label: "Effets" },
];

const NO_ERRORS: Record<TabId, string | null> = { profile: null, audience: null, chat: null, effects: null };

const UNDO_MS = 5000;

// Room for the round buttons above the preview's top bar
const PREVIEW_INSET = 46;

const OVERLAY_BUTTON =
    "absolute top-[calc(env(safe-area-inset-top,0px)+8px)] z-10 flex size-10 items-center justify-center rounded-full bg-overlay text-white outline-none backdrop-blur-sm transition-colors before:absolute before:-inset-0.5 hover:bg-overlay-hover focus-visible:ring-2 focus-visible:ring-pink";

// Each panel scrolls on its own and starts at the top when its tab opens
const PANEL = "absolute inset-0 overflow-y-auto overscroll-contain px-4 pt-3 pb-4";

// Phones and tablets: their on-screen keyboard covers the lower half of the page
const COARSE = "(pointer: coarse)";

/**
 * Subscribes to changes of the coarse-pointer media query, for useSyncExternalStore.
 *
 * @param onChange - Called each time the query starts or stops matching
 * @returns Cleanup that removes the listener
 */
function subscribeCoarse(onChange: () => void) {
    const query = window.matchMedia(COARSE);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

/**
 * Config screen of the simulator: live preview on top, settings tabs in the middle and the launch button at the
 * bottom.
 *
 * The static HTML holds the default config, so no tab error shows and no panel renders until the stored config is
 * read, which keeps the defaults from flashing. The opening tab is picked once at that point: Profil until a valid
 * name is set, then Chat. The live reads config.camera to start the camera, so the config follows the device and is
 * only written when its state changes. Reset keeps a short undo window. An inconsistent audience blocks the launch:
 * the button leads to the audience tab instead. On touch screens a focused text field shrinks the preview to its top
 * bar, so the on-screen keyboard does not cover the lower half of the page.
 */
export default function ConfigPage() {
    const [config, setConfig] = useLiveConfig();
    const camera = useCamera();
    const cameraActive = camera.state === "active";
    const hydrated = useHydrated();
    const coarse = useSyncExternalStore(
        subscribeCoarse,
        () => window.matchMedia(COARSE).matches,
        () => false,
    );

    const errors: Record<TabId, string | null> = hydrated
        ? {
              profile: usernameError(config.profile.username),
              audience: audienceError(config.viewers),
              chat: null,
              effects: null,
          }
        : NO_ERRORS;

    const [tab, setTab] = useState<TabId | null>(null);
    if (tab === null && hydrated) setTab(errors.profile ? "profile" : "chat");

    const [launchOpen, setLaunchOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [typing, setTyping] = useState(false);
    const compact = typing && coarse && !expanded;

    useEffect(() => {
        setConfig((c) => (c.camera === cameraActive ? c : { ...c, camera: cameraActive }));
    }, [cameraActive, setConfig]);

    const { state: cameraState, start: startCamera, stop: stopCamera } = camera;
    const toggleCamera = useCallback(() => {
        if (cameraState === "active") stopCamera();
        else if (cameraState !== "requesting") void startCamera();
    }, [cameraState, startCamera, stopCamera]);

    useEffect(() => {
        if (!expanded) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setExpanded(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [expanded]);

    const [undo, setUndo] = useState<LiveConfig | null>(null);
    const resetRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!undo) return;
        const timer = setTimeout(() => setUndo(null), UNDO_MS);
        return () => clearTimeout(timer);
    }, [undo]);

    const handleReset = () => {
        setUndo((previous) => previous ?? config);
        setConfig({ ...DEFAULT_CONFIG, camera: cameraActive });
    };

    const handleUndo = () => {
        if (undo) setConfig({ ...undo, camera: cameraActive });
        setUndo(null);
        resetRef.current?.focus();
    };

    const blocked = errors.audience !== null;
    const handleLaunch = () => {
        if (blocked) setTab("audience");
        else setLaunchOpen(true);
    };

    return (
        <main className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden bg-ground">
            <h1 className="sr-only">Configurer le live</h1>

            <div
                onClick={expanded ? () => setExpanded(false) : undefined}
                className={cn(
                    "flex-none overflow-hidden bg-black pt-[env(safe-area-inset-top)]",
                    expanded
                        ? "fixed inset-0 z-50 mx-auto max-w-md"
                        : compact
                          ? "relative h-[calc(env(safe-area-inset-top)+104px)] rounded-b-3xl"
                          : "relative h-[30dvh] max-h-[300px] min-h-[180px] rounded-b-3xl",
                )}
            >
                <Preview
                    config={config}
                    videoRef={camera.videoRef}
                    cameraActive={cameraActive}
                    topInset={PREVIEW_INSET}
                    compact={compact}
                />
                {!expanded && (
                    <Link href="/" aria-label="Retour" className={`${OVERLAY_BUTTON} left-3`}>
                        <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
                    </Link>
                )}
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    aria-label={expanded ? "Quitter le plein écran" : "Plein écran"}
                    className={`${OVERLAY_BUTTON} right-3`}
                >
                    {expanded ? (
                        <Minimize className="size-[18px]" strokeWidth={2} aria-hidden="true" />
                    ) : (
                        <Maximize className="size-[18px]" strokeWidth={2} aria-hidden="true" />
                    )}
                </button>
            </div>

            <Tabs
                value={tab ?? ""}
                onValueChange={(value) => setTab(value as TabId)}
                inert={expanded}
                className="min-h-0 flex-1 gap-0"
            >
                <TabsList
                    variant="line"
                    aria-label="Réglages du live"
                    className="mx-4 grid w-auto flex-none grid-cols-4 gap-0 border-b border-hairline p-0 group-data-[orientation=horizontal]/tabs:h-10"
                >
                    {TABS.map(({ id, label }) => (
                        <TabsTrigger
                            key={id}
                            value={id}
                            className="before:absolute before:inset-x-0 before:-inset-y-0.5 before:content-[''] h-full min-w-0 gap-1.5 rounded-none border-0 px-1 py-0 text-[13px] font-semibold text-soft transition-colors group-data-[orientation=horizontal]/tabs:after:inset-x-2 group-data-[orientation=horizontal]/tabs:after:-bottom-px hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink after:bg-pink min-[360px]:text-sm dark:text-soft"
                        >
                            {label}
                            {errors[id] && (
                                <>
                                    <span aria-hidden="true" className="size-1.5 flex-none rounded-full bg-danger" />
                                    <span className="sr-only">, à corriger</span>
                                </>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div
                    className="relative min-h-0 flex-1"
                    onFocus={(event) => setTyping(event.target instanceof HTMLInputElement)}
                    onBlur={(event) => {
                        if (!(event.relatedTarget instanceof HTMLInputElement)) setTyping(false);
                    }}
                >
                    {tab !== null && (
                        <>
                            <TabsContent value="profile" className={PANEL}>
                                <ProfileTab config={config} onChange={setConfig} />
                                <div className="mt-3 border-t border-hairline pt-1">
                                    <button
                                        ref={resetRef}
                                        type="button"
                                        onClick={handleReset}
                                        className="-ml-2 flex h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-soft outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-pink"
                                    >
                                        <RotateCcw className="size-4" strokeWidth={2} aria-hidden="true" />
                                        Réinitialiser la configuration
                                    </button>
                                </div>
                            </TabsContent>
                            <TabsContent value="audience" className={PANEL}>
                                <AudienceTab config={config} onChange={setConfig} />
                            </TabsContent>
                            <TabsContent value="chat" className={PANEL}>
                                <ChatTab config={config} onChange={setConfig} />
                            </TabsContent>
                            <TabsContent value="effects" className={PANEL}>
                                <EffectsTab
                                    config={config}
                                    onChange={setConfig}
                                    camera={{ state: camera.state, onToggle: toggleCamera }}
                                />
                            </TabsContent>
                        </>
                    )}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-[18px] bg-linear-to-b from-ground/0 to-ground"
                    />
                </div>
            </Tabs>

            <div
                inert={expanded}
                className={cn(
                    "relative flex-none px-4 pt-2 pb-[max(14px,env(safe-area-inset-bottom))]",
                    compact && "hidden",
                )}
            >
                <div role="status" className="absolute inset-x-4 bottom-full mb-2">
                    {undo && (
                        <div className="flex h-[52px] items-center gap-3 rounded-2xl border border-hairline bg-raised pr-1.5 pl-4 shadow-toast animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none">
                            <p className="min-w-0 flex-1 truncate text-sm font-medium">Configuration réinitialisée</p>
                            <button
                                type="button"
                                onClick={handleUndo}
                                className="h-11 flex-none rounded-xl px-3 text-sm font-semibold text-pink outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-pink"
                            >
                                Annuler
                            </button>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleLaunch}
                    aria-haspopup={blocked ? undefined : "dialog"}
                    aria-disabled={blocked || undefined}
                    className={cn(
                        "brand-gradient flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl text-base font-bold text-white outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-ground",
                        blocked ? "cursor-not-allowed opacity-40" : "shadow-brand hover:opacity-95 active:opacity-90",
                    )}
                >
                    <Radio className="size-5" strokeWidth={2} aria-hidden="true" />
                    Lancer le live
                    {blocked && <span className="sr-only">, corrige d’abord l’audience</span>}
                </button>
            </div>

            <LaunchSheet
                open={launchOpen}
                onOpenChange={setLaunchOpen}
                config={config}
                onChange={setConfig}
                onFixAudience={() => setTab("audience")}
            />
        </main>
    );
}
