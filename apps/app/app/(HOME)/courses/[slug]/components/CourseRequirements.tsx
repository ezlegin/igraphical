import { CircleDot } from "lucide-react";

const CoursePrerequisite = ({
  requirements,
}: {
  requirements: string[] | undefined;
}) => {
  if (!requirements?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold">پیش‌نیازها</h3>
      <ul className="flex flex-wrap gap-2">
        {requirements.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-2 rounded-full border border-foreground/10 px-4 py-2 text-sm text-muted-foreground"
          >
            <CircleDot size={14} className="text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoursePrerequisite;
