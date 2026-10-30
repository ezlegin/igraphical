import { placeHolder } from "@/public";
import { extractSummaryFromLexical, formatJalaliDate } from "@igraph/utils";
import { ArrowUpLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PostType } from "./PostGrid";

const PostCard = ({ post }: { post: PostType }) => {
  return (
    <Link
      href={`/${post.url}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-foreground/10 bg-card/50 p-2.5 transition-all duration-500 hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="relative overflow-hidden rounded-[1.35rem]">
        <Image
          alt={post.title}
          src={post.image?.url || placeHolder}
          width={600}
          height={375}
          className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {post.categories[0] && (
          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[11px] text-white backdrop-blur-md">
            {post.categories[0].name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 px-2 pb-2 pt-4">
        <h3 className="line-clamp-2 font-bold leading-7">{post.title}</h3>
        <p className="line-clamp-2 text-xs leading-6 text-muted-foreground">
          {extractSummaryFromLexical(post.content)}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
          <span>{formatJalaliDate(post.createdAt)}</span>
          <ArrowUpLeft size={16} className="transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
