// Avatar background colors, vibrant but readable with white text
export const AVATAR_COLORS: string[] = [
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#009688",
    "#4CAF50",
    "#FF9800",
    "#FF5722",
    "#795548",
    "#607D8B",
    "#F44336",
    "#00BCD4",
    "#8BC34A",
    "#FFC107",
    "#E040FB",
    "#00E5FF",
    "#FF6D00",
    "#AA00FF",
    "#00C853",
];

// Browser chrome colors (theme-color meta tag), which need literal values: black for the app, white and near-black for the landing
export const THEME_COLORS = { app: "#000000", siteLight: "#ffffff", siteDark: "#0b0b0e" } as const;

// Number of local avatar photos available in /public/avatars/
export const AVATAR_COUNT = 70;

// Heart reaction colors offered on the config page (Instagram-style), with their accessible names
export const HEART_COLORS: { value: string; name: string }[] = [
    { value: "#ED4956", name: "Cœurs rouges" },
    { value: "#E1306C", name: "Cœurs roses" },
    { value: "#833AB4", name: "Cœurs violets" },
    { value: "#F77737", name: "Cœurs orange" },
    { value: "#FFFFFF", name: "Cœurs blancs" },
];

/**
 * Picks the avatar color of a username, the same on the config page and the live.
 *
 * @param username - Username to hash, any string including an empty one
 * @returns One of AVATAR_COLORS, always the same for a given username
 */
export function avatarColor(username: string): string {
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
