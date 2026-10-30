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

// generated covers live in apps/app/public/dev-seed (served locally, not on Cloudinary)
const devImage = (name: string, type: "COURSE" | "POST") => ({
  create: {
    public_id: `dev-seed/${name}`,
    url: `/dev-seed/${name}.png`,
    format: "png",
    type,
    size: 0,
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
      ["نرم افزار های سه بعدی", "3d-software"],
      ["نرم افزار های ویدیویی", "video-software"],
      ["گرافیک دیزاین", "graphic-design"],
      ["نرم افزار های گرافیکی", "graphic-software"],
      ["طراحی محصول", "product-design"],
      ["هوش مصنوعی", "ai"],
    ]) {
      cats.push(
        await database.courseCategory.upsert({
          where: { url: urlSlug },
          update: { name },
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

    // [title, price (0 = free), category index, sections, lessons-per-section]
    const catalog: [string, number, number, number, number][] = [
      ["دوره تصویرسازی پیشرفته با هوش مصنوعی", 999_000, 5, 8, 5],
      ["دوره طراحی رابط کاربری Ui با فیگما 2025", 3_879_000, 4, 14, 11],
      ["مینی دوره طراحی بسته بندی و لیبل", 0, 2, 3, 6],
      ["دوره مقدماتی نرم افزار ادوبی ایلوستریتور", 0, 3, 4, 5],
      ["دوره جامع نرم افزار بلندر", 3_060_000, 0, 11, 6],
      ["دوره فشرده نرم افزار ادوبی پریمیر", 0, 1, 5, 4],
      ["دوره طراحی کارت ویزیت برش خاص و معمول", 849_000, 2, 2, 4],
      ["دوره جامع نرم افزار ادوبی فتوشاپ", 999_000, 3, 3, 10],
      ["دوره جامع نرم افزار ادوبی ایندیزاین", 999_000, 3, 3, 11],
      ["دوره جامع نرم افزار ادوبی ایلوستریتور", 3_119_000, 3, 10, 8],
      ["دوره جامع طراحی بسته بندی و لیبل", 3_279_000, 2, 10, 6],
    ];
    for (let i = 0; i < catalog.length; i++) {
      const [title, price, catIdx, sections, perSection] = catalog[i]!;
      const slug = `dev-course-${i + 1}`;
      const existing = await database.course.findUnique({ where: { url: slug } });
      if (existing) {
        // update in place: carts, enrollments and progress may already point at this course
        await database.course.update({
          where: { id: existing.id },
          data: {
            title,
            tizerUrl: "https://dl.igraphical.ir//Courses/ui-design/tizer.mp4",
            duration: 60 * sections + 30,
            basePrice: price,
            price: i === 9 ? price - 1_000_000 : price,
            categoryId: cats[catIdx]!.id,
          },
        });
        const firstLesson = await database.lesson.findFirst({
          where: { section: { courseId: existing.id } },
          orderBy: { id: "asc" },
        });
        if (firstLesson) {
          await database.lesson.update({
            where: { id: firstLesson.id },
            data: { isFree: true, url: "https://dl.igraphical.ir//Courses/ui-design/S3-E2.mp4" },
          });
        }
        continue;
      }
      await database.course.create({
        data: {
          title,
          url: slug,
          summary: lorem,
          description: lexical(lorem),
          // real teaser/episode from the live CDN so the players can be tested locally
          tizerUrl: "https://dl.igraphical.ir//Courses/ui-design/tizer.mp4",
          jobMarket: lorem,
          audience: "علاقه‌مندان به طراحی گرافیک",
          needs: "یک کامپیوتر ساده",
          duration: 60 * sections + 30, // minutes
          basePrice: price,
          price: i === 9 ? price - 1_000_000 : price,
          status: "PUBLISHED",
          releaseDate: new Date(),
          categoryId: cats[catIdx]!.id,
          tutorId: tutor.id,
          image: devImage(`course-${i + 1}`, "COURSE"),
          learn: {
            create: ["کار با ابزارها", "پروژه عملی", "نکات حرفه‌ای"].map((value) => ({ value })),
          },
          curriculum: {
            create: Array.from({ length: sections }, (_, s) => ({
              sectionTitle: `فصل ${s + 1}`,
              lessons: {
                create: Array.from({ length: perSection }, (_, l) => ({
                  title: `درس ${l + 1}`,
                  duration: 7, // minutes
                  url: s === 0 && l === 0 ? "https://dl.igraphical.ir//Courses/ui-design/S3-E2.mp4" : "",
                  isFree: s === 0 && l === 0,
                  type: "VIDEO" as const,
                })),
              },
            })),
          },
          review: {
            create: users.map((u, k) => ({
              userId: u.id,
              rate: k === 3 && i % 2 ? 4 : 5,
              content: "دوره عالی و کاربردی بود، خیلی چیز یاد گرفتم.",
            })),
          },
          ...(i === 9
            ? {
                discount: {
                  create: {
                    amount: 1_000_000,
                    type: "FIXED" as const,
                    from: new Date(Date.now() - 86400000),
                    to: new Date(Date.now() + 7 * 86400000),
                  },
                },
              }
            : {}),
        },
      });
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
    const postTitles = [
      "طراحی دایلاین آنلاین بسته‌بندی",
      "بهترین نرم‌افزار طراحی UI/UX | مقایسه ابزارهای طراحی رابط و تجربه کاربری",
      "طراحی رابط کاربری با هوش مصنوعی | تحول آینده UI Design چگونه رقم می‌خورد؟",
      "۱۰ ترفند فتوشاپ که هر طراحی باید بلد باشه",
    ];
    for (let i = 1; i <= postTitles.length; i++) {
      const slug = `dev-post-${i}`;
      await database.post.upsert({
        where: { url: slug },
        update: { title: postTitles[i - 1]! },
        create: {
          image: devImage(`post-${i}`, "POST"),
          title: postTitles[i - 1]!,
          url: slug,
          content: lexical(lorem + " " + lorem),
          status: "PUBLISHED",
          categories: { create: { categoryId: pcat.id } },
        },
      });
    }

    for (let i = 1; i <= postTitles.length; i++) {
      const post = await database.post.findUnique({ where: { url: `dev-post-${i}` }, include: { image: true } });
      if (post && !post.image) {
        await database.post.update({ where: { id: post.id }, data: { image: devImage(`post-${i}`, "POST") } });
      }
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

    await database.courseCategory.deleteMany({
      where: { url: { in: ["photoshop", "illustrator", "motion-graphic"] } },
    });

    console.log("dev seed done");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
})();
