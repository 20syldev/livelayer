"use client";

import { Camera, Link2, LoaderCircle, User } from "lucide-react";
import { useId, useRef, useState } from "react";

import { FIELD, FIELD_INVALID } from "@/components/config/field";
import { LABEL, SECTIONS } from "@/components/config/section";
import { avatarColor } from "@/data/colors";
import type { LiveConfig } from "@/data/config";
import { cn } from "@/lib/utils";
import { sanitizeUsername, USERNAME_MAX, usernameError } from "@/lib/validate";

interface Props {
    config: LiveConfig;
    onChange: (update: LiveConfig | ((config: LiveConfig) => LiveConfig)) => boolean | void;
}

const PHOTO_SIZE = 256;
const HINT = "Comme sur Instagram : minuscules, chiffres, points et _.";

const LINK =
    "relative inline-flex h-9 items-center gap-1.5 rounded-lg text-[13px] font-semibold outline-none after:absolute after:-inset-1 after:content-[''] focus-visible:ring-2 focus-visible:ring-pink";

/**
 * Tells whether a text is an absolute http or https URL with a host, as an avatar link must be.
 *
 * @param text - Raw text typed or pasted by the user
 * @returns True for http: and https: URLs with a hostname, false for anything else including unparsable text
 */
function isHttpUrl(text: string): boolean {
    try {
        const url = new URL(text);
        return (url.protocol === "http:" || url.protocol === "https:") && url.hostname !== "";
    } catch {
        return false;
    }
}

/**
 * Center-crops an image file and downscales it to a small JPEG data URL that fits in localStorage. The canvas is
 * filled with white first because JPEG has no alpha: transparent pixels would turn black.
 *
 * @param file - Image picked by the user, any format the browser can decode
 * @returns JPEG data URL of a PHOTO_SIZE square
 * @throws When the image cannot be decoded or has no pixels
 */
async function toPhoto(file: File): Promise<string> {
    const src = URL.createObjectURL(file);
    try {
        const img = new Image();
        img.src = src;
        await img.decode();
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = PHOTO_SIZE;
        const ctx = canvas.getContext("2d");
        if (!side || !ctx) throw new Error("Unreadable image");

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, PHOTO_SIZE, PHOTO_SIZE);
        ctx.imageSmoothingQuality = "high";
        const sx = (img.naturalWidth - side) / 2;
        const sy = (img.naturalHeight - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
        return canvas.toDataURL("image/jpeg", 0.85);
    } finally {
        URL.revokeObjectURL(src);
    }
}

/**
 * Config tab for the profile: avatar photo (file or URL) and username, validated the way Instagram does.
 *
 * @param config - Live config being edited; its profile section is read
 * @param onChange - Receives a new config or an updater function, so successive edits never overwrite each other;
 * returns false when the config could not be stored
 */
export function ProfileTab({ config, onChange }: Props) {
    const { username, avatarUrl } = config.profile;
    const id = useId();
    const fileRef = useRef<HTMLInputElement>(null);
    const userRef = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);
    const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
    const [urlOpen, setUrlOpen] = useState(false);
    const [urlDraft, setUrlDraft] = useState("");
    const [urlError, setUrlError] = useState<string | null>(null);

    const setProfile = (patch: Partial<LiveConfig["profile"]>) =>
        onChange((current) => ({ ...current, profile: { ...current.profile, ...patch } }));

    const pickFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        setBusy(true);
        setPhotoError(null);
        let photo: string;
        try {
            photo = await toPhoto(file);
        } catch {
            setPhotoError("Impossible de lire cette image. Essaie avec une autre photo.");
            return;
        } finally {
            setBusy(false);
        }
        if (setProfile({ avatarUrl: photo }) === false) {
            setPhotoError("Impossible d’enregistrer la photo : l’espace de stockage du navigateur est plein.");
            return;
        }
        setUrlOpen(false);
    };

    const toggleUrl = () => {
        setUrlOpen(!urlOpen);
        setUrlDraft(avatarUrl && isHttpUrl(avatarUrl) ? avatarUrl : "");
        setUrlError(null);
    };

    const submitUrl = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        const url = urlDraft.trim();
        if (!isHttpUrl(url)) {
            setUrlError(url ? "Le lien doit commencer par http:// ou https://." : "Colle le lien d’une image.");
            return;
        }
        setProfile({ avatarUrl: url });
        setPhotoError(null);
        setUrlOpen(false);
    };

    const removePhoto = () => {
        setProfile({ avatarUrl: null });
        setPhotoError(null);
        setUrlOpen(false);
    };

    const photo = avatarUrl && avatarUrl !== brokenUrl ? avatarUrl : null;
    const photoMessage =
        photoError ??
        (avatarUrl && avatarUrl === brokenUrl
            ? "Impossible d’afficher cette image. Vérifie le lien ou choisis une autre photo."
            : null);
    const error = usernameError(username);

    return (
        <div className={SECTIONS}>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3.5">
                    <div className="relative size-16 shrink-0" aria-busy={busy}>
                        <button
                            type="button"
                            tabIndex={-1}
                            aria-hidden="true"
                            onClick={() => fileRef.current?.click()}
                            className={cn("block size-full rounded-full", busy && "opacity-60")}
                        >
                            {photo ? (
                                // eslint-disable-next-line @next/next/no-img-element -- data URL or any user URL, static export
                                <img
                                    src={photo}
                                    alt=""
                                    draggable={false}
                                    onError={() => setBrokenUrl(photo)}
                                    className="block size-full rounded-full object-cover"
                                />
                            ) : username ? (
                                <span
                                    className="flex size-full items-center justify-center rounded-full text-3xl font-bold text-white"
                                    style={{ backgroundColor: avatarColor(username) }}
                                >
                                    {username[0].toUpperCase()}
                                </span>
                            ) : (
                                <span className="flex size-full items-center justify-center rounded-full bg-surface text-caption">
                                    <User className="size-8" strokeWidth={1.75} />
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            aria-label="Changer la photo de profil"
                            disabled={busy}
                            onClick={() => fileRef.current?.click()}
                            className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border-[3px] border-background bg-raised text-foreground outline-none after:absolute after:-inset-1.5 after:content-[''] focus-visible:ring-2 focus-visible:ring-pink"
                        >
                            {busy ? (
                                <LoaderCircle className="size-[15px] animate-spin" />
                            ) : (
                                <Camera className="size-[15px]" />
                            )}
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickFile} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm leading-5 font-semibold">Photo de profil</p>
                        <p className="text-xs leading-4 text-caption">
                            Choisis-en une dans ta galerie. Elle s’affiche en haut du live.
                        </p>
                        <div className="mt-0.5 flex items-center gap-4">
                            <button
                                type="button"
                                aria-expanded={urlOpen}
                                aria-controls={urlOpen ? `${id}-url-form` : undefined}
                                onClick={toggleUrl}
                                className={cn(LINK, "text-pink")}
                            >
                                <Link2 className="size-[15px]" />
                                Utiliser une URL
                            </button>
                            {avatarUrl && (
                                <button type="button" onClick={removePhoto} className={cn(LINK, "text-soft")}>
                                    Retirer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {photoMessage && (
                    <p role="alert" className="text-xs text-danger">
                        {photoMessage}
                    </p>
                )}
                {urlOpen && (
                    <form id={`${id}-url-form`} noValidate onSubmit={submitUrl} className="flex flex-col gap-2">
                        <label htmlFor={`${id}-url`} className={cn(LABEL, "text-soft")}>
                            Lien de la photo
                        </label>
                        <div className="flex gap-2">
                            <input
                                id={`${id}-url`}
                                type="url"
                                inputMode="url"
                                value={urlDraft}
                                onChange={(event) => {
                                    setUrlDraft(event.target.value);
                                    setUrlError(null);
                                }}
                                placeholder="https://…"
                                autoFocus
                                autoCapitalize="none"
                                autoCorrect="off"
                                autoComplete="off"
                                spellCheck={false}
                                enterKeyHint="done"
                                aria-invalid={urlError ? true : undefined}
                                aria-describedby={`${id}-url-help`}
                                className={cn(
                                    FIELD,
                                    "h-11 min-w-0 flex-1 px-3.5 text-base font-medium text-foreground outline-none placeholder:text-caption",
                                    urlError && FIELD_INVALID,
                                )}
                            />
                            <button
                                type="submit"
                                className="h-11 shrink-0 rounded-xl px-2 text-sm font-semibold text-pink outline-none focus-visible:ring-2 focus-visible:ring-pink"
                            >
                                Valider
                            </button>
                        </div>
                        <p id={`${id}-url-help`} className={cn("text-xs", urlError ? "text-danger" : "text-caption")}>
                            {urlError ?? "Un lien direct vers une image (.jpg, .png…)."}
                        </p>
                    </form>
                )}
            </div>

            <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                    <label htmlFor={`${id}-user`} className={LABEL}>
                        Nom d’utilisateur
                    </label>
                    <span className="text-xs text-caption tabular-nums">
                        {username.length}/{USERNAME_MAX}
                    </span>
                </div>
                <div className={cn(FIELD, "h-11", error && FIELD_INVALID)} onClick={() => userRef.current?.focus()}>
                    <span aria-hidden="true" className="pl-3.5 text-base font-medium text-caption">
                        @
                    </span>
                    <input
                        ref={userRef}
                        id={`${id}-user`}
                        type="text"
                        value={username}
                        onChange={(event) => setProfile({ username: sanitizeUsername(event.target.value) })}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") event.currentTarget.blur();
                        }}
                        placeholder="ton.pseudo"
                        maxLength={USERNAME_MAX}
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        spellCheck={false}
                        enterKeyHint="done"
                        aria-invalid={error ? true : undefined}
                        aria-describedby={`${id}-user-help`}
                        className="h-full min-w-0 flex-1 bg-transparent pr-3.5 pl-[3px] text-base font-medium text-foreground outline-none placeholder:text-caption"
                    />
                </div>
                <p id={`${id}-user-help`} className={cn("mt-1.5 text-xs", error ? "text-danger" : "text-caption")}>
                    {error ?? HINT}
                </p>
            </div>
        </div>
    );
}
