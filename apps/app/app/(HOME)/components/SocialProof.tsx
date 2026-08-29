"use client";

import { GraduationCap, Send, Star, Users } from "lucide-react";

const stats = [
  {
    title: "کاربران فعال",
    subtitle: "ماهانه",
    value: "6K",
    suffix: "+",
    label: "کاربر ماهانه",
    icon: Users,
    color: "text-primary",
    iconBg: "bg-primary/15",
    iconBorder: "border-primary/30",
  },
  {
    title: "میانگین امتیاز",
    subtitle: "دانش آموزان",
    value: "4.9",
    suffix: "/5",
    label: "",
    icon: GraduationCap,
    color: "text-yellow-500",
    iconBg: "bg-yellow-500/15",
    iconBorder: "border-yellow-500/30",
    stars: true,
  },
  {
    title: "کاربران فعال",
    subtitle: "ماهانه",
    value: "6K",
    suffix: "+",
    label: "دانش آموز",
    icon: GraduationCap,
    color: "text-green-500",
    iconBg: "bg-green-500/15",
    iconBorder: "border-green-500/30",
    stars: false,
  },
  {
    title: "سوشال مدیا",
    subtitle: "تعداد کاربران",
    value: "+100K",
    suffix: "",
    label: "کاربر و همراه",
    icon: Send,
    color: "text-blue-500",
    iconBg: "bg-blue-500/10",
    iconBorder: "border-blue-500/30",
    stars: false,
  },
  {
    title: "فارغ التحصیلان",
    subtitle: "از سال 1401",
    value: "+3K",
    suffix: "",
    label: "فارغ التحصیل",
    icon: Send,
    color: "text-orange-500",
    iconBg: "bg-orange-500/10",
    iconBorder: "border-orange-500/30",
    stars: false,
  },
];

export default function SocialProof() {
  return (
    <section className="w-full px-6">
      <div className="mx-auto grid max-w-[1150px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 ">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;

          return (
            <div
              key={idx}
              className={`
                group relative flex min-h-[300px] flex-col items-center
                overflow-hidden rounded-xl
                border
                bg-[radial-gradient(circle_at_50%_0%,rgba(120,90,180,0.08),transparent_48%),linear-gradient(180deg,#16141d_0%,#0c0b11_100%)]
                px-5 py-7
                transition-all duration-300
                hover:-translate-y-0.5
              `}
            >
              {/* Subtle top highlight */}
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Icon */}
              <div
                className={`
                  flex h-12 w-12 items-center justify-center
                  rounded-xl border
                  ${stat.iconBg}
                  ${stat.iconBorder}
                  ${stat.color}
                `}
              >
                <Icon
                  size={21}
                  strokeWidth={2}
                  fill={stat.title === "YouTube" ? "currentColor" : "none"}
                />
              </div>

              {/* Title */}
              <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.02em] text-white">
                {stat.title}
              </h3>

              {/* Subtitle */}
              <p className="mt-1 text-[12px] font-medium text-white/40">
                {stat.subtitle}
              </p>

              {/* Divider */}
              <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              {/* Main number */}
              <div className="flex items-baseline justify-center en-digits">
                <span className="text-4xl font-semibold leading-none tracking-[-0.055em] text-white">
                  {stat.value}
                </span>

                <span
                  className={`ml-1 text-[17px] font-semibold ${stat.color} opacity-70`}
                >
                  {stat.suffix}
                </span>
              </div>

              {/* Bottom content */}
              {stat.stars ? (
                <div className="mt-4 flex items-center gap-[3px]">
                  {[1, 2, 3, 4, 5].map((_, idx) => (
                    <Star
                      key={idx}
                      size={17}
                      strokeWidth={1.5}
                      fill="currentColor"
                      className={"text-[#ffc928]"}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-[11px] font-bold tracking-[0.08em] text-white/35">
                  {stat.label}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
