import { CircleDot } from "lucide-react";
import DetailSection from "./DetailSection";

const CoursePrerequisite = ({ requirements }: { requirements: string[] | undefined }) => {
  if (!requirements?.length) return null;

  return (
    <DetailSection title="پیش‌نیازها">
      <ul className="flex flex-wrap gap-2">
        {requirements.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-2 rounded-full border border-foreground/10 bg-card/50 px-4 py-2 text-sm text-muted-foreground"
          >
            <CircleDot size={14} className="text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </DetailSection>
  );
};

export default CoursePrerequisite;
