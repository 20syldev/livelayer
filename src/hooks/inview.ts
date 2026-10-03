"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether the referenced element is on screen, so loops can pause when it is not.
 *
 * @returns A tuple of the ref to attach to the element and a flag that is false until the observer first reports it visible
 */
export function useInView<T extends Element>() {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return [ref, inView] as const;
}
