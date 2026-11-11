"use server";

import { SettlementFormType } from "@/lib/validationSchema";
import { database } from "@igraph/database";
import { requireAdmin } from "@/lib/require-admin";
import { computeSettlement } from "@/lib/settlement";

export const createSettlement = async (data: SettlementFormType) => {
  const { date } = data;
  const tutorId = +data.tutorId;
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  try {
    const existingTutor = await database.tutor.findFirst({
      where: { id: +tutorId },
    });
    if (!existingTutor) throw new Error("No Tutor Found");

    const calc = await computeSettlement(existingTutor, date.from, date.to);

    await database.settlement.create({
      data: {
        ...calc,
        from: date.from,
        to: date.to,
        status: "PENDING",
        tutorId,
        paidAt: null,
      },
    });

    return { success: "Settle Created Succesfully" };
  } catch (error) {
    return { error: String(error) };
  }
};

export const updateSettlement = async (
  data: SettlementFormType,
  settlementId: number,
) => {
  const { status } = data;
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  try {
    const existingSettlement = await database.settlement.findFirst({
      where: { id: settlementId },
      include: {
        tutor: true,
      },
    });

    if (!existingSettlement) throw new Error("No Settlement Found");

    await database.settlement.update({
      where: { id: settlementId },
      data: {
        status,
        paidAt: status === "PENDING" ? null : new Date(),
      },
    });

    //TODO: SEND SMS TO TUTOR

    return { success: "Status of Settlement Updated Successfully" };
  } catch (error) {
    return { error: String(error) };
  }
};

export const deleteSettlement = async (settlementId: number) => {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  try {
    const existingSettlement = await database.settlement.findFirst({
      where: { id: settlementId },
    });
    if (!existingSettlement) throw new Error("No Settlement Found");

    await database.settlement.delete({
      where: { id: settlementId },
    });

    return { success: "Settlement Deleted Successfully" };
  } catch (error) {
    return { error: String(error) };
  }
};
