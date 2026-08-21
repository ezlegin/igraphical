import { Button } from "@igraph/ui/components/ui/button";
import { igraphLogoLayDown, userTall } from "@/public";
import { BadgeCheck, PartyPopper, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const WhereToStartSeciton = () => {
  return (
    <div className="relative">
      <div className="bg-primary size-[400px] scale-x-[250%] opacity-90 rounded-full blur-3xl mx-auto -translate-y-10 absolute top-0 right-1/2 translate-x-1/2" />

      <div className="card bg-card p-0 w-full flex flex-wrap md:flex-nowrap justify-center md:gap-20 overflow-visible relative sm:px-10">
        <Image
          alt=""
          src={igraphLogoLayDown}
          width={100}
          height={100}
          className="absolute top-0 left-0 m-5"
        />
        <div>
          <Image
            alt=""
            src={userTall}
            width={270}
            height={270}
            className="md:-translate-y-24"
          />
        </div>
        <div className="space-y-10 px-10 md:px-0 mb-10">
          <h2 className="mt-10">از کجا شروع کنیم؟</h2>
          <ol className="relative text-gray-500 border-s border-input">
            <li className="mb-14 ms-6 mr-8">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -start-4 ring-4 ring-primary/30">
                <Search className="text-primary-foreground" size={18} />
              </span>
              <h3 className="font-medium text-primary-foreground">
                1. دوره مد نظرتو انتخاب کن!
              </h3>
              <p className="text-sm">
                دوره‌ای که بهش علاقه داری و مناسب نیازته رو از بین دوره‌های
                متنوع ما انتخاب کن و یادگیری رو شروع کن.
              </p>
            </li>
            <li className="mb-14 ms-6 mr-8">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -start-4 ring-4 ring-primary/30">
                <PartyPopper className="text-primary-foreground" size={18} />
              </span>
              <h3 className="font-medium text-primary-foreground">
                2. دوره تو تموم کن!
              </h3>
              <p className="text-sm">
                با تمرین‌های عملی و پروژه‌های کاربردی، مهارتت رو تقویت کن و دوره
                رو با موفقیت به پایان برسون..
              </p>
            </li>
            <li className="ms-6 mr-8">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -start-4 ring-4 ring-primary/30">
                <BadgeCheck className="text-primary-foreground" size={18} />
              </span>
              <h3 className="font-medium text-primary-foreground">
                3. مدرکشو از ما بگیر!
              </h3>
              <p className="text-sm">
                پس از اتمام دوره، مدرک آی‌گرافیکال رو دریافت کن و با اعتماد به
                نفس وارد بازار کار شو. 🚀
              </p>
            </li>
          </ol>
          <div className="flex gap-3">
            <a href="#courses">
              <Button>مشاهده دوره‌ها</Button>
            </a>
            <Link href={"/contact"}>
              <Button variant={"secondary"}>مشاوره رایگان</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhereToStartSeciton;
