import { database, Tutor } from "@igraph/database";

/**
 * The tutor who receives subscription revenue (there is a single tutor now).
 * SUBSCRIPTION_TUTOR_ID overrides; otherwise the oldest tutor account.
 */
const subscriptionTutorId = async () => {
  const fromEnv = Number(process.env.SUBSCRIPTION_TUTOR_ID);
  if (Number.isInteger(fromEnv) && fromEnv > 0) return fromEnv;
  const first = await database.tutor.findFirst({
    orderBy: { id: "asc" },
    select: { id: true },
  });
  return first?.id ?? null;
};

/**
 * Sales for one tutor in [from, to]:
 * - legacy single-course sales (enrollment.price, as before), plus
 * - for the subscription tutor, every successful subscription payment.
 */
export const computeSettlement = async (tutor: Tutor, from: Date, to: Date) => {
  const range = { gte: from, lte: to };

  const [courseSales, courseCount, isSubTutor] = await Promise.all([
    database.enrollment.aggregate({
      where: {
        course: { tutorId: tutor.id },
        enrolledAt: range,
        price: { gt: 0 },
      },
      _sum: { price: true },
    }),
    database.enrollment.count({
      where: {
        course: { tutorId: tutor.id },
        enrolledAt: range,
        price: { gt: 0 },
      },
    }),
    subscriptionTutorId().then((id) => id === tutor.id),
  ]);

  let subscriptionSales = 0;
  let subscriptionCount = 0;
  if (isSubTutor) {
    const subs = await database.payment.aggregate({
      where: {
        status: "SUCCESS",
        paidAt: range,
        subscription: { isNot: null },
      },
      _sum: { total: true },
      _count: true,
    });
    subscriptionSales = subs._sum.total ?? 0;
    subscriptionCount = subs._count;
  }

  const totalSell = (courseSales._sum.price ?? 0) + subscriptionSales;
  return {
    totalSell,
    totalEnrollments: courseCount + subscriptionCount,
    amount: totalSell * (tutor.profit / 100),
    profit: tutor.profit,
  };
};
