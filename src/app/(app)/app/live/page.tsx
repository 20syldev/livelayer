"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { LiveContainer } from "@/components/live/container";
import { useLiveConfig } from "@/hooks/config";
import { useFullscreen } from "@/hooks/fullscreen";
import { useHydrated } from "@/hooks/hydrated";

/**
 * Full-screen live route: renders the simulated live from the saved config and sends the visitor back to the
 * config screen when no username is set. Nothing renders and no redirect happens until a reload has hydrated,
 * because the saved config (and its username) is only read after that.
 */
export default function LivePage() {
    const router = useRouter();
    const [config] = useLiveConfig();
    const { enter } = useFullscreen();
    const hydrated = useHydrated();

    useEffect(() => {
        if (!hydrated) return;
        if (!config.profile.username.trim()) {
            router.replace("/app");
            return;
        }
        void enter();
    }, [hydrated, config, router, enter]);

    if (!hydrated || !config.profile.username.trim()) return null;

    return <LiveContainer config={config} />;
}
