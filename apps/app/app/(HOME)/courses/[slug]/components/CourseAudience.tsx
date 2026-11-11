import { Briefcase, Laptop, Users } from "lucide-react";

interface Props {
  courseContentItems: {
    audience: string;
    needs: string;
    bazaar: string;
  };
}

const CourseAudienceItems = ({ courseContentItems }: Props) => {
  const items = [
    { title: "برای چه کسانیه", text: courseContentItems.audience, icon: Users },
    { title: "چی لازم داری", text: courseContentItems.needs, icon: Laptop },
    { title: "بازار کار", text: courseContentItems.bazaar, icon: Briefcase },
  ].filter((i) => i.text);

  return (
    <div className="grid gap-8 md:grid-cols-3 md:gap-10">
      {items.map((item) => (
        <div
          key={item.title}
          className="space-y-3 border-t border-foreground/10 pt-5"
        >
          <h3 className="flex items-center gap-2 font-bold">
            <item.icon size={17} className="text-primary" />
            {item.title}
          </h3>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CourseAudienceItems;
