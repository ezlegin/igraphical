import { Button } from "@igraph/ui/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  GraduationCap,
  MessageCircle,
  MonitorSmartphone,
  Users,
} from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: BookOpen,
    title: "درآمد از فروش دوره",
    desc: "یک بار آموزش دهید و بارها از فروش دوره خود درآمد کسب کنید.",
  },
  {
    icon: BarChart3,
    title: "گزارش درآمد زنده",
    desc: "فروش و درآمد خود را به صورت لحظه‌ای مشاهده کنید.",
  },
  {
    icon: MessageCircle,
    title: "ارتباط با دانشجویان",
    desc: "به سوالات دانشجویان پاسخ دهید و با آن‌ها گفتگو کنید.",
  },
  {
    icon: MonitorSmartphone,
    title: "پنل اختصاصی مدرس",
    desc: "مدیریت دوره‌ها، جلسات، دانشجویان و درآمد در یک داشبورد حرفه‌ای.",
  },
  {
    icon: Users,
    title: "رشد برند شخصی",
    desc: "نام شما به عنوان مدرس در کنار دوره‌ها نمایش داده می‌شود.",
  },
  {
    icon: GraduationCap,
    title: "تمرکز بر آموزش",
    desc: "فروش، پرداخت و مدیریت کاربران را آی گرافیکال انجام می‌دهد.",
  },
];

export default function TeachPage() {
  return (
    <main>
      {/* Hero */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-24 text-center space-y-6">
          <div>
            {" "}
            <h1 className="text-4xl font-extrabold md:text-6xl">
              تدریس در آی گرافیکال
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600 leading-8">
              اگر در زمینه طراحی، گرافیک، موشن، فتوشاپ، فیگما، بلندر، تدوین، هوش
              مصنوعی یا هر مهارت مرتبط تخصص دارید، دانش خود را در آی گرافیکال
              منتشر کنید و از فروش دوره‌های آموزشی درآمد کسب کنید.
            </p>
          </div>

          <div>
            <Link href="https://t.me/iAssistant" target="_blank">
              <Button size={"lg"}>
                شروع همکاری
                <ArrowLeft size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">
          چرا تدریس در آی گرافیکال؟
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border p-5 shadow-sm transition hover:shadow-lg"
            >
              <item.icon className="mb-2 h-10 w-10 text-indigo-600" />

              <h3 className="text-xl font-bold">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl font-bold">پنل اختصاصی مدرس</h2>

            <p className="mt-5 text-gray-600 leading-8">
              بعد از همکاری، یک پنل اختصاصی در اختیار شما قرار می‌گیرد که
              می‌توانید همه چیز را مدیریت کنید.
            </p>

            <ul className="mt-8 space-y-4">
              <li>✅ مدیریت دوره‌ها</li>
              <li>✅ مشاهده درآمد لحظه‌ای</li>
              <li>✅ رهگیری فروش‌ها</li>
              <li>✅ مشاهده دانشجویان</li>
              <li>✅ پاسخ به سوالات دانشجویان</li>
              <li>✅ گفتگوی مستقیم با هنرجویان</li>
            </ul>
          </div>

          <div className="rounded-3xl border bg-white p-10 shadow-lg">
            <BarChart3 className="mx-auto h-24 w-24 text-indigo-600" />
            <h3 className="mt-6 text-center text-2xl font-bold">
              داشبورد مدرس
            </h3>
            <p className="mt-3 text-center text-gray-600">
              آمار فروش، درآمد، دانشجویان و پیام‌ها را به صورت زنده مشاهده کنید.
            </p>
          </div>
        </div>
      </section>

      {/* Revenue */}
      <section className="mx-auto max-w-5xl px-6 py-20 space-y-20">
        <div>
          <h2 className="mb-8 text-center text-3xl font-bold">شرایط همکاری</h2>

          <div className="overflow-x-auto rounded-2xl border">
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-semibold">حق تدریس مدرس</td>
                  <td className="p-4 ">
                    <span className="bg-slate-100 p-2 rounded-xl">
                      ۳۰٪ تا ۵۰٪ از فروش دوره
                    </span>
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="p-4 font-semibold">پنل مدیریت درآمد</td>
                  <td className="p-4">✅ دارد</td>
                </tr>

                <tr className="border-b">
                  <td className="p-4 font-semibold">گزارش فروش لحظه‌ای</td>
                  <td className="p-4">✅ دارد</td>
                </tr>

                <tr>
                  <td className="p-4 font-semibold">ارتباط با دانشجویان</td>
                  <td className="p-4">✅ از طریق چت داخلی</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-center text-gray-600">
            میزان دقیق سهم همکاری با توجه به کیفیت محتوا و شرایط همکاری تعیین
            می‌شود.
          </p>
        </div>

        <div>
          <h2 className="mb-8 text-center text-3xl font-bold">
            تولید و ضبط دوره آموزشی
          </h2>
          <p>
            تمامی دوره‌های آموزشی باید توسط مدرس و با امکانات شخصی ایشان تولید و
            ضبط شوند. مدرس مسئول آماده‌سازی کامل محتوای آموزشی، شامل ضبط
            ویدئوها، صدا، نورپردازی مناسب، تصویر باکیفیت و تدوین اولیه دوره است.
          </p>
          <p>
            پس از آماده‌سازی، فایل‌های نهایی دوره برای بررسی و انتشار در اختیار
            تیم آی گرافیکال قرار می‌گیرد. پس از تأیید کیفیت محتوا، دوره در
            وب‌سایت منتشر شده و در دسترس دانشجویان قرار خواهد گرفت.
          </p>
          <h3 className="mb-8 text-center text-xl font-bold">
            حداقل امکانات مورد نیاز برای ضبط دوره:
          </h3>
          <ul className="list-disc list-inside">
            <li>دوربین یا وب‌کم با کیفیت مناسب</li>
            <li>میکروفون با صدای شفاف</li>
            <li>نورپردازی مناسب</li>
            <li>محیطی آرام و بدون نویز</li>
            <li>فایل‌های ویدئویی آماده انتشار</li>
          </ul>
          <p>
            هدف ما ارائه آموزش‌هایی با کیفیت بالا و تجربه‌ای حرفه‌ای برای
            دانشجویان است؛ بنابراین کیفیت تولید محتوا یکی از معیارهای اصلی پذیرش
            و انتشار دوره‌ها خواهد بود.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 rounded-2xl py-20 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl font-bold">آماده شروع تدریس هستید؟</h2>

          <p className="mt-5 text-lg opacity-90">
            اگر در حوزه گرافیک و طراحی تخصص دارید، همین امروز برای همکاری با آی
            گرافیکال با ما در ارتباط باشید.
          </p>

          <Link
            href="https://t.me/iAssistant"
            target="_blank"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-indigo-700 hover:bg-gray-100"
          >
            <MessageCircle size={18} />
            ارتباط در تلگرام (@iAssistant)
          </Link>
        </div>
      </section>
    </main>
  );
}
