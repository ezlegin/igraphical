import { computeSettlement } from "@/lib/settlement";
import { database } from "@igraph/database";
import { sendPaidSettlmentSms } from "@igraph/utils";
import { endOfMonth, startOfMonth, subDays } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cronKey = req.headers.get("x-cron-key");
  if (cronKey !== process.env.CRON_SECRET_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const allTutors = await database.tutor.findMany();

    let createdCount = 0;
    const startOfThisMonth = startOfMonth(subDays(new Date(), 1));
    const endOfThisMonth = endOfMonth(subDays(new Date(), 1));

    for (const tutor of allTutors) {
      const calc = await computeSettlement(
        tutor,
        startOfThisMonth,
        endOfThisMonth,
      );
      const { amount } = calc;

      await database.settlement.create({
        data: {
          ...calc,
          from: startOfThisMonth,
          to: endOfThisMonth,
          status: "PENDING",
          tutorId: tutor.id,
          paidAt: null,
        },
      });

      createdCount++;

      await sendPaidSettlmentSms(tutor.displayName, tutor.phone, amount);
    }

    return NextResponse.json({
      message: "Settlements created successfully.",
      createdCount,
    });
  } catch (error) {
    console.error("[SETTLEMENT_CREATION_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
