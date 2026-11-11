import DetailSection from "./DetailSection";

const CourseLearnsInCourse = ({
  learnsInCourse,
}: {
  learnsInCourse: string[];
}) => {
  if (!learnsInCourse.length) return null;

  return (
    <DetailSection
      id="learn"
      index="01"
      eyebrow="خروجی دوره"
      title={
        <>
          بعد از این دوره <span className="text-gradient">می‌تونی…</span>
        </>
      }
    >
      <ol className="grid gap-x-10 sm:grid-cols-2">
        {learnsInCourse.map((item, index) => (
          <li
            key={index}
            className="flex items-baseline gap-4 border-t border-foreground/10 py-5 text-sm leading-7 md:text-[15px]"
          >
            <span className="en-digits w-8 shrink-0 text-lg font-black text-primary/80">
              {String(index + 1).padStart(2, "0")}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </DetailSection>
  );
};

export default CourseLearnsInCourse;
