import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { database, Prisma } from "@igraph/database";
import { SearchX } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import CourseCard from "./[slug]/components/CourseCard";
import PageHero from "../components/home/PageHero";

interface Props {
  searchParams: Promise<{
    category: string;
    tutor: string;
    isFree: "YES" | "NO";
  }>;
}

const Page = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const { category, isFree, tutor } = params;

  const where: Prisma.CourseWhereInput = {
    status: { not: "DRAFT" },
    ...(category ? { category: { is: { url: category } } } : {}),
    ...(isFree === "YES"
      ? { price: 0 }
      : isFree === "NO"
        ? { price: { not: 0 } }
        : {}),
    ...(tutor ? { tutor: { is: { slug: tutor } } } : {}),
  };

  const [courses, categories, tutors, total] = await Promise.all([
    database.course.findMany({
      where,
      orderBy: { id: "desc" },
      include: {
        image: true,
        discount: true,
        review: true,
        enrollment: true,
        category: true,
        curriculum: { include: { lessons: true } },
      },
    }),
    database.courseCategory.findMany(),
    database.tutor.findMany(),
    database.course.count({ where: { status: { not: "DRAFT" } } }),
  ]);

  // builds a link that toggles one filter while keeping the others
  const hrefWith = (key: string, value?: string) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== key) next.set(k, v);
    if (value && params[key as keyof typeof params] !== value) next.set(key, value);
    const qs = next.toString();
    return qs ? `/courses?${qs}` : "/courses";
  };

  const groups = [
    {
      key: "category",
      title: "دسته‌بندی",
      options: categories.map((c) => ({ label: c.name, value: c.url })),
    },
    {
      key: "isFree",
      title: "قیمت",
      options: [
        { label: "رایگان", value: "YES" },
        { label: "غیر رایگان", value: "NO" },
      ],
    },
    ...(tutors.length > 1
      ? [{ key: "tutor", title: "مدرس", options: tutors.map((t) => ({ label: t.displayName, value: t.slug })) }]
      : []),
  ];

  const hasFilter = Boolean(category || isFree || tutor);

  return (
    <div className="space-y-12 pb-20 pt-10 md:pt-16">
      <PageHero
        eyebrow="کتابخانه دوره‌ها"
        title={
          <>
            هر چیزی که برای <span className="text-gradient">ساختن</span> لازم داری
          </>
        }
        description="دوره‌های پروژه‌محور آی‌گرافیکال در طراحی گرافیک، نرم‌افزارهای گرافیکی، سه‌بعدی، ویدیو، طراحی محصول و هوش مصنوعی."
        stats={[
          { value: total, label: "دوره" },
          { value: categories.length, label: "مسیر یادگیری" },
          { value: tutors.length, label: "مدرس" },
        ]}
      />

      <div className="space-y-4 rounded-[1.75rem] border border-foreground/10 bg-card/40 p-4 md:p-5">
        {groups.map((g) => (
          <div key={g.key} className="flex flex-col gap-3 md:flex-row md:items-center">
            <p className="w-24 shrink-0 text-xs font-semibold text-muted-foreground">{g.title}</p>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
              {g.options.map((o) => {
                const active = params[g.key as keyof typeof params] === o.value;
                return (
                  <Link
                    key={o.value}
                    href={hrefWith(g.key, o.value)}
                    scroll={false}
                    className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-foreground/10 text-muted-foreground hover:border-foreground/25 hover:text-foreground"
                    }`}
                  >
                    {o.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          <span className="en-digits font-bold text-foreground">{courses.length}</span> دوره پیدا شد
        </p>
        {hasFilter && (
          <Link href="/courses" scroll={false} className="text-primary hover:underline">
            حذف فیلترها
          </Link>
        )}
      </div>

      {courses.length ? (
        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <StaggerItem key={course.id}>
              <CourseCard course={course} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <div className="studio-card flex flex-col items-center gap-4 px-6 py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-foreground/5 text-muted-foreground">
            <SearchX size={24} />
          </span>
          <p className="text-lg font-bold">دوره‌ای با این فیلترها پیدا نشد</p>
          <Link href="/courses" className="text-sm text-primary hover:underline">
            نمایش همه دوره‌ها
          </Link>
        </div>
      )}
    </div>
  );
};

export default Page;

export const metadata: Metadata = {
  title: "دوره ها",
  description:
    "دسترسی به کامل‌ترین دوره‌های آموزشی آی‌گرافیکال در زمینه طراحی، نرم‌افزارهای گرافیکی، بسته‌بندی، موشن دیزاین و UI/UX. آموزش‌های پروژه‌محور و بروز.",
};
