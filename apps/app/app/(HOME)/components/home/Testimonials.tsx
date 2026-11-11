import {
  studentProfile1,
  studentProfile2,
  studentProfile3,
  studentProfile4,
  studentProfile5,
  studentProfile6,
  studentProfile7,
} from "@/public";
import { Quote, Star } from "lucide-react";
import Image from "next/image";
import SectionHeading from "./SectionHeading";

const reviews = [
  {
    name: "محمدرضا سید طاهری",
    image: studentProfile1,
    course: "دوره فشرده ادوبی ایندیزاین",
    text: "در عین خلاصه بودن، تمام چیزهایی که لازمه رو توضیح میدین و برخلاف بقیه که از توضیح بعضی جزئیات طفره میرن، شما واقعا همه رو توضیح میدین.",
  },
  {
    name: "شهاب شیرزاد",
    image: studentProfile7,
    course: "دوره طراحی بسته‌بندی و لیبل",
    text: "بدون شک یکی از بهترین سرمایه‌گذاری‌های آموزشی که کردم. پر از نکات عملیه که بلافاصله می‌تونید در پروژه‌هاتون استفاده کنید. فقط دانش فنی خالص.",
  },
  {
    name: "محمد امین برهانی",
    image: studentProfile2,
    course: "دوره طراحی بسته‌بندی و لیبل",
    text: "مطالب دوره به شدت عالی و جامع بود و نحوه بیان و تدریس استاد هم خیلی خوب. من واقعا راضیم و واقعا میگم حلالتون باشه.",
  },
  {
    name: "میترا امین زاده",
    image: studentProfile3,
    course: "دوره جامع ادوبی ایلوستریتور",
    text: "روش تدریس آی‌گرافیکال خیلی متفاوت‌تر از هر کسیه که تو دنیای آموزش آنلاین فعالیت داره. مخصوصا اینکه هیچ اضافه‌گویی در آموزش‌ها نیست.",
  },
  {
    name: "آرین طاهربابایی",
    image: studentProfile4,
    course: "دوره جامع ادوبی فتوشاپ",
    text: "پک جامع آموزشتون در عین سادگی و بیان شیوا بسیار دقیق و کاربردی بود. بسیار راضی هستم از خرید و وقت گذاشتن برای این دوره.",
  },
  {
    name: "کیانا بذرافشان",
    image: studentProfile5,
    course: "دوره طراحی کارت ویزیت",
    text: "هزاران بار تشکر بابت آموزش‌های بسیار عالی مجموعه آی‌گرافیکال. همیشه سپاسگذار صداقت و وجدان کاری شما هستم.",
  },
  {
    name: "وحیده گویلی",
    image: studentProfile6,
    course: "دوره جامع ادوبی ایندیزاین",
    text: "آموزش ایندیزاین خیلی کم‌یاب بود و سایت‌های زیادی رو سر زدم، اما قدرت بیان و ارتباطی که استاد با دانش‌آموز می‌گیره واقعا دوست‌داشتنیه.",
  },
];

export default function Testimonials() {
  const rowA = [...reviews, ...reviews];
  const rowB = [...reviews.slice(3), ...reviews.slice(0, 3)];
  const rowBDoubled = [...rowB, ...rowB];

  return (
    <section className="space-y-12">
      <SectionHeading
        index="05"
        eyebrow="دانشجوهای آی‌گرافیکال گفتن"
        title={
          <>
            حرف <span className="text-gradient">هنرجوها</span>، نه ما
          </>
        }
        align="center"
      />

      <div className="studio-mask-x studio-marquee-pause -mx-3 space-y-4 overflow-hidden" dir="ltr">
        <div className="studio-marquee flex w-max gap-4" style={{ ["--marquee-duration" as string]: "70s" }}>
          {rowA.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </div>
        <div
          className="studio-marquee studio-marquee-reverse flex w-max gap-4"
          style={{ ["--marquee-duration" as string]: "80s" }}
        >
          {rowBDoubled.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: (typeof reviews)[number] }) {
  return (
    <figure
      dir="rtl"
      className="studio-card flex w-[320px] shrink-0 flex-col gap-5 p-6 transition-colors hover:border-primary/40 md:w-[380px]"
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} className="fill-[#ffc928] text-[#ffc928]" />
          ))}
        </div>
        <Quote size={22} className="text-primary/50" />
      </div>
      <blockquote className="text-sm leading-7 text-foreground/85">{review.text}</blockquote>
      <figcaption className="mt-auto flex items-center gap-3">
        <Image
          src={review.image}
          alt={review.name}
          width={44}
          height={44}
          className="size-11 rounded-full object-cover ring-2 ring-primary/30"
        />
        <div>
          <p className="text-sm font-semibold">{review.name}</p>
          <p className="text-xs text-muted-foreground">{review.course}</p>
        </div>
      </figcaption>
    </figure>
  );
}
