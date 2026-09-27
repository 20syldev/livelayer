import { HeartGlyph } from "@/components/live/icons";
import type { HeartEntry } from "@/hooks/hearts";

/**
 * One floating reaction: a heart or a photo that rises and wobbles, then removes itself when its animation ends.
 *
 * @param heart - Reaction to draw, its x offset, size and duration (ms) drive the animation
 * @param onDone - Called with the heart id once the rise animation is over
 */
function Heart({ heart, onDone }: { heart: HeartEntry; onDone: (id: string) => void }) {
    return (
        <div
            className="absolute bottom-0 left-1/2"
            onAnimationEnd={() => onDone(heart.id)}
            style={{
                marginLeft: heart.x - heart.size / 2,
                animation: `heart-float ${heart.duration}ms ease-out forwards, heart-wobble ${heart.duration * 0.6}ms ease-in-out infinite`,
            }}
        >
            {heart.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- 28px decorative photo, nothing to optimize
                <img
                    src={heart.avatar}
                    alt=""
                    className="rounded-full border-[1.5px] border-white object-cover shadow-heart-photo"
                    style={{ width: heart.size, height: heart.size }}
                />
            ) : (
                <HeartGlyph
                    size={heart.size}
                    color={heart.color}
                    opacity={heart.opacity}
                    className="drop-shadow-glyph"
                />
            )}
        </div>
    );
}

/**
 * Reactions rising on the right, just above the badge bar. The layer ignores pointer events and is hidden
 * from assistive technologies.
 *
 * @param hearts - Reactions currently floating, each one is unmounted through onRemove
 * @param onRemove - Called with a heart id when its animation ends, the parent drops it from the list
 */
export function Hearts({ hearts, onRemove }: { hearts: HeartEntry[]; onRemove: (id: string) => void }) {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute bottom-[70px] right-3.5 z-[2] h-px w-[34px]">
            {hearts.map((h) => (
                <Heart key={h.id} heart={h} onDone={onRemove} />
            ))}
        </div>
    );
}
