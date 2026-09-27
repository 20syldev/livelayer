interface Props {
    username: string;
    color: string;
    size: number;
    url?: string | null;
}

/**
 * Round profile photo, or the colored initial when there is no photo.
 *
 * @param username - Name whose first letter is shown when there is no photo
 * @param color - CSS background of the initial disc, ignored when a photo is shown
 * @param size - Diameter in pixels, the initial scales with it (42%, never under 10px)
 * @param url - Photo URL of any origin, null or omitted to fall back to the initial
 */
export function Avatar({ username, color, size, url }: Props) {
    if (url) {
        return (
            // eslint-disable-next-line @next/next/no-img-element -- any user URL, static export without optimizer
            <img
                src={url}
                alt=""
                draggable={false}
                className="shrink-0 rounded-full object-cover"
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <div
            className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
            style={{
                width: size,
                height: size,
                backgroundColor: color,
                fontSize: Math.max(10, Math.round(size * 0.42)),
            }}
        >
            {username[0]?.toUpperCase()}
        </div>
    );
}
