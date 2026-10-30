import Avatar from "@igraph/ui/components/Avatar";
import { formatJalaliDate } from "@igraph/utils";
import { CommentType } from "./BlogPost";

const CommentsList = ({ comments }: { comments: CommentType[] }) => {
  return (
    <>
      {comments.map((item, index) => (
        <div key={index} className="rounded-2xl border border-foreground/10 bg-card/40 p-5">
          <div className="mb-3 flex items-center gap-3">
            <Avatar src={item.author?.image?.url} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{item.author ? item.author.fullName : item.fullName}</span>
              <span className="text-[11px] text-muted-foreground">{formatJalaliDate(item.createdAt)}</span>
            </div>
          </div>
          <p className="whitespace-pre-line text-sm leading-7 text-foreground/85">{item.content}</p>
        </div>
      ))}
    </>
  );
};

export default CommentsList;
