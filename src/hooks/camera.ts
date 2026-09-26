"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraState = "idle" | "requesting" | "active" | "denied" | "unavailable";

/**
 * Requests the front-facing camera and attaches it to a video element, releasing it on stop or unmount.
 *
 * @returns The ref to put on the video element, the current state, and start and stop callbacks (both safe to call at any time)
 */
export function useCamera() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Bumped by every start and stop: a request that resolves after a newer call is discarded
    const requestRef = useRef(0);
    const [state, setState] = useState<CameraState>("idle");

    const start = useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setState("unavailable");
            return;
        }
        const request = ++requestRef.current;
        setState("requesting");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });

            // Stopped or unmounted while the permission prompt was open: release the camera at once
            if (request !== requestRef.current) {
                stream.getTracks().forEach((t) => t.stop());
                return;
            }
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {});
            }
            setState("active");
        } catch (error) {
            if (request !== requestRef.current) return;

            // Only a refusal is "denied"; no camera or a camera busy in another app is "unavailable"
            const name = error instanceof DOMException ? error.name : "";
            setState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
        }
    }, []);

    const stop = useCallback(() => {
        requestRef.current++;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setState("idle");
    }, []);

    useEffect(() => () => stop(), [stop]);

    return { videoRef, state, start, stop };
}
