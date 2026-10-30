import { Check } from "lucide-react";
import DetailSection from "./DetailSection";

const CourseLearnsInCourse = ({ learnsInCourse }: { learnsInCourse: string[] }) => {
  if (!learnsInCourse.length) return null;

  return (
    <DetailSection id="learn" title="در این دوره یاد می‌گیری">
      <ul className="grid gap-3 sm:grid-cols-2">
        {learnsInCourse.map((item, index) => (
          <li
            key={index}
            className="flex items-start gap-3 rounded-2xl border border-foreground/10 bg-card/50 p-4 text-sm leading-7"
          >
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-lime text-black">
              <Check size={14} strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </DetailSection>
  );
};

export default CourseLearnsInCourse;
