"use client";

import PostGrid, {
  CategoriesType,
  PostType as MyPostType,
} from "@/app/(HOME)/blog/components/PostGrid";
import CommentForm from "@/components/forms/CommentForm";
import { placeHolder } from "@/public";
import {
  Admin,
  Comment,
  Image as ImageType,
  Post,
  User,
} from "@igraph/database";
import ReadOnlyLexicalEditor from "@igraph/editor/ReadOnlyEditor";
import RecaptchaWrapper from "@igraph/ui/components/RecaptchaWrapper";
import { extractSummaryFromLexical, formatJalaliDate } from "@igraph/utils";
import { CalendarDays, ChevronLeft, Clock, ListTree, MessageCircle } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import CommentsList from "./CommentsList";
import CopyLink from "./CoptLink";

export interface CommentType extends Comment {
  author: (User & { image: ImageType | null }) | null;
}
interface PostType extends Post {
  image: ImageType | null;
  author: Admin | null;
  categories: CategoriesType[];
  comments: CommentType[];
}

interface Props {
  post: PostType;
  relatedPosts: MyPostType[];
}

type Toc = {
  id: string;
  text: string | null;
  level: string;
}[];

const BlogPost = ({ post, relatedPosts }: Props) => {
  const [tocItems, setTocItems] = useState<Toc>([]);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const readingMinutes = useMemo(() => {
    const words = extractSummaryFromLexical(post.content, 100000).split(/\s+/).length;
    return Math.max(1, Math.round(words / 200));
  }, [post.content]);

  const generateTOC = useCallback(() => {
    const content = JSON.parse(post.content);
    const toc: Toc = [];

    function traverseNodes(nodes: any[]) {
      for (const node of nodes) {
        if (node.type === "heading" && node.tag && node.id) {
          toc.push({
            id: node.id,
            text:
              node.children?.map((child: any) => child.text).join(" ") || "",
            level: node.tag.toUpperCase(),
          });
        }
        if (node.children) {
          traverseNodes(node.children);
        }
      }
    }

    try {
      if (content.root && content.root.children) {
        traverseNodes(content.root.children);
      }
      setTocItems(toc);
    } catch (error) {
      console.error("Error parsing Lexical JSON:", error);
    }
  }, [post.content]);

  useEffect(() => {
    generateTOC();
  }, [generateTOC]);

  const handleTOCClick = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!post) return notFound();

  return (
    <article className="space-y-10 pb-20 pt-10 md:pt-16">
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[60] h-1 origin-right bg-gradient-to-l from-primary to-[#d4ff3f]"
      />

      <header className="relative isolate mx-auto max-w-4xl space-y-6 text-center">
        <div className="absolute -top-20 left-1/2 -z-10 h-56 w-[520px] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
        <nav className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">خانه</Link>
          <ChevronLeft size={12} />
          <Link href="/blog" className="hover:text-foreground">مجله</Link>
        </nav>
        <div className="flex flex-wrap justify-center gap-2">
          {post.categories.map((c) => (
            <Link
              key={c.categoryId}
              href={`/blog?category=${c.category.url}`}
              className="rounded-full bg-primary/15 px-3 py-1 text-xs text-primary transition-colors hover:bg-primary/25"
            >
              {c.category.name}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-black leading-tight md:text-5xl md:leading-[1.25]">{post.title}</h1>
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} />
            {formatJalaliDate(post.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            {readingMinutes} دقیقه مطالعه
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle size={14} />
            {post.comments.length} دیدگاه
          </span>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[2rem] border border-foreground/10"
      >
        <Image
          height={900}
          width={1600}
          priority
          src={post.image?.url || placeHolder}
          alt={post.title}
          className="aspect-[4/3] w-full bg-muted object-cover md:aspect-[21/9]"
        />
      </motion.div>

      <div
        className={`grid gap-10 ${tocItems.length ? "lg:grid-cols-[260px_minmax(0,1fr)]" : "mx-auto max-w-4xl"}`}
      >
        <aside className={`top-28 h-min lg:sticky ${tocItems.length ? "" : "hidden"}`}>
          {tocItems.length > 0 && (
            <nav className="studio-card p-5">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold">
                <ListTree size={16} className="text-primary" />
                فهرست مطالب
              </p>
              <ul className="space-y-1 border-r border-foreground/10">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleTOCClick(item.id);
                      }}
                      className={`-mr-px block border-r-2 border-transparent py-1.5 text-sm transition-colors hover:border-primary hover:text-foreground ${
                        item.level === "H3"
                          ? "pr-6 text-muted-foreground"
                          : item.level === "H4"
                            ? "pr-9 text-muted-foreground"
                            : "pr-3 font-semibold"
                      }`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>

        <div className="min-w-0 space-y-10">
          <div className="studio-card p-6 leading-9 md:p-10 md:text-[17px]">
            <ReadOnlyLexicalEditor content={post.content} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-dashed border-foreground/15 px-5 py-4">
            <p className="text-sm text-muted-foreground">این مقاله رو با دوستات به اشتراک بذار</p>
            <div className="font-mono">
              <CopyLink id={post.id} />
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-xl font-bold md:text-2xl">مقاله‌های مرتبط</h2>
              <PostGrid posts={relatedPosts} />
            </section>
          )}

          <section className="space-y-6">
            <h2 className="text-xl font-bold md:text-2xl">
              دیدگاه‌ها <span className="en-digits text-muted-foreground">({post.comments.length})</span>
            </h2>
            <div className="studio-card p-5 md:p-7">
              <p className="mb-4 font-semibold">دیدگاه شما</p>
              <RecaptchaWrapper recaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}>
                <CommentForm postId={post.id} />
              </RecaptchaWrapper>
            </div>
            <div className="space-y-3">
              <CommentsList comments={post.comments} />
            </div>
          </section>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
