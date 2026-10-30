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
    { title: "مخاطبین دوره", text: courseContentItems.audience, icon: Users, tone: "#60a5fa" },
    { title: "ملزومات دوره", text: courseContentItems.needs, icon: Laptop, tone: "#d4ff3f" },
    { title: "بازار کار", text: courseContentItems.bazaar, icon: Briefcase, tone: "#f472b6" },
  ].filter((i) => i.text);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="studio-card space-y-3 p-5">
          <span
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: `${item.tone}1f`, color: item.tone }}
          >
            <item.icon size={18} />
          </span>
          <h3 className="font-bold">{item.title}</h3>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">{item.text}</p>
        </div>
      ))}
    </div>
  );
};

export default CourseAudienceItems;
