import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { placeHolder } from "@/public";
import { database } from "@igraph/database";
import { Button } from "@igraph/ui/components/ui/button";
import { formatJalaliDate } from "@igraph/utils";
import { ArrowLeft, ArrowUpLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SectionHeading from "./SectionHeading";

export default async function Journal() {
  const posts = await database.post.findMany({
    where: { status: "PUBLISHED" },
    include: { image: true, categories: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  if (!posts.length) return null;
  const [lead, ...rest] = posts;

  return (
    <section className="space-y-12">
      <SectionHeading
        index="07"
        eyebrow="مجله آی‌گرافیکال"
        title={
          <>
            از گوشه و اطراف
            <br />
            <span className="text-gradient">دنیای گرافیک</span>
          </>
        }
        action={
          <Link href="/blog">
            <Button variant="outline" className="group h-12 rounded-full border-foreground/15 px-6">
              همه مقالات
              <ArrowLeft className="transition-transform group-hover:-translate-x-1" />
            </Button>
          </Link>
        }
      />

      <Stagger className="grid gap-5 lg:grid-cols-2">
        <StaggerItem>
          <Link href={`/${lead!.url}`} className="group relative block h-full min-h-[420px] overflow-hidden rounded-[1.75rem] border border-foreground/10">
            <Image
              alt={lead!.title}
              src={lead!.image?.url || placeHolder}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 md:p-8">
              <div className="flex gap-2">
                {lead!.categories.map((c) => (
                  <span key={c.categoryId} className="rounded-full bg-white/15 px-3 py-1 text-[11px] text-white backdrop-blur">
                    {c.category.name}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl font-bold leading-snug text-white md:text-3xl">{lead!.title}</h3>
              <p className="text-xs text-white/60">{formatJalaliDate(lead!.createdAt)}</p>
            </div>
          </Link>
        </StaggerItem>

        <div className="flex flex-col gap-5">
          {rest.map((post) => (
            <StaggerItem key={post.id}>
              <Link
                href={`/${post.url}`}
                className="group flex items-center gap-5 rounded-[1.5rem] border border-foreground/10 bg-card/50 p-3 pe-5 transition-colors hover:border-primary/40"
              >
                <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl md:size-28">
                  <Image
                    alt={post.title}
                    src={post.image?.url || placeHolder}
                    fill
                    sizes="112px"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-[11px] text-primary">{post.categories[0]?.category.name}</p>
                  <h3 className="line-clamp-2 font-semibold leading-7">{post.title}</h3>
                  <p className="text-[11px] text-muted-foreground">{formatJalaliDate(post.createdAt)}</p>
                </div>
                <ArrowUpLeft size={18} className="shrink-0 text-muted-foreground transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:text-foreground" />
              </Link>
            </StaggerItem>
          ))}
        </div>
      </Stagger>
    </section>
  );
}
