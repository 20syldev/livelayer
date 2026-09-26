import type { LiveConfig } from "@/data/config";

export interface ShareStrings {
    title: string;
    close: string;
    expand: string;
    collapse: string;
    search: string;
    clearSearch: string;
    createGroup: string;
    noResults: string;
    addToStory: string;
    copyLink: string;
    share: string;
    messages: string;
    email: string;
    message: string;
    messagePlaceholder: string;
    send: string;
    sendSeparately: string;
    sent: string;
    linkCopied: string;
    active: (minutes: number) => string;
}

// Share sheet labels, worded like the Instagram iOS app in each language
export const SHARE_STRINGS: Record<LiveConfig["comments"]["language"], ShareStrings> = {
    en: {
        title: "Share",
        close: "Close",
        expand: "Expand",
        collapse: "Collapse",
        search: "Search",
        clearSearch: "Clear search",
        createGroup: "Create group",
        noResults: "No results found.",
        addToStory: "Add to story",
        copyLink: "Copy link",
        share: "Share…",
        messages: "Messages",
        email: "Email",
        message: "Message",
        messagePlaceholder: "Write a message…",
        send: "Send",
        sendSeparately: "Send separately",
        sent: "Sent",
        linkCopied: "Link copied",
        active: (minutes) => `${minutes}m`,
    },
    fr: {
        title: "Partager",
        close: "Fermer le partage",
        expand: "Agrandir le panneau",
        collapse: "Réduire le panneau",
        search: "Rechercher",
        clearSearch: "Annuler la recherche",
        createGroup: "Créer un groupe",
        noResults: "Aucun résultat.",
        addToStory: "Ajouter à la story",
        copyLink: "Copier le lien",
        share: "Partager…",
        messages: "Messages",
        email: "E-mail",
        message: "Message",
        messagePlaceholder: "Écrivez un message…",
        send: "Envoyer",
        sendSeparately: "Envoyer séparément",
        sent: "Envoyé",
        linkCopied: "Lien copié",
        active: (minutes) => `${minutes} min`,
    },
    es: {
        title: "Compartir",
        close: "Cerrar",
        expand: "Ampliar el panel",
        collapse: "Reducir el panel",
        search: "Buscar",
        clearSearch: "Borrar búsqueda",
        createGroup: "Crear grupo",
        noResults: "No se encontraron resultados.",
        addToStory: "Añadir a la historia",
        copyLink: "Copiar enlace",
        share: "Compartir…",
        messages: "Mensajes",
        email: "Correo",
        message: "Mensaje",
        messagePlaceholder: "Escribe un mensaje…",
        send: "Enviar",
        sendSeparately: "Enviar por separado",
        sent: "Enviado",
        linkCopied: "Enlace copiado",
        active: (minutes) => `${minutes} min`,
    },
};

/**
 * Builds the public link of a live, as copied by the real app.
 *
 * @param username - Sanitized host name, inserted into the URL without encoding
 * @returns The instagram.com live URL of that user
 */
export function liveLink(username: string): string {
    return `https://www.instagram.com/${username}/live/`;
}
