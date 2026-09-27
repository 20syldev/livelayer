"use client";

import {
    type ReactNode,
    type PointerEvent as ReactPointerEvent,
    useEffect,
    useEffectEvent,
    useId,
    useRef,
    useState,
} from "react";

import type { LiveConfig } from "@/data/config";
import { type Contact, CONTACTS } from "@/data/contacts";
import { liveLink, SHARE_STRINGS } from "@/data/share";
import { cn } from "@/lib/utils";

interface Props {
    open: boolean;
    username: string;
    language: LiveConfig["comments"]["language"];
    onClose: () => void;
}

// Sheet detents: medium covers about 65% of the screen, large stops under the status bar
const MEDIUM_TOP = "34.5%";
const LARGE_TOP = "calc(env(safe-area-inset-top, 0px) + 10px)";

const PLAIN_BUTTON = "text-sheet-text tap-transparent";

/**
 * Lowercases a string and strips its accents, so that searches ignore case and diacritics.
 *
 * @param value - Text to normalize, a contact name or a search query
 * @returns The lowercase text decomposed to NFD with combining marks removed
 */
const normalize = (value: string) => value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

/**
 * 24 unit line icon of the sheet: stroked paths with round caps and joins, drawn from the given children.
 *
 * @param size - Width and height in pixels
 * @param tone - Tailwind stroke class that colors the lines, the sheet text color when omitted
 * @param stroke - Stroke width in viewBox units
 * @param children - SVG shapes drawn on a 24 by 24 viewBox
 */
function Glyph({
    size = 24,
    tone = "stroke-sheet-text",
    stroke = 1.8,
    children,
}: {
    size?: number;
    tone?: string;
    stroke?: number;
    children: ReactNode;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn("shrink-0", tone)}
        >
            {children}
        </svg>
    );
}

const CHECK = <path d="M4.5 12.5l5 5L19.5 7" />;

const GROUP_ADD = (
    <>
        <circle cx="9" cy="8.5" r="3.5" />
        <path d="M2.75 20c.5-3.6 3.1-5.75 6.25-5.75s5.75 2.15 6.25 5.75" />
        <path d="M14.6 5.2a3.5 3.5 0 0 1 0 6.6" />
        <path d="M19.5 13.5v6.5M16.25 16.75h6.5" />
    </>
);

/**
 * Round photo drawn as a background so that a long press does not offer to save the image.
 *
 * @param url - Photo URL, used as a cover background
 * @param size - Outer diameter in pixels, the ring included
 * @param ring - Width in pixels of the ring in the sheet color that separates it from a photo behind, none when omitted
 */
function Photo({ url, size, ring }: { url: string; size: number; ring?: number }) {
    return (
        <span
            className="block rounded-full border-sheet bg-sheet-field bg-cover bg-clip-padding bg-center"
            style={{ width: size, height: size, borderWidth: ring, backgroundImage: `url(${url})` }}
        />
    );
}

/**
 * Photo of a contact: a single photo, two overlapping photos for a group, or the anonymous silhouette without photo.
 *
 * @param contact - Contact to draw, a group needs its second photo
 * @param size - Diameter in pixels of the whole picture, group photos are scaled down inside it
 */
function ContactPhoto({ contact, size }: { contact: Contact; size: number }) {
    if (contact.group && contact.photo) {
        const back = Math.round(size * 0.7);
        const front = Math.round(size * 0.75);
        return (
            <>
                <span className="absolute left-0 top-0">
                    <Photo url={contact.photo} size={back} />
                </span>
                <span className="absolute" style={{ left: size - front, top: size - front }}>
                    <Photo url={contact.group.photo2} size={front} ring={size >= 64 ? 3 : 2} />
                </span>
            </>
        );
    }
    if (contact.photo) return <Photo url={contact.photo} size={size} />;
    return (
        <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="32" className="fill-sheet-avatar" />
            <circle cx="32" cy="25" r="11" className="fill-white" />
            <path
                d="M11.5 56C14 45.5 22.2 40 32 40s18 5.5 20.5 16A31.9 31.9 0 0 1 32 64a31.9 31.9 0 0 1-20.5-8z"
                className="fill-white"
            />
        </svg>
    );
}

/**
 * Grid cell of a contact: big photo with a selection check, an online dot or an "active x ago" pill, then the name.
 *
 * @param contact - Contact to show; a group needs its second photo and a contact without photo gets the silhouette
 * @param selected - Shows the check badge, which replaces the status badge
 * @param activeLabel - Text of the activity pill for a contact seen recently, null when there is none
 * @param onToggle - Called when the cell is pressed, to select or unselect the contact
 */
function Tile({
    contact,
    selected,
    activeLabel,
    onToggle,
}: {
    contact: Contact;
    selected: boolean;
    activeLabel: string | null;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onToggle}
            className={cn(PLAIN_BUTTON, "flex h-[116px] w-full flex-col items-center px-1.5")}
        >
            <span className="relative block size-20 shrink-0">
                <ContactPhoto contact={contact} size={80} />
                {selected ? (
                    <span
                        aria-hidden="true"
                        className="absolute -bottom-[3px] -right-[3px] flex size-[27px] items-center justify-center rounded-full border-[2.5px] border-sheet bg-sheet-accent"
                    >
                        <Glyph size={10} tone="stroke-white" stroke={3.6}>
                            {CHECK}
                        </Glyph>
                    </span>
                ) : contact.status === "online" ? (
                    <span
                        aria-hidden="true"
                        className="absolute left-[57px] top-[57px] size-5 rounded-full border-[3px] border-sheet bg-sheet-online"
                    />
                ) : activeLabel ? (
                    <span
                        aria-hidden="true"
                        className="absolute -right-2 bottom-px whitespace-nowrap rounded-full border-[2.5px] border-sheet bg-sheet-online-bg px-[5px] text-[11px]/[14px] font-semibold text-sheet-online"
                    >
                        {activeLabel}
                    </span>
                ) : null}
            </span>
            <span className="line-clamp-2 mt-1.5 w-full text-center text-[13px]/[15px] wrap-anywhere">
                {contact.name}
            </span>
        </button>
    );
}

/**
 * Search result line: small photo, name, handle or group members, and a round radio on the right.
 *
 * @param contact - Contact to show, the handle is hidden when it equals the name
 * @param selected - Fills the radio with the accent color and a check
 * @param onToggle - Called when the line is pressed, to select or unselect the contact
 */
function Row({ contact, selected, onToggle }: { contact: Contact; selected: boolean; onToggle: () => void }) {
    const sub = contact.group
        ? contact.group.members.join(", ")
        : contact.handle !== contact.name
          ? contact.handle
          : "";
    return (
        <button
            type="button"
            aria-pressed={selected}
            onClick={onToggle}
            className={cn(PLAIN_BUTTON, "flex h-16 w-full items-center gap-3 px-4 text-left")}
        >
            <span className="relative block size-12 shrink-0">
                <ContactPhoto contact={contact} size={48} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[16px]/[20px]">{contact.name}</span>
                {sub && <span className="truncate text-[14px]/[18px] text-sheet-muted">{sub}</span>}
            </span>
            <span
                aria-hidden="true"
                className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    selected ? "bg-sheet-accent" : "border-[1.5px] border-sheet-icon",
                )}
            >
                {selected && (
                    <Glyph size={12} tone="stroke-white" stroke={3.4}>
                        {CHECK}
                    </Glyph>
                )}
            </span>
        </button>
    );
}

/**
 * Round action of the bottom tray with its label, such as copy link or share.
 *
 * @param label - Text under the icon, clamped to two lines
 * @param icon - Glyph drawn in the round button
 * @param onClick - Called when the action is pressed
 */
function TrayItem({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(PLAIN_BUTTON, "flex w-[76px] shrink-0 flex-col items-center")}
        >
            <span className="flex size-[58px] items-center justify-center rounded-full bg-sheet-field">{icon}</span>
            <span className="line-clamp-2 mt-1.5 min-h-[30px] w-full text-center text-[12px]/[15px]">{label}</span>
        </button>
    );
}

interface Drag {
    pointer: number;
    startY: number;
    dy: number;
    time: number;
    velocity: number;
    moved: boolean;
}

/**
 * Instagram iOS share sheet (dark), opened from the paper plane of the live. It rests on a medium or a large
 * detent: dragging the header up expands it, and pulling it down collapses it or dismisses it, depending on the
 * distance and the release velocity. A fresh sheet is shown on every opening, even if the closing transition was
 * interrupted. The parent passes a new onClose on every live tick, so the Escape listener goes through an effect
 * event to stay stable. The native share sheet is used when the browser has one, like the share extension of the app.
 *
 * @param open - Slides the sheet in, and makes it and its backdrop inert while false
 * @param username - Host name, used to build the live link that is copied or shared
 * @param language - Language of the labels and of the contact list, falls back to French when unsupported
 * @param onClose - Called when the sheet is dismissed, by the backdrop, Escape, a pull down or an action
 */
export function ShareSheet({ open, username, language, onClose }: Props) {
    const t = SHARE_STRINGS[language] ?? SHARE_STRINGS.fr;
    const contacts = CONTACTS[language] ?? CONTACTS.fr;

    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [message, setMessage] = useState("");
    const [drag, setDrag] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);
    const [wasOpen, setWasOpen] = useState(open);

    const searchId = useId();
    const messageId = useId();
    const sheetRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const dragRef = useRef<Drag | null>(null);
    const draggedRef = useRef(false);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const reset = () => {
        setQuery("");
        setSearching(false);
        setExpanded(false);
        setSelected((s) => (s.length ? [] : s));
        setMessage("");
        setDrag(null);
    };

    if (open !== wasOpen) {
        setWasOpen(open);
        if (open) reset();
    }

    useEffect(
        () => () => {
            if (toastTimer.current) clearTimeout(toastTimer.current);
        },
        [],
    );

    const blurInside = () => {
        const active = document.activeElement;
        if (active instanceof HTMLElement && sheetRef.current?.contains(active)) active.blur();
    };

    const dismiss = () => {
        blurInside();
        onClose();
    };

    const onEscape = useEffectEvent(dismiss);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onEscape();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    const flash = (text: string) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast(text);
        toastTimer.current = setTimeout(() => setToast(null), 2200);
    };

    const link = liveLink(username);
    const isExpanded = searching || expanded;
    const count = selected.length;

    const collapse = () => {
        blurInside();
        setExpanded(false);
        setSearching(false);
        setQuery("");
    };

    const clearSearch = () => {
        searchRef.current?.blur();
        setSearching(false);
        setQuery("");
    };

    const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

    const copyLink = () => {
        void navigator.clipboard?.writeText(link).catch(() => {});
        dismiss();
        flash(t.linkCopied);
    };

    const nativeShare = () => {
        if (typeof navigator.share === "function") void navigator.share({ url: link }).catch(() => {});
        dismiss();
    };

    const send = () => {
        dismiss();
        flash(t.sent);
    };

    const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!e.isPrimary || e.button !== 0 || (e.target as HTMLElement).closest("input")) return;
        dragRef.current = {
            pointer: e.pointerId,
            startY: e.clientY,
            dy: 0,
            time: e.timeStamp,
            velocity: 0,
            moved: false,
        };
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const d = dragRef.current;
        if (!d || d.pointer !== e.pointerId) return;
        const dy = e.clientY - d.startY;
        if (!d.moved) {
            if (Math.abs(dy) < 6) return;
            d.moved = true;
            e.currentTarget.setPointerCapture(e.pointerId);
        }
        const dt = e.timeStamp - d.time;
        if (dt > 0) d.velocity = (dy - d.dy) / dt;
        d.dy = dy;
        d.time = e.timeStamp;
        setDrag(dy);
    };

    const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
        const d = dragRef.current;
        if (!d || d.pointer !== e.pointerId) return;
        dragRef.current = null;
        if (!d.moved) return;
        draggedRef.current = true;
        setTimeout(() => {
            draggedRef.current = false;
        }, 0);
        setDrag(null);
        if (e.type === "pointercancel") return;
        const velocity = e.timeStamp - d.time > 80 ? 0 : d.velocity;
        if (d.dy > 70 || velocity > 0.5) {
            if (isExpanded) collapse();
            else dismiss();
        } else if (d.dy < -50 || velocity < -0.5) {
            setExpanded(true);
        }
    };

    const q = normalize(query.trim());
    const results = q
        ? contacts.filter((c) => normalize([c.name, c.handle, ...(c.group?.members ?? [])].join(" ")).includes(q))
        : contacts;

    let top = isExpanded ? LARGE_TOP : MEDIUM_TOP;
    let shift = open ? "0px" : "100%";
    if (open && drag !== null && drag > 0) shift = `${drag}px`;
    if (open && drag !== null && drag < 0) {
        top = isExpanded
            ? `calc(${LARGE_TOP} + ${Math.max(drag / 6, -16)}px)`
            : `max(${LARGE_TOP}, calc(${MEDIUM_TOP} + ${drag}px))`;
    }
    const dim = open ? (drag !== null && drag > 0 && !isExpanded ? Math.max(0.3, 1 - drag / 500) : 1) : 0;
    const transition = drag !== null ? "none" : "top 340ms var(--ease-sheet), transform 340ms var(--ease-sheet)";

    const runAction = (key: string) => {
        if (key === "copy") copyLink();
        else if (key === "story") dismiss();
        else nativeShare();
    };

    const actions = [
        {
            key: "story",
            label: t.addToStory,
            icon: (
                <Glyph>
                    <circle cx="12" cy="12" r="9.25" strokeDasharray="3.1 2.71" />
                    <path d="M12 8.25v7.5M8.25 12h7.5" />
                </Glyph>
            ),
        },
        {
            key: "copy",
            label: t.copyLink,
            icon: (
                <Glyph>
                    <path d="M9.6 14.4l4.8-4.8" />
                    <path d="M11.1 6.7l1.4-1.4a4.3 4.3 0 0 1 6.1 6.1l-1.4 1.4" />
                    <path d="M12.9 17.3l-1.4 1.4a4.3 4.3 0 0 1-6.1-6.1l1.4-1.4" />
                </Glyph>
            ),
        },
        {
            key: "share",
            label: t.share,
            icon: (
                <Glyph>
                    <path d="M12 14.5V3" />
                    <path d="M8 6.75L12 2.75l4 4" />
                    <path d="M8.75 9.5H7.25a2.25 2.25 0 0 0-2.25 2.25v7.5a2.25 2.25 0 0 0 2.25 2.25h9.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-1.5" />
                </Glyph>
            ),
        },
        {
            key: "messages",
            label: t.messages,
            icon: (
                <Glyph>
                    <path d="M12 3.75c-4.97 0-9 3.47-9 7.75 0 2.3 1.17 4.37 3.03 5.79L5.6 20.5l3.62-1.66c.88.22 1.81.33 2.78.33 4.97 0 9-3.47 9-7.67S16.97 3.75 12 3.75z" />
                </Glyph>
            ),
        },
        {
            key: "email",
            label: t.email,
            icon: (
                <Glyph>
                    <rect x="3" y="5.25" width="18" height="13.5" rx="2.5" />
                    <path d="M3.75 7l8.25 6 8.25-6" />
                </Glyph>
            ),
        },
    ];

    return (
        <>
            <button
                type="button"
                aria-label={t.close}
                tabIndex={-1}
                inert={!open}
                onClick={dismiss}
                className={cn(
                    "fixed inset-0 z-30 cursor-default bg-black/50 tap-transparent",
                    !open && "pointer-events-none",
                )}
                style={{ opacity: dim, transition: drag !== null ? "none" : "opacity 240ms ease-out" }}
            />

            <div
                ref={sheetRef}
                inert={!open}
                onTransitionEnd={(e) => {
                    if (!open && e.target === e.currentTarget && e.propertyName === "transform") reset();
                }}
                className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[600px]"
                style={{ top, transform: `translateY(${shift})`, transition }}
            >
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t.title}
                    className="relative flex h-full flex-col overflow-hidden rounded-t-2xl bg-sheet text-sheet-text antialiased"
                >
                    <div
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerEnd}
                        onPointerCancel={onPointerEnd}
                        className="relative flex h-[72px] shrink-0 touch-none items-start pl-3 pr-2 pt-[27px]"
                    >
                        <button
                            type="button"
                            aria-label={isExpanded ? t.collapse : t.expand}
                            aria-expanded={isExpanded}
                            onClick={() => {
                                if (draggedRef.current) return;
                                if (isExpanded) collapse();
                                else setExpanded(true);
                            }}
                            className={cn(
                                PLAIN_BUTTON,
                                "absolute left-1/2 top-0 z-[1] -ml-10 flex h-6 w-20 cursor-grab items-start justify-center pt-3",
                            )}
                        >
                            <span className="block h-1 w-9 rounded-[2px] bg-sheet-grabber" />
                        </button>

                        <label htmlFor={searchId} className="sr-only">
                            {t.search}
                        </label>
                        <div className="flex h-9 min-w-0 flex-1 items-center gap-1.5 rounded-[10px] bg-sheet-field px-2.5">
                            <Glyph size={16} tone="stroke-sheet-muted" stroke={2.3}>
                                <circle cx="10.5" cy="10.5" r="7" />
                                <path d="M15.8 15.8L21 21" />
                            </Glyph>
                            <input
                                ref={searchRef}
                                id={searchId}
                                type="text"
                                placeholder={t.search}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                enterKeyHint="search"
                                value={query}
                                onFocus={() => setSearching(true)}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSearching(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") e.currentTarget.blur();
                                }}
                                className="h-9 min-w-0 flex-1 appearance-none bg-transparent text-[16px]/[20px] text-sheet-text caret-sheet-accent outline-none placeholder:text-sheet-muted"
                            />
                        </div>
                        <button
                            type="button"
                            aria-label={searching ? t.clearSearch : t.createGroup}
                            onClick={searching ? clearSearch : () => searchRef.current?.focus()}
                            className={cn(
                                PLAIN_BUTTON,
                                "-mt-1 ml-[9px] flex size-11 shrink-0 items-center justify-center",
                            )}
                        >
                            <Glyph>{searching ? <path d="M6 6l12 12M18 6L6 18" /> : GROUP_ADD}</Glyph>
                        </button>
                    </div>

                    {searching ? (
                        <div
                            className={cn(
                                "min-h-0 flex-1 overflow-y-auto overscroll-contain pt-1",
                                count ? "pb-2" : "pb-[calc(8px+env(safe-area-inset-bottom,0px))]",
                            )}
                        >
                            {results.map((c) => (
                                <Row
                                    key={c.id}
                                    contact={c}
                                    selected={selected.includes(c.id)}
                                    onToggle={() => toggle(c.id)}
                                />
                            ))}
                            {results.length === 0 && (
                                <p className="mx-4 mt-6 text-center text-[14px]/[18px] text-sheet-muted">
                                    {t.noResults}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3 pt-2">
                            <div className="grid grid-cols-3 gap-y-2">
                                {contacts.map((c) => (
                                    <Tile
                                        key={c.id}
                                        contact={c}
                                        selected={selected.includes(c.id)}
                                        activeLabel={typeof c.status === "number" ? t.active(c.status) : null}
                                        onToggle={() => toggle(c.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {count > 0 ? (
                        <div className="shrink-0 border-t-[0.5px] border-sheet-line pb-[calc(16px+env(safe-area-inset-bottom,0px))] pt-[7.5px]">
                            {count > 1 && (
                                <button
                                    type="button"
                                    onClick={send}
                                    className={cn(PLAIN_BUTTON, "flex h-12 w-full items-center gap-3 px-4 text-left")}
                                >
                                    <Glyph>{GROUP_ADD}</Glyph>
                                    <span className="min-w-0 flex-1 text-[15px]/[20px] font-semibold">
                                        {t.createGroup}
                                    </span>
                                    <Glyph size={16} tone="stroke-sheet-icon" stroke={2.2}>
                                        <path d="M9 5.5l6.5 6.5L9 18.5" />
                                    </Glyph>
                                </button>
                            )}
                            <label htmlFor={messageId} className="sr-only">
                                {t.message}
                            </label>
                            <input
                                id={messageId}
                                type="text"
                                placeholder={t.messagePlaceholder}
                                autoComplete="off"
                                enterKeyHint="send"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") send();
                                }}
                                className="block h-11 w-full appearance-none bg-transparent px-4 text-[16px]/[20px] text-sheet-text caret-sheet-accent outline-none placeholder:text-sheet-muted"
                            />
                            <div className="px-4 pt-2">
                                <button
                                    type="button"
                                    onClick={send}
                                    className={cn(
                                        PLAIN_BUTTON,
                                        "block h-11 w-full rounded-xl bg-sheet-accent px-4 text-[15px]/[20px] font-semibold text-white",
                                    )}
                                >
                                    {count > 1 ? t.sendSeparately : t.send}
                                </button>
                            </div>
                        </div>
                    ) : (
                        !searching && (
                            <div className="shrink-0 border-t-[0.5px] border-sheet-line pb-[calc(8px+max(env(safe-area-inset-bottom,0px),12px))] pt-4">
                                <div className="flex gap-2 overflow-x-auto overscroll-contain px-4">
                                    {actions.map((a) => (
                                        <TrayItem
                                            key={a.key}
                                            label={a.label}
                                            icon={a.icon}
                                            onClick={() => runAction(a.key)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {toast && (
                <div
                    role="status"
                    className="pointer-events-none fixed inset-x-4 bottom-[calc(78px+env(safe-area-inset-bottom,0px))] z-50 mx-auto max-w-[568px] rounded-xl bg-sheet-toast px-4 py-3 text-[14px]/[20px] text-sheet-text shadow-sheet-toast animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                    {toast}
                </div>
            )}
        </>
    );
}
