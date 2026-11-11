import type { Metadata } from "next";
import { database } from "@igraph/database";
import { redirect } from "next/navigation";
import Certificate from "./components/home/Certificate";
import CoursesShowcase from "./components/home/CoursesShowcase";
import Hero from "./components/home/Hero";
import Impact from "./components/home/Impact";
import Journal from "./components/home/Journal";
import LearningPath from "./components/home/LearningPath";
import Pricing from "./components/home/Pricing";
import Promo from "./components/home/Promo";
import Testimonials from "./components/home/Testimonials";
import ToolMarquee from "./components/home/ToolMarquee";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

interface Props {
  searchParams: Promise<{ p: string }>;
}

const page = async ({ searchParams }: Props) => {
  const { p } = await searchParams;

  if (p) {
    const course = await database.course.findFirst({
      where: { id: +p },
    });

    if (course) {
      redirect(`/courses/${encodeURIComponent(course.url)}`);
    }

    const post = await database.post.findFirst({
      where: { id: +p },
    });

    if (post) {
      redirect(`/${encodeURIComponent(post.url)}`);
    }
  }

  return (
    <div className="space-y-28 pb-24 md:space-y-40">
      <div className="space-y-12 md:space-y-16">
        <Hero />
        <ToolMarquee />
      </div>
      <Promo />
      <CoursesShowcase />
      <Pricing />
      <LearningPath />
      <Impact />
      <Testimonials />
      <Certificate />
      <Journal />
    </div>
  );
};

export default page;
