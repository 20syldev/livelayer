"use client";

import { useEffect, useEffectEvent, useState } from "react";

const SECONDS = 3;

/**
 * Black 3-2-1 screen shown before the live starts, it calls onDone after the last second.
 * The count is keyed so that the enter animation restarts every second.
 *
 * @param onDone - Called once when the last second has elapsed, may change between renders
 */
export function Countdown({ onDone }: { onDone: () => void }) {
    const [count, setCount] = useState(SECONDS);
    const done = useEffectEvent(onDone);

    useEffect(() => {
        const id = setTimeout(() => (count > 1 ? setCount(count - 1) : done()), 1000);
        return () => clearTimeout(id);
    }, [count]);

    return (
        <div
            role="timer"
            aria-live="assertive"
            aria-atomic="true"
            className="fixed inset-0 z-[60] flex select-none items-center justify-center bg-black font-live-display text-white"
        >
            <span
                key={count}
                className="text-[96px] font-light leading-none tabular-nums duration-500 ease-out animate-in fade-in zoom-in-115 motion-reduce:animate-none"
            >
                {count}
            </span>
        </div>
    );
}
