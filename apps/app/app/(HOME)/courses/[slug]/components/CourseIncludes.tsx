import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
interface Props {
  courseIncludes: {
    label: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
  }[];
}

const CourseIncludes = ({ courseIncludes }: Props) => {
  return (
    <>
      <h3 className="text-base font-bold">این دوره شامل:</h3>
      <ul className="space-y-3 text-sm text-muted-foreground">
        {courseIncludes.map((item, index) => (
          <li key={index} className="flex gap-3 items-center">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-primary">
              <item.icon size={15} />
            </span>
            {item.label}
          </li>
        ))}
      </ul>
    </>
  );
};

export default CourseIncludes;
