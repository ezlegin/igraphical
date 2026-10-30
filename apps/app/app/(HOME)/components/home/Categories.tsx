import { database } from "@igraph/database";
import SectionHeading from "./SectionHeading";
import CategoryBento from "./CategoryBento";

export default async function Categories() {
  const categories = await database.courseCategory.findMany({
    include: { _count: { select: { courses: { where: { status: { not: "DRAFT" } } } } } },
  });

  if (!categories.length) return null;

  return (
    <section className="space-y-12">
      <SectionHeading
        index="01"
        eyebrow="مسیرهای یادگیری"
        title={
          <>
            چی می‌خوای <span className="text-gradient">بسازی؟</span>
          </>
        }
        description="از طراحی لوگو و بسته‌بندی تا سه‌بعدی و هوش مصنوعی؛ مسیرت رو انتخاب کن."
      />
      <CategoryBento
        categories={categories.map((c) => ({ name: c.name, url: c.url, count: c._count.courses }))}
      />
    </section>
  );
}
