import { database } from "@igraph/database";
import { redirect } from "next/navigation";
import "./components/home/home.css";
import Categories from "./components/home/Categories";
import Certificate from "./components/home/Certificate";
import CoursesShowcase from "./components/home/CoursesShowcase";
import FinalCta from "./components/home/FinalCta";
import Hero from "./components/home/Hero";
import Impact from "./components/home/Impact";
import Journal from "./components/home/Journal";
import LearningPath from "./components/home/LearningPath";
import Promo from "./components/home/Promo";
import Testimonials from "./components/home/Testimonials";
import ToolMarquee from "./components/home/ToolMarquee";

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
    <div className="space-y-24 pb-20 pt-8 md:space-y-40 md:pt-16 lg:pt-20">
      <div className="space-y-12 md:space-y-16">
        <Hero />
        <ToolMarquee />
      </div>
      <Promo />
      <Categories />
      <CoursesShowcase />
      <LearningPath />
      <Impact />
      <Testimonials />
      <Certificate />
      <Journal />
      <FinalCta />
    </div>
  );
};

export default page;
