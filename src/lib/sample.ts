import { avatarColor } from "@/data/colors";
import { type Language, liveStrings } from "@/data/live";
import { COMMENT_POOLS, type CommentEntry, type CommentType, type Tier } from "@/hooks/comments";

export interface SampleSeed {
    user: string;
    avatar: number;
    type: CommentType;
    tier: Tier;
    line?: number;
}

export const HOST = { username: "camille.drn", avatar: 26 };

export const SAMPLE_FEED: SampleSeed[] = [
    { user: "zoe_vibes", avatar: 41, type: "join", tier: 0 },
    { user: "henry_visual", avatar: 17, type: "comment", tier: 0, line: 4 },
    { user: "emma_vibes", avatar: 21, type: "comment", tier: 1, line: 13 },
    { user: "ethan_lens", avatar: 52, type: "badge", tier: 2 },
    { user: "layla_visual", avatar: 47, type: "comment", tier: 3, line: 42 },
    { user: "nolan_lens", avatar: 8, type: "comment", tier: 0, line: 1 },
    { user: "maya_daily", avatar: 12, type: "join", tier: 0 },
    { user: "leo_frames", avatar: 26, type: "comment", tier: 0, line: 36 },
    { user: "sofia_rvr", avatar: 5, type: "badge", tier: 1 },
    { user: "jake_photos", avatar: 3, type: "comment", tier: 0, line: 25 },
];

/**
 * Builds a comment entry from a sample seed, for the static previews and mock screens.
 * Comment pools share the same order in every language, so one line index works for all of them.
 *
 * @param seed - Sample author and kind; join and badge seeds ignore the text and use the language strings
 * @param id - Entry id, unique within the list it is rendered in
 * @param language - Language of the pool and of the join and badge texts
 * @param text - Overrides the pooled line for a regular comment (empty when the line index is out of range)
 * @returns The entry, with the avatar photo taken from the seed
 */
export function sampleEntry(seed: SampleSeed, id: string, language: Language, text?: string): CommentEntry {
    const strings = liveStrings(language);
    let body = text ?? COMMENT_POOLS[language][seed.line ?? 0] ?? "";
    if (seed.type === "join") body = strings.joined;
    if (seed.type === "badge") body = strings.bought;
    return {
        id,
        type: seed.type,
        username: seed.user,
        avatarColor: avatarColor(seed.user),
        avatarImg: `/avatars/${seed.avatar}.jpg`,
        text: body,
        tier: seed.tier,
    };
}
