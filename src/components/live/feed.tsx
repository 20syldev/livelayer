import { Comment } from "@/components/live/comment";
import type { Language } from "@/data/live";
import type { CommentEntry } from "@/hooks/comments";

interface Props {
    comments: CommentEntry[];
    language: Language;
}

/**
 * Comment list anchored above the toolbar, newest at the bottom, the oldest fading out towards the top.
 *
 * @param comments - Entries in arrival order, the last one is the newest and sits at the bottom
 * @param language - Language of the supporter chip labels
 */
export function Feed({ comments, language }: Props) {
    return (
        <div className="absolute bottom-[68px] left-3 right-[82px] z-[2] flex h-[40%] flex-col justify-end gap-3 overflow-hidden comment-fade">
            {comments.map((c) => (
                <Comment key={c.id} entry={c} language={language} />
            ))}
        </div>
    );
}
