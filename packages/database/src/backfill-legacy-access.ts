/**
 * One-time backfill: gives pre-subscription buyers 12 months of access and
 * 12 months of mentorship on the courses they already paid for, counted from
 * the subscription launch date.
 *
 * Only ADDS data (isLegacy / accessEndsAt / mentorshipEndsAt on enrollment).
 * Never deletes or changes prices, payments, progress or certificates.
 * Idempotent: enrollments already marked isLegacy are skipped.
 *
 * Usage (dry run by default):
 *   npx tsx src/backfill-legacy-access.ts --launch=2026-12-01
 *   npx tsx src/backfill-legacy-access.ts --launch=2026-12-01 --apply
 */
import { database } from "./client";

const LEGACY_MONTHS = 12;

function parseArgs() {
  const launchArg = process.argv.find((a) => a.startsWith("--launch="));
  if (!launchArg) throw new Error("Missing --launch=YYYY-MM-DD");
  const launch = new Date(`${launchArg.split("=")[1]}T00:00:00+03:30`);
  if (Number.isNaN(launch.getTime())) throw new Error("Invalid --launch date");
  return { launch, apply: process.argv.includes("--apply") };
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

async function main() {
  const { launch, apply } = parseArgs();
  const endsAt = addMonths(launch, LEGACY_MONTHS);

  // Paid course + successful payment. Free courses stay free for everyone.
  const where = {
    isLegacy: false,
    courseOriginalPrice: { gt: 0 },
    payment: { status: "SUCCESS" as const },
  };

  const [total, eligible, users] = await Promise.all([
    database.enrollment.count(),
    database.enrollment.count({ where }),
    database.enrollment.groupBy({ by: ["userId"], where }),
  ]);
  const alreadyLegacy = await database.enrollment.count({
    where: { isLegacy: true },
  });

  console.log(`Launch:            ${launch.toISOString()}`);
  console.log(`Access/mentorship: until ${endsAt.toISOString()}`);
  console.log(`Enrollments total: ${total}`);
  console.log(`Already legacy:    ${alreadyLegacy}`);
  console.log(`To mark legacy:    ${eligible} (${users.length} users)`);

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to write.");
    return;
  }

  const result = await database.enrollment.updateMany({
    where,
    data: { isLegacy: true, accessEndsAt: endsAt, mentorshipEndsAt: endsAt },
  });
  console.log(`\nUpdated ${result.count} enrollments.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => database.$disconnect());
