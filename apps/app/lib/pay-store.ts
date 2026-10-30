import type {
  PaymentPatch,
  PaymentRecord,
  PaymentStatus,
  PaymentStore,
} from "@obhco/pay";
import { database, GatewayPayment, Prisma } from "@igraph/database";

// keeps bank order numbers clear of the old Payment.id numbers sent to Sadad
const ORDER_NUMBER_OFFSET = 50_000_000;

const json = (v: unknown) =>
  v === null || v === undefined ? Prisma.DbNull : (v as Prisma.InputJsonValue);

const toRecord = (row: GatewayPayment): PaymentRecord => ({
  ...row,
  currency: "IRR",
  status: row.status as PaymentStatus,
  environment: row.environment as PaymentRecord["environment"],
  reportedStatus: row.reportedStatus as PaymentStatus | null,
  metadata: (row.metadata ?? {}) as PaymentRecord["metadata"],
  installment: row.installment as PaymentRecord["installment"],
  redirect: row.redirect as PaymentRecord["redirect"],
  callbackPayload: row.callbackPayload as PaymentRecord["callbackPayload"],
});

const toData = (patch: PaymentPatch) => {
  const { currency: _currency, metadata, installment, redirect, callbackPayload, ...rest } =
    patch;
  return {
    ...rest,
    ...(metadata !== undefined && { metadata: metadata as Prisma.InputJsonValue }),
    ...(installment !== undefined && { installment: json(installment) }),
    ...(redirect !== undefined && { redirect: json(redirect) }),
    ...(callbackPayload !== undefined && { callbackPayload: json(callbackPayload) }),
  };
};

export const prismaPaymentStore: PaymentStore = {
  async nextGatewayOrderId(gateway) {
    const row = await database.gatewayOrderNumber.create({ data: { gateway } });
    return String(ORDER_NUMBER_OFFSET + row.id);
  },

  async insert(record) {
    const row = await database.gatewayPayment.create({
      data: { ...toData(record), reference: record.reference } as Prisma.GatewayPaymentCreateInput,
    });
    return toRecord(row);
  },

  async findByReference(reference) {
    const row = await database.gatewayPayment.findUnique({ where: { reference } });
    return row && toRecord(row);
  },

  async listByOrderId(orderId) {
    const rows = await database.gatewayPayment.findMany({
      where: { orderId },
      orderBy: { attempt: "asc" },
    });
    return rows.map(toRecord);
  },

  async findByGatewayOrderId(gateway, gatewayOrderId) {
    const row = await database.gatewayPayment.findUnique({
      where: { gateway_gatewayOrderId: { gateway, gatewayOrderId } },
    });
    return row && toRecord(row);
  },

  async findBySessionId(gateway, sessionId) {
    const row = await database.gatewayPayment.findFirst({
      where: { gateway, providerSessionId: sessionId },
    });
    return row && toRecord(row);
  },

  async update(reference, patch) {
    const row = await database.gatewayPayment.update({
      where: { reference },
      data: toData(patch),
    });
    return toRecord(row);
  },

  // compare-and-set: only one request can move a payment out of `from`
  async transition(reference, from, patch) {
    const { count } = await database.gatewayPayment.updateMany({
      where: { reference, status: from },
      data: toData(patch),
    });
    if (count !== 1) return null;
    const row = await database.gatewayPayment.findUnique({ where: { reference } });
    return row && toRecord(row);
  },

  async listPending(before, limit) {
    const rows = await database.gatewayPayment.findMany({
      where: { status: "pending", createdAt: { lt: before } },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
    return rows.map(toRecord);
  },

  async listUnreported(limit) {
    const refs = await database.$queryRaw<{ reference: string }[]>`
      SELECT reference FROM gateway_payment
      WHERE reportedStatus IS NULL OR reportedStatus <> status
      ORDER BY createdAt ASC LIMIT ${limit}`;
    if (refs.length === 0) return [];
    const rows = await database.gatewayPayment.findMany({
      where: { reference: { in: refs.map((r) => r.reference) } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toRecord);
  },
};
