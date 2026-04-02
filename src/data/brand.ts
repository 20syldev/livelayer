import pkg from "../../package.json";

// Identity data shared by the app, the landing and the metadata; visible copy lives in messages/
export const BRAND = {
    name: "LiveLayer",
    version: pkg.version,
    url: "https://livelayer.sylvain.sh",
    author: {
        name: "Sylvain",
        url: "https://sylvain.sh",
    },
    assets: {
        logo: "/logo.png",
    },
} as const;
