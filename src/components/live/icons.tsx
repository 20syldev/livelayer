import { cn } from "@/lib/utils";

interface IconProps {
    size?: number;
    className?: string;
}

// Instagram-style glyphs are drawn inline because the lucide shapes differ too much from the real app
const HEART_PATH =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

/**
 * Solid heart cropped to its bounds, used by floating reactions and badge chips. It is white unless a color is
 * given, and the outline is opt-in so that a heart can follow the surrounding text color.
 *
 * @param size - Width and height in pixels of the square the cropped heart is fitted in
 * @param color - Fill as an SVG paint (hex, CSS variable, currentColor), white when omitted
 * @param opacity - Fill opacity from 0 to 1, fully opaque when omitted
 * @param stroke - Outline paint, no outline when omitted
 * @param strokeWidth - Outline width in viewBox units, only used with stroke
 * @param className - Extra classes merged after the defaults, e.g. a drop shadow
 */
export function HeartGlyph({
    size = 24,
    color,
    opacity,
    stroke,
    strokeWidth,
    className,
}: IconProps & { color?: string; opacity?: number; stroke?: string; strokeWidth?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="2 2.5 20 19.5"
            aria-hidden="true"
            className={cn("flex-none overflow-visible", className)}
        >
            <path
                d={HEART_PATH}
                className={color ? undefined : "fill-white"}
                fill={color}
                fillOpacity={opacity}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * Toolbar like button icon: a white outline, filled with the like red once liked.
 *
 * @param size - Width and height in pixels
 * @param filled - True once the live has been liked
 * @param className - Extra classes merged after the defaults
 */
export function HeartIcon({ size = 26, filled = false, className }: IconProps & { filled?: boolean }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn("overflow-visible", filled ? "text-like" : "text-white", className)}
        >
            <path
                d={HEART_PATH}
                fill={filled ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * Questions box icon: a rounded square speech card with a question mark and a stacked card behind it.
 *
 * @param size - Width and height in pixels
 * @param className - Extra classes merged after the defaults
 */
export function QuestionIcon({ size = 26, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn("text-white", className)}>
            <rect
                x="2.75"
                y="2.25"
                width="14.5"
                height="16.5"
                rx="2.75"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
            />
            <path
                d="M20.75 6.25v12.5a3 3 0 0 1-3 3H6.75"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M7.7 8.6a2.3 2.3 0 1 1 3.45 1.99c-.7.4-1.15.85-1.15 1.66v.55"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="10" cy="15.4" r="1.05" fill="currentColor" />
        </svg>
    );
}

/**
 * Direct paper plane icon, thin outline.
 *
 * @param size - Width and height in pixels
 * @param className - Extra classes merged after the defaults
 */
export function ShareIcon({ size = 26, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn("text-white", className)}>
            <path
                d="M22 3L9.22 10.08M11.7 20.33L22 3H2l7.22 7.08 2.48 10.25z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * White cross of the top bar with a soft shadow, so it stays readable over any video.
 *
 * @param size - Width and height in pixels
 * @param className - Extra classes merged after the defaults
 */
export function CloseIcon({ size = 22, className }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn("text-white drop-shadow-icon", className)}
        >
            <path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

/**
 * Eye outline shown in the viewer count pill.
 *
 * @param size - Width and height in pixels
 * @param className - Extra classes merged after the defaults
 */
export function EyeIcon({ size = 13, className }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn("flex-none text-white", className)}
        >
            <path
                d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3.2" fill="currentColor" />
        </svg>
    );
}

/**
 * Small filled caret next to the host username, with a soft shadow. Its size is fixed.
 *
 * @param className - Extra classes merged after the defaults, e.g. a negative margin
 */
export function CaretIcon({ className }: Omit<IconProps, "size">) {
    return (
        <svg
            width="10"
            height="6"
            viewBox="0 0 10 6"
            aria-hidden="true"
            className={cn("flex-none text-white drop-shadow-icon-sm", className)}
        >
            <path
                d="M1 0.75h8L5 5.25z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * Three horizontal dots of the comment field "more" button.
 *
 * @param size - Width and height in pixels
 * @param className - Extra classes merged after the defaults
 */
export function DotsIcon({ size = 20, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn("text-white", className)}>
            <circle cx="5.5" cy="12" r="1.7" fill="currentColor" />
            <circle cx="12" cy="12" r="1.7" fill="currentColor" />
            <circle cx="18.5" cy="12" r="1.7" fill="currentColor" />
        </svg>
    );
}

/**
 * Rounded check mark.
 *
 * @param size - Width and height in pixels
 * @param className - Extra classes merged after the defaults
 */
export function CheckIcon({ size = 16, className }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cn("flex-none text-white", className)}
        >
            <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
