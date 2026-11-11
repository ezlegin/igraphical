import { requireAdmin } from "@/lib/require-admin";
import { database } from "@igraph/database";
import { redirect } from "next/navigation";
import PlanForm from "./PlanForm";

export const dynamic = "force-dynamic";

const page = async () => {
  if (!(await requireAdmin())) redirect("/");

  const plans = await database.plan.findMany({
    orderBy: [{ sortOrder: "asc" }, { months: "asc" }],
    include: {
      _count: { select: { subscription: { where: { status: "ACTIVE" } } } },
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <h3>Subscription Plans</h3>
        <p className="text-sm text-muted-foreground">
          Prices are in Toman. Mentorship price is added when the student turns
          mentorship on, and lasts as long as the plan. To run a discount, set a
          compare-at price above the price; it shows crossed out on the site.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <PlanForm
            key={plan.id}
            plan={{
              id: plan.id,
              months: plan.months,
              title: plan.title,
              price: plan.price,
              compareAtPrice: plan.compareAtPrice,
              mentorshipPrice: plan.mentorshipPrice,
              isActive: plan.isActive,
              sortOrder: plan.sortOrder,
            }}
            activeSubscriptions={plan._count.subscription}
          />
        ))}
      </div>
    </div>
  );
};

export default page;
