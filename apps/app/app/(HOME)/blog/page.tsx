import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { getPostCategories } from "@/data/post";
import { placeHolder } from "@/public";
import { database, Prisma } from "@igraph/database";
import Pagination from "@igraph/ui/components/Pagination";
import { extractSummaryFromLexical, formatJalaliDate, pagination } from "@igraph/utils";
import { ArrowUpLeft, Newspaper } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "../components/home/PageHero";
import PostCard from "./components/PostCard";

interface Props {
  searchParams: Promise<{ category: string; page: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { category, page } = await searchParams;

  const postCategories = await getPostCategories();

  const pageSize = 15;
  const { skip, take } = pagination(page, pageSize);

  const where: Prisma.PostWhereInput = {
    status: "PUBLISHED",
    ...(category && {
      categories: { some: { category: { url: category } } },
    }),
  };

  const [posts, totalPosts] = await Promise.all([
    database.post
      .findMany({
        where,
        include: { categories: { include: { category: true } }, image: true },
        orderBy: { id: "desc" },
        take,
        skip,
      })
      .then((list) => list.map((post) => ({ ...post, categories: post.categories.map((c) => c.category) }))),
    database.post.count({ where }),
  ]);

  const showFeatured = !category && (!page || page === "1") && posts.length > 3;
  const [featured, ...rest] = showFeatured ? posts : [undefined, ...posts];

  return (
    <div className="space-y-12 pb-20 pt-10 md:pt-16">
      <PageHero
        eyebrow="مجله آی‌گرافیکال"
        title={
          <>
            از گوشه و اطراف <span className="text-gradient">دنیای گرافیک</span>
          </>
        }
        description="آموزش‌های رایگان، بررسی ابزارها، تکنیک‌ها و ترفندهای کاربردی در طراحی گرافیک، بسته‌بندی، موشن و رابط کاربری."
        stats={[{ value: totalPosts, label: "مقاله" }]}
      />

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {[{ label: "همه مقالات", value: "" }, ...postCategories].map((c) => {
          const active = (category ?? "") === c.value;
          return (
            <Link
              key={c.value || "all"}
              href={c.value ? `/blog?category=${c.value}` : "/blog"}
              scroll={false}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-foreground/10 text-muted-foreground hover:border-foreground/25 hover:text-foreground"
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      {featured && (
        <Link
          href={`/${featured.url}`}
          className="group grid overflow-hidden rounded-[2rem] border border-foreground/10 bg-card/40 transition-colors hover:border-primary/40 lg:grid-cols-[1.3fr_1fr]"
        >
          <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[380px]">
            <Image
              src={featured.image?.url || placeHolder}
              alt={featured.title}
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center gap-5 p-6 md:p-10">
            <span className="w-fit rounded-full bg-lime px-3 py-1 text-[11px] font-bold text-black">مقاله ویژه</span>
            <h2 className="text-2xl font-black leading-snug md:text-3xl">{featured.title}</h2>
            <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
              {extractSummaryFromLexical(featured.content)}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatJalaliDate(featured.createdAt)}</span>
              <span className="flex size-10 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-all group-hover:-rotate-45 group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowUpLeft size={18} />
              </span>
            </div>
          </div>
        </Link>
      )}

      {rest.length ? (
        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <StaggerItem key={post!.id}>
              <PostCard post={post!} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        !featured && (
          <div className="studio-card flex flex-col items-center gap-4 px-6 py-20 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-foreground/5 text-muted-foreground">
              <Newspaper size={24} />
            </span>
            <p className="text-lg font-bold">هنوز مقاله‌ای در این دسته منتشر نشده</p>
            <Link href="/blog" className="text-sm text-primary hover:underline">
              نمایش همه مقالات
            </Link>
          </div>
        )
      )}

      <div className="flex justify-center">
        <Pagination pageSize={pageSize} totalItems={totalPosts} />
      </div>
    </div>
  );
};

export default page;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "وبلاگ",
  description:
    "مطالب تخصصی، آموزش‌های رایگان، بررسی ابزارها، تکنیک‌ها و ترفندهای کاربردی در طراحی گرافیک، بسته‌بندی، موشن گرافیک، و طراحی رابط کاربری.",
};
