import { getSessionUser } from "@/data/user";
import { getSubscriptionSummary, subscriptionsEnabled } from "@/lib/access";
import { database } from "@igraph/database";
import { formatJalaliDate } from "@igraph/utils";
import { Metadata } from "next";
import PlansCheckout from "./PlansCheckout";

export const metadata: Metadata = {
  title: "اشتراک آی‌گرافیکال",
  description: "با یک اشتراک به همه دوره‌های آی‌گرافیکال دسترسی داشته باشید.",
  alternates: { canonical: "/plans" },
};

export const dynamic = "force-dynamic";

const page = async () => {
  const [plans, user] = await Promise.all([
    database.plan.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { months: "asc" }],
    }),
    getSessionUser(),
  ]);
  const summary = user ? await getSubscriptionSummary(user.id) : null;

  return (
    <div className="mx-auto max-w-screen-lg space-y-8 px-4 py-10">
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-bold">یک اشتراک، دسترسی به همه دوره‌ها</h1>
        <p className="text-muted-foreground">
          مدت اشتراک را انتخاب کنید. در صورت نیاز، منتورشیپ (پرسش و پاسخ با
          مدرس) را هم فعال کنید.
        </p>
        {summary?.endsAt && (
          <p className="text-sm text-primary">
            اشتراک فعلی شما تا {formatJalaliDate(summary.endsAt)} اعتبار دارد.
            خرید جدید به انتهای آن اضافه می‌شود.
          </p>
        )}
      </div>

      {!subscriptionsEnabled() || plans.length === 0 ? (
        <p className="text-center text-muted-foreground">
          فروش اشتراک به زودی آغاز می‌شود.
        </p>
      ) : (
        <PlansCheckout
          plans={plans.map((p) => ({
            id: p.id,
            title: p.title,
            months: p.months,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            mentorshipPrice: p.mentorshipPrice,
          }))}
          isLoggedIn={!!user}
          walletBalance={user?.wallet?.balance ?? 0}
        />
      )}
    </div>
  );
};

export default page;
