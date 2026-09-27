"use client";

import { CircleAlert, CircleCheck, Moon, Pointer, Radio, Sun, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { type PointerEvent, type ReactNode, useCallback, useId, useRef, useState } from "react";

import { FIELD, FIELD_INVALID } from "@/components/config/field";
import { Toggle } from "@/components/config/toggle";
import { Avatar } from "@/components/live/avatar";
import { avatarColor } from "@/data/colors";
import type { LiveConfig } from "@/data/config";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { audienceError, sanitizeUsername, USERNAME_MAX, usernameError } from "@/lib/validate";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: LiveConfig;
    onChange: (config: LiveConfig) => void;
    onFixAudience?: () => void;
}

// Dragging the handle further than this closes the sheet
const DISMISS_DISTANCE = 96;

const FOCUS_RING =
    "outline-none focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-card";

/**
 * Pre-launch bottom sheet: last checks, missing username and countdown, then opens the live. It portals into
 * the /app wrapper because that element carries the dark tokens and the font variables. There is no
 * Dialog.Trigger, so Radix cannot give focus back by itself: the opener is remembered. Focus starts on
 * "Lancer maintenant" when nothing is missing, or on the fix of what blocks it.
 *
 * @param open - Whether the sheet is shown
 * @param onOpenChange - Called with the next open state, on dismissal, drag-to-close and launch
 * @param config - Live config being checked and edited
 * @param onChange - Called with the whole updated config when the username or countdown changes
 * @param onFixAudience - Runs after the sheet closes on "Corriger l'audience"; the button is hidden when omitted
 */
export function LaunchSheet({ open, onOpenChange, config, onChange, onFixAudience }: Props) {
    const router = useRouter();

    const [host, setHost] = useState<HTMLElement | null>(null);
    const anchorRef = useCallback((el: HTMLSpanElement | null) => {
        if (el) setHost(el.closest<HTMLElement>(".dark"));
    }, []);

    const sheetRef = useRef<HTMLDivElement>(null);
    const dragStart = useRef<number | null>(null);

    const dragTo = (y: number) => {
        if (sheetRef.current) sheetRef.current.style.translate = y > 0 ? `0 ${y}px` : "";
    };

    const handleDragStart = (e: PointerEvent<HTMLDivElement>) => {
        dragStart.current = e.clientY;
        e.currentTarget.setPointerCapture(e.pointerId);
        sheetRef.current?.style.setProperty("transition", "none");
    };

    const handleDragMove = (e: PointerEvent<HTMLDivElement>) => {
        if (dragStart.current !== null) dragTo(e.clientY - dragStart.current);
    };

    const handleDragEnd = (e: PointerEvent<HTMLDivElement>) => {
        if (dragStart.current === null) return;
        const distance = e.clientY - dragStart.current;
        dragStart.current = null;
        sheetRef.current?.style.removeProperty("transition");
        if (e.type === "pointerup" && distance > DISMISS_DISTANCE) onOpenChange(false);
        else dragTo(0);
    };

    const opener = useRef<HTMLElement | null>(null);

    const handleOpenAutoFocus = (e: Event) => {
        opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const target = sheetRef.current?.querySelector<HTMLElement>("[data-autofocus]");
        if (!target) return;
        e.preventDefault();
        target.focus();
    };

    const handleCloseAutoFocus = (e: Event) => {
        e.preventDefault();
        opener.current?.focus();
        opener.current = null;
    };

    const launch = () => {
        if (usernameError(config.profile.username) || audienceError(config.viewers)) return;
        onOpenChange(false);
        router.push("/app/live");
    };

    return (
        <>
            <span ref={anchorRef} hidden />
            <Dialog.Root open={open} onOpenChange={onOpenChange}>
                <Dialog.Portal container={host}>
                    <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 duration-300 motion-safe:data-[state=open]:animate-in data-[state=open]:fade-in motion-safe:data-[state=closed]:animate-out data-[state=closed]:fade-out" />
                    <Dialog.Content
                        ref={sheetRef}
                        onOpenAutoFocus={handleOpenAutoFocus}
                        onCloseAutoFocus={handleCloseAutoFocus}
                        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[calc(100dvh_-_env(safe-area-inset-top)_-_12px)] w-full max-w-[480px] flex-col overflow-y-auto overscroll-contain rounded-t-[28px] border-t border-hairline bg-card px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] text-foreground shadow-drawer outline-none transition-[translate] duration-300 ease-sheet motion-safe:data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom motion-safe:data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom motion-reduce:transition-none sm:border-x"
                    >
                        <div
                            aria-hidden="true"
                            onPointerDown={handleDragStart}
                            onPointerMove={handleDragMove}
                            onPointerUp={handleDragEnd}
                            onPointerCancel={handleDragEnd}
                            className="-mx-5 -mt-3 flex flex-none cursor-grab touch-none justify-center pt-3 pb-4 active:cursor-grabbing"
                        >
                            <div className="h-1 w-9 rounded-full bg-grabber" />
                        </div>
                        <SheetBody
                            config={config}
                            onChange={onChange}
                            onLaunch={launch}
                            onFixAudience={
                                onFixAudience &&
                                (() => {
                                    onOpenChange(false);
                                    onFixAudience();
                                })
                            }
                        />
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}

interface BodyProps {
    config: LiveConfig;
    onChange: (config: LiveConfig) => void;
    onLaunch: () => void;
    onFixAudience?: () => void;
}

/**
 * Content of the launch sheet, remounted on every opening so the username field state starts fresh. The field
 * is decided at opening: it stays once the name becomes valid instead of vanishing mid-typing.
 *
 * @param config - Live config being checked and edited
 * @param onChange - Called with the whole updated config when the username or countdown changes
 * @param onLaunch - Called on "Lancer maintenant", which stays disabled while the config is invalid
 * @param onFixAudience - Shows a button next to the audience error that sends the user back to the audience tab
 */
function SheetBody({ config, onChange, onLaunch, onFixAudience }: BodyProps) {
    const { username, avatarUrl } = config.profile;
    const error = usernameError(username);
    const audienceIssue = audienceError(config.viewers);
    const [askName] = useState(error !== null);
    const showField = askName || error !== null;
    const nameValid = error === null;
    const valid = nameValid && audienceIssue === null;
    const countdown = config.countdown ?? true;
    const inputId = useId();
    const helpId = useId();
    const countdownId = useId();

    const setUsername = (raw: string) =>
        onChange({ ...config, profile: { ...config.profile, username: sanitizeUsername(raw) } });

    const initial = config.viewers.initial;
    const audience = `${formatNumber(initial)} viewer${initial > 1 ? "s" : ""} au départ`;

    return (
        <>
            <div className="flex flex-col gap-1.5">
                <Dialog.Title className="font-display text-[22px] leading-7 font-extrabold tracking-[-0.02em]">
                    Prêt à passer en direct&nbsp;?
                </Dialog.Title>
                {!showField && (
                    <div className="flex h-6 items-center gap-2">
                        <Avatar username={username} color={avatarColor(username)} url={avatarUrl} size={24} />
                        <Dialog.Description className="truncate text-sm text-soft">
                            <span className="font-semibold text-foreground">@{username}</span> - {audience}
                        </Dialog.Description>
                    </div>
                )}
            </div>

            {showField && (
                <div className="mt-4 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5">
                        {nameValid ? (
                            <CircleCheck className="size-5 flex-none text-success" strokeWidth={2} aria-hidden="true" />
                        ) : (
                            <CircleAlert className="size-5 flex-none text-danger" strokeWidth={2} aria-hidden="true" />
                        )}
                        <Dialog.Description aria-live="polite" className="text-sm leading-5 font-semibold">
                            {error && username ? error : "Ajoute ton nom d’utilisateur"}
                        </Dialog.Description>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor={inputId} className="sr-only">
                            Nom d’utilisateur
                        </label>
                        <div className={cn(FIELD, "h-11 gap-0.5 px-3.5", !nameValid && FIELD_INVALID)}>
                            <span aria-hidden="true" className="text-base font-medium text-caption">
                                @
                            </span>
                            <input
                                id={inputId}
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") e.currentTarget.blur();
                                }}
                                placeholder="ton.pseudo"
                                autoComplete="off"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                enterKeyHint="done"
                                maxLength={USERNAME_MAX}
                                aria-invalid={!nameValid}
                                aria-describedby={helpId}
                                className="h-full min-w-0 flex-1 bg-transparent p-0 text-base font-medium text-foreground outline-none placeholder:text-caption"
                            />
                        </div>
                        <p id={helpId} className="text-xs leading-4 text-soft">
                            Il s’affiche en haut du live.
                        </p>
                    </div>
                </div>
            )}

            {audienceIssue && (
                <div role="alert" className="mt-4 flex flex-col">
                    <div className="flex items-start gap-2.5">
                        <CircleAlert className="size-5 flex-none text-danger" strokeWidth={2} aria-hidden="true" />
                        <p className="text-sm leading-5 font-semibold">{audienceIssue}</p>
                    </div>
                    {onFixAudience && (
                        <button
                            type="button"
                            onClick={onFixAudience}
                            data-autofocus={!showField || undefined}
                            className={cn(
                                "-ml-2 h-11 self-start rounded-xl px-2 text-sm font-semibold text-pink transition-colors hover:bg-pink/10",
                                FOCUS_RING,
                            )}
                        >
                            Corriger l’audience
                        </button>
                    )}
                </div>
            )}

            <ul className="mt-4 flex flex-col gap-3">
                <Tip icon={<Moon size={18} strokeWidth={1.75} />} title="Active Ne pas déranger">
                    Une notification en plein live casserait la démo.
                </Tip>
                <Tip icon={<Sun size={18} strokeWidth={1.75} />} title="Monte la luminosité">
                    Un écran sombre se remarque.
                </Tip>
                <Tip
                    icon={<Pointer size={18} strokeWidth={1.75} />}
                    title="Pour quitter&nbsp;: triple-tap en haut à gauche"
                    aside={<PhoneHint />}
                >
                    Plus discret que la croix, visible par tous.
                </Tip>
            </ul>

            <div className="mt-4 flex items-center gap-3 border-t border-hairline pt-3">
                <Timer className="size-[18px] flex-none text-soft" strokeWidth={1.75} aria-hidden="true" />
                <label htmlFor={countdownId} className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm leading-5 font-semibold">Compte à rebours de 3&nbsp;s</span>
                    <span className="text-xs leading-4 text-caption">Le temps de tourner l’écran.</span>
                </label>
                <Toggle
                    id={countdownId}
                    checked={countdown}
                    onChange={(checked) => onChange({ ...config, countdown: checked })}
                    label="Compte à rebours de 3 s"
                />
            </div>

            <div className="mt-4 flex flex-col gap-1">
                <button
                    type="button"
                    onClick={onLaunch}
                    disabled={!valid}
                    aria-disabled={!valid}
                    data-autofocus={(!showField && !audienceIssue) || undefined}
                    className={cn(
                        "flex h-[52px] w-full flex-none items-center justify-center gap-2 rounded-full text-base font-bold transition-opacity",
                        FOCUS_RING,
                        valid
                            ? "brand-gradient text-white shadow-brand hover:opacity-95 active:opacity-90"
                            : "cursor-not-allowed bg-raised text-disabled",
                    )}
                >
                    <Radio className="size-5" strokeWidth={2} aria-hidden="true" />
                    Lancer maintenant
                </button>
                <Dialog.Close
                    className={cn(
                        "h-11 w-full flex-none rounded-xl text-sm font-semibold text-soft transition-colors hover:text-foreground",
                        FOCUS_RING,
                    )}
                >
                    Modifier la configuration
                </Dialog.Close>
            </div>
        </>
    );
}

interface TipProps {
    icon: ReactNode;
    title: string;
    children: ReactNode;
    aside?: ReactNode;
}

/**
 * Advice row of the launch sheet: icon, title, short explanation and an optional illustration on the right.
 *
 * @param icon - Decorative icon, hidden from screen readers
 * @param title - Bold one-line advice
 * @param children - Explanation shown under the title
 * @param aside - Illustration aligned to the right of the text, e.g. the phone sketch of the exit gesture
 */
function Tip({ icon, title, children, aside }: TipProps) {
    return (
        <li className="flex items-start gap-3">
            <span aria-hidden="true" className="flex size-5 flex-none items-center justify-center text-soft">
                {icon}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-sm leading-5 font-semibold">{title}</p>
                <p className="text-xs leading-4 text-caption">{children}</p>
            </div>
            {aside}
        </li>
    );
}

/**
 * Phone outline whose top-left corner pulses three times, like the hidden exit gesture: three quick rings then a
 * pause, the radius growing while the ring fades out.
 */
function PhoneHint() {
    const times = "0;0.04;0.14;0.15;0.19;0.29;0.3;0.34;0.44;1";
    return (
        <svg
            aria-hidden="true"
            width="40"
            height="72"
            viewBox="0 0 40 72"
            fill="none"
            className="block flex-none self-center"
        >
            <rect
                x="0.75"
                y="0.75"
                width="38.5"
                height="70.5"
                rx="8"
                strokeWidth="1.5"
                className="fill-surface stroke-caption"
            />
            <rect x="3" y="3" width="14" height="14" rx="5" className="fill-pink/30 stroke-pink" />
            <circle cx="10" cy="10" r="4.5" strokeWidth="1.25" opacity="0" className="stroke-pink motion-reduce:hidden">
                <animate
                    attributeName="r"
                    dur="2.4s"
                    repeatCount="indefinite"
                    keyTimes={times}
                    values="2.25;3.6;7.65;2.25;3.6;7.65;2.25;3.6;7.65;7.65"
                />
                <animate
                    attributeName="opacity"
                    dur="2.4s"
                    repeatCount="indefinite"
                    keyTimes={times}
                    values="0;0.95;0;0;0.95;0;0;0.95;0;0"
                />
            </circle>
            <circle cx="10" cy="10" r="2" className="fill-pink" />
            <rect x="6" y="52" width="16" height="3" rx="1.5" className="fill-raised" />
            <rect x="6" y="58" width="24" height="3" rx="1.5" className="fill-raised" />
            <rect x="6" y="64" width="12" height="3" rx="1.5" className="fill-raised" />
        </svg>
    );
}
