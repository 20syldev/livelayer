import type { LiveConfig } from "@/data/config";

export type Language = LiveConfig["comments"]["language"];

export interface LiveStrings {
    live: string;
    viewers: (count: string) => string;
    close: string;
    comment: string;
    commentLabel: string;
    more: string;
    post: string;
    questions: string;
    share: string;
    like: string;
    badgeBar: (username: string) => string;
    buy: string;
    joined: string;
    bought: string;
    chips: readonly [string, string, string, string];
    confirm: {
        title: string;
        message: string;
        end: string;
        cancel: string;
    };
    ended: {
        title: string;
        duration: string;
        viewers: string;
        comments: string;
        share: string;
        shared: string;
        done: string;
        caption: string;
    };
}

// Every string shown on the live screen, in the language of the comments
export const LIVE_STRINGS: Record<Language, LiveStrings> = {
    en: {
        live: "LIVE",
        viewers: (count) => `${count} viewers`,
        close: "Close",
        comment: "Add comment...",
        commentLabel: "Add a comment",
        more: "More options",
        post: "Post",
        questions: "Questions",
        share: "Share",
        like: "Like",
        badgeBar: (username) => `Buy a badge to support ${username}`,
        buy: "Buy",
        joined: "joined",
        bought: "bought a badge",
        chips: ["", "1-heart badge", "2-heart badge", "3-heart badge"],
        confirm: {
            title: "End your live video?",
            message: "Your viewers will no longer be able to watch it.",
            end: "End",
            cancel: "Cancel",
        },
        ended: {
            title: "Your live video has ended",
            duration: "Duration",
            viewers: "Viewers",
            comments: "Comments",
            share: "Share to your story",
            shared: "Shared to your story",
            done: "Done",
            caption: "Live videos aren't saved to this account.",
        },
    },
    fr: {
        live: "EN DIRECT",
        viewers: (count) => `${count} spectateurs`,
        close: "Fermer",
        comment: "Ajouter un commentaire…",
        commentLabel: "Ajouter un commentaire",
        more: "Plus d’options",
        post: "Publier",
        questions: "Questions",
        share: "Partager",
        like: "J’aime",
        badgeBar: (username) => `Achetez un badge pour soutenir ${username}`,
        buy: "Acheter",
        joined: "a rejoint",
        bought: "a acheté un badge",
        chips: ["", "Badge 1 cœur", "Badge 2 cœurs", "Badge 3 cœurs"],
        confirm: {
            title: "Mettre fin à ta vidéo en direct ?",
            message: "Tes spectateurs ne pourront plus la regarder.",
            end: "Mettre fin",
            cancel: "Annuler",
        },
        ended: {
            title: "Ta vidéo en direct est terminée",
            duration: "Durée",
            viewers: "Spectateurs",
            comments: "Commentaires",
            share: "Partager dans ta story",
            shared: "Partagée dans ta story",
            done: "Terminé",
            caption: "Les vidéos en direct ne sont pas enregistrées sur ce compte.",
        },
    },
    es: {
        live: "EN DIRECTO",
        viewers: (count) => `${count} espectadores`,
        close: "Cerrar",
        comment: "Añade un comentario…",
        commentLabel: "Añadir un comentario",
        more: "Más opciones",
        post: "Publicar",
        questions: "Preguntas",
        share: "Compartir",
        like: "Me gusta",
        badgeBar: (username) => `Compra una insignia para apoyar a ${username}`,
        buy: "Comprar",
        joined: "se unió",
        bought: "compró una insignia",
        chips: ["", "Insignia de 1 corazón", "Insignia de 2 corazones", "Insignia de 3 corazones"],
        confirm: {
            title: "¿Finalizar tu vídeo en directo?",
            message: "Tus espectadores ya no podrán verlo.",
            end: "Finalizar",
            cancel: "Cancelar",
        },
        ended: {
            title: "Tu vídeo en directo ha terminado",
            duration: "Duración",
            viewers: "Espectadores",
            comments: "Comentarios",
            share: "Compartir en tu historia",
            shared: "Compartido en tu historia",
            done: "Listo",
            caption: "Los vídeos en directo no se guardan en esta cuenta.",
        },
    },
};

/**
 * Looks up the live strings of a language.
 *
 * @param language - Language of the comments, possibly an unknown value read from an old saved config
 * @returns The strings of that language, or the English ones when it is unknown
 */
export function liveStrings(language: Language): LiveStrings {
    return LIVE_STRINGS[language] ?? LIVE_STRINGS.en;
}
