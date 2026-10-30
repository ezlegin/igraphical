import { database } from "./client";

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
  console.error("seed-dev refuses to run: DATABASE_URL is not local.");
  process.exit(1);
}

const lexical = (text: string) =>
  JSON.stringify({
    root: {
      type: "root",
      version: 1,
      direction: "rtl",
      format: "",
      indent: 0,
      children: [
        {
          type: "paragraph",
          version: 1,
          direction: "rtl",
          format: "",
          indent: 0,
          children: [
            { type: "text", version: 1, detail: 0, format: 0, mode: "normal", style: "", text },
          ],
        },
      ],
    },
  });

const lorem =
  "در این دوره قدم‌به‌قدم و با پروژه‌های واقعی، مهارت‌های لازم را یاد می‌گیرید و آماده ورود به بازار کار می‌شوید.";

(async () => {
  try {
    const tutor = await database.tutor.upsert({
      where: { slug: "ali-ahmadi" },
      update: {},
      create: {
        name: "علی احمدی",
        displayName: "علی احمدی",
        slug: "ali-ahmadi",
        password: "!dev-only-not-a-real-hash",
        bio: "طراح گرافیک و مدرس با بیش از ۱۰ سال سابقه کار حرفه‌ای.",
        titles: "طراح گرافیک، مدرس فتوشاپ",
        phone: "09120000001",
        email: "tutor-dev@example.com",
      },
    });

    const cats = [];
    for (const [name, urlSlug] of [
      ["فتوشاپ", "photoshop"],
      ["ایلاستریتور", "illustrator"],
      ["موشن گرافیک", "motion-graphic"],
    ]) {
      cats.push(
        await database.courseCategory.upsert({
          where: { url: urlSlug },
          update: {},
          create: { name, url: urlSlug },
        })
      );
    }

    const users = [];
    for (let i = 1; i <= 4; i++) {
      const names = ["سارا", "رضا", "مریم", "امیر"];
      users.push(
        await database.user.upsert({
          where: { phone: `0912000010${i}` },
          update: {},
          create: {
            firstName: names[i - 1]!,
            lastName: "کاربر",
            fullName: `${names[i - 1]} کاربر`,
            phone: `0912000010${i}`,
            email: `user${i}-dev@example.com`,
            nationalId: `000000000${i}`,
            phoneVerified: true,
          },
        })
      );
    }

    const titles = [
      "فتوشاپ از صفر تا صد",
      "ایلاستریتور حرفه‌ای",
      "افتر افکت مقدماتی",
      "طراحی لوگو و هویت بصری",
      "رتوش حرفه‌ای عکس",
      "آموزش کورل دراو",
      "طراحی پوستر خلاقانه",
      "موشن گرافیک پیشرفته",
    ];
    for (let i = 0; i < titles.length; i++) {
      const slug = `dev-course-${i + 1}`;
      if (await database.course.findUnique({ where: { url: slug } })) continue;
      const base = 1_200_000 + i * 300_000;
      const course = await database.course.create({
        data: {
          title: titles[i]!,
          url: slug,
          summary: lorem,
          description: lexical(lorem),
          tizerUrl: "",
          jobMarket: lorem,
          audience: "علاقه‌مندان به طراحی گرافیک",
          needs: "یک کامپیوتر ساده",
          duration: 3600 * (6 + i),
          basePrice: base,
          price: base,
          status: "PUBLISHED",
          releaseDate: new Date(),
          categoryId: cats[i % cats.length]!.id,
          tutorId: tutor.id,
          learn: {
            create: ["کار با ابزارها", "پروژه عملی", "نکات حرفه‌ای"].map(
              (value) => ({ value })
            ),
          },
          curriculum: {
            create: [
              {
                sectionTitle: "مقدمه",
                lessons: {
                  create: [
                    { title: "معرفی دوره", duration: 300, url: "", isFree: true, type: "VIDEO" },
                    { title: "نصب نرم‌افزار", duration: 600, url: "", isFree: false, type: "VIDEO" },
                  ],
                },
              },
            ],
          },
          review: {
            create: users.map((u, k) => ({
              userId: u.id,
              rate: 4 + (k % 2),
              content: "دوره عالی و کاربردی بود، خیلی چیز یاد گرفتم.",
            })),
          },
          ...(i % 3 === 0
            ? {
                discount: {
                  create: {
                    amount: 20,
                    type: "PERCENT" as const,
                    from: new Date(Date.now() - 86400000),
                    to: new Date(Date.now() + 7 * 86400000),
                  },
                },
              }
            : {}),
        },
      });
      void course;
    }

    await database.course.updateMany({
      where: { url: { startsWith: "dev-course-" } },
      data: { description: lexical(lorem) },
    });
    await database.post.updateMany({
      where: { url: { startsWith: "dev-post-" } },
      data: { content: lexical(lorem + " " + lorem) },
    });

    const pcat = await database.postCategory.upsert({
      where: { url: "design-tips" },
      update: {},
      create: { name: "نکات طراحی", url: "design-tips" },
    });
    for (let i = 1; i <= 4; i++) {
      const slug = `dev-post-${i}`;
      if (await database.post.findUnique({ where: { url: slug } })) continue;
      await database.post.create({
        data: {
          title: `مقاله نمونه شماره ${i}: ترفندهای طراحی`,
          url: slug,
          content: lexical(lorem + " " + lorem),
          status: "PUBLISHED",
          categories: { create: { categoryId: pcat.id } },
        },
      });
    }

    if (!(await database.notifbar.findFirst())) {
      await database.notifbar.create({
        data: {
          content: "🎉 تخفیف ویژه دوره‌های طراحی گرافیک تا پایان هفته",
          link: "/courses",
          bgColor: "#7c5cff",
          textColor: "#ffffff",
          active: true,
        },
      });
    }

    console.log("dev seed done");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
})();
