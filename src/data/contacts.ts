import { AVATAR_COUNT } from "@/data/colors";
import type { LiveConfig } from "@/data/config";

export interface Contact {
    id: string;
    name: string;
    handle: string;
    photo: string | null;
    group?: { photo2: string; members: string[] };
    status?: "online" | number;
}

/**
 * Builds the path of a local avatar photo, picked from /public/avatars to match each first name.
 *
 * @param n - Photo number, 1-based; wraps around past AVATAR_COUNT
 * @returns Public path of the photo
 */
const photo = (n: number) => `/avatars/${((n - 1) % AVATAR_COUNT) + 1}.jpg`;

// Sample share recipients of the phone owner, same faces and statuses in every language
export const CONTACTS: Record<LiveConfig["comments"]["language"], Contact[]> = {
    en: [
        { id: "a", name: "Emma Collins", handle: "emma.cllns", photo: photo(26), status: "online" },
        { id: "b", name: "Maya Patel", handle: "maya.ptl", photo: photo(42), status: 8 },
        {
            id: "c",
            name: "Olivia + 2 others",
            handle: "",
            photo: photo(32),
            group: { photo2: photo(13), members: ["Olivia Brooks", "Ryan Hayes", "Sam Turner"] },
        },
        { id: "d", name: "Ryan Hayes", handle: "ryan_hys", photo: photo(13) },
        { id: "e", name: "Dad", handle: "mike.collins62", photo: photo(18), status: "online" },
        { id: "f", name: "jake.mlr", handle: "jake.mlr", photo: photo(12) },
        { id: "g", name: "Daniel Reed", handle: "dan.reed", photo: photo(59), status: 23 },
        { id: "h", name: "Anthony Walker-Price", handle: "anthony.wp", photo: photo(53) },
        { id: "i", name: "nate.prv", handle: "nate.prv", photo: null },
        { id: "j", name: "Max Garrett", handle: "max.grt", photo: photo(60) },
        { id: "k", name: "Sam Turner", handle: "sam.clicks", photo: photo(57) },
        { id: "l", name: "Olivia Brooks", handle: "olivia.brks", photo: photo(32), status: "online" },
    ],
    fr: [
        { id: "a", name: "Léa Martin", handle: "lea.mrtn", photo: photo(26), status: "online" },
        { id: "b", name: "Inès Benali", handle: "ines.bnl", photo: photo(42), status: 8 },
        {
            id: "c",
            name: "Chloé + 2 autres",
            handle: "",
            photo: photo(32),
            group: { photo2: photo(13), members: ["Chloé Lefèvre", "Thomas Roux", "Sacha Morel"] },
        },
        { id: "d", name: "Thomas Roux", handle: "thomas_rx", photo: photo(13) },
        { id: "e", name: "Papa", handle: "patrick.martin56", photo: photo(18), status: "online" },
        { id: "f", name: "hugo.mrl", handle: "hugo.mrl", photo: photo(12) },
        { id: "g", name: "Julien Bernard", handle: "julien.brnd", photo: photo(59), status: 23 },
        { id: "h", name: "Antoine Lambert-Dubois", handle: "antoine.lbd", photo: photo(53) },
        { id: "i", name: "nath.prv", handle: "nath.prv", photo: null },
        { id: "j", name: "Maxime Garnier", handle: "max.grn", photo: photo(60) },
        { id: "k", name: "Sacha Morel", handle: "sacha.clic", photo: photo(57) },
        { id: "l", name: "Chloé Lefèvre", handle: "chloe.lfv", photo: photo(32), status: "online" },
    ],
    es: [
        { id: "a", name: "Lucía Martín", handle: "lucia.mrtn", photo: photo(26), status: "online" },
        { id: "b", name: "Inés Benítez", handle: "ines.bntz", photo: photo(42), status: 8 },
        {
            id: "c",
            name: "Carla + 2 más",
            handle: "",
            photo: photo(32),
            group: { photo2: photo(13), members: ["Carla Ruiz", "Pablo Ortega", "Sergio Moreno"] },
        },
        { id: "d", name: "Pablo Ortega", handle: "pablo_ortg", photo: photo(13) },
        { id: "e", name: "Papá", handle: "jose.martin61", photo: photo(18), status: "online" },
        { id: "f", name: "hugo.grc", handle: "hugo.grc", photo: photo(12) },
        { id: "g", name: "Javier Romero", handle: "javi.romero", photo: photo(59), status: 23 },
        { id: "h", name: "Antonio López-Navarro", handle: "antonio.ln", photo: photo(53) },
        { id: "i", name: "nacho.prv", handle: "nacho.prv", photo: null },
        { id: "j", name: "Marcos Gil", handle: "marcos.gil", photo: photo(60) },
        { id: "k", name: "Sergio Moreno", handle: "sergio.clic", photo: photo(57) },
        { id: "l", name: "Carla Ruiz", handle: "carla.rz", photo: photo(32), status: "online" },
    ],
};
