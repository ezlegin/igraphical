import { requireAdmin } from "@/lib/require-admin";
import { database, Prisma } from "@igraph/database";
import Filter from "@igraph/ui/components/Filter";
import Pagination from "@igraph/ui/components/Pagination";
import Search from "@igraph/ui/components/Search";
import Table from "@igraph/ui/components/Table";
import { Badge } from "@igraph/ui/components/ui/badge";
import { TableCell, TableRow } from "@igraph/ui/components/ui/table";
import { formatMiladiDate, formatPrice, pagination } from "@igraph/utils";
import { redirect } from "next/navigation";
import {
  GrantSubscriptionForm,
  SubscriptionActions,
} from "./SubscriptionActions";

interface Props {
  searchParams: Promise<{ page?: string; search?: string; state?: string }>;
}

export const dynamic = "force-dynamic";

const page = async ({ searchParams }: Props) => {
  if (!(await requireAdmin())) redirect("/");
  const { page, search, state } = await searchParams;
  const now = new Date();

  const where: Prisma.SubscriptionWhereInput = {
    status:
      state === "pending"
        ? "PENDING"
        : state === "canceled"
          ? "CANCELED"
          : { not: "PENDING" },
    endsAt:
      state === "active"
        ? { gt: now }
        : state === "expired"
          ? { lte: now }
          : undefined,
    user: search
      ? {
          OR: [
            { phone: { contains: search } },
            { email: { contains: search } },
            { fullName: { contains: search } },
          ],
        }
      : undefined,
  };

  const { skip, take } = pagination(page ?? "1");
  const [subs, total, activeCount, revenue] = await Promise.all([
    database.subscription.findMany({
      where,
      include: { user: true, payment: true },
      orderBy: { id: "desc" },
      skip,
      take,
    }),
    database.subscription.count({ where }),
    database.subscription.groupBy({
      by: ["userId"],
      where: { status: "ACTIVE", startsAt: { lte: now }, endsAt: { gt: now } },
    }),
    database.payment.aggregate({
      where: { status: "SUCCESS", subscription: { isNot: null } },
      _sum: { total: true },
    }),
  ]);

  type Row = (typeof subs)[number];

  // Distinct lessons opened in the last 24h, to spot bulk downloading.
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const views = await database.lessonView.groupBy({
    by: ["userId", "lessonId"],
    where: {
      userId: { in: subs.map((s) => s.userId) },
      createdAt: { gte: since },
    },
  });
  const opened = new Map<number, number>();
  for (const v of views) opened.set(v.userId, (opened.get(v.userId) ?? 0) + 1);

  const renderRows = (s: Row) => {
    const running =
      s.status === "ACTIVE" && s.startsAt <= now && s.endsAt > now;
    const queued = s.status === "ACTIVE" && s.startsAt > now;
    return (
      <TableRow key={s.id} className="odd:bg-slate-50">
        <TableCell>
          <div className="font-medium">{s.user.fullName}</div>
          <div className="text-xs text-muted-foreground">{s.user.phone}</div>
        </TableCell>
        <TableCell className="text-center">
          {(() => {
            const n = opened.get(s.userId) ?? 0;
            return (
              <Badge variant={n >= 30 ? "red" : n >= 15 ? "orange" : "gray"}>
                {n}
              </Badge>
            );
          })()}
        </TableCell>
        <TableCell className="text-center">
          {s.months === 0 ? "Mentorship only" : `${s.months} mo`}
        </TableCell>
        <TableCell className="text-center">
          <Badge
            variant={
              running
                ? "green"
                : queued
                  ? "blue"
                  : s.status === "CANCELED"
                    ? "red"
                    : "gray"
            }
          >
            {running
              ? "Active"
              : queued
                ? "Queued"
                : s.status === "ACTIVE"
                  ? "Expired"
                  : s.status}
          </Badge>
        </TableCell>
        <TableCell className="text-center hidden lg:table-cell">
          {formatMiladiDate(s.startsAt)} → {formatMiladiDate(s.endsAt)}
        </TableCell>
        <TableCell className="text-center hidden lg:table-cell">
          {s.mentorship && s.mentorshipEndsAt
            ? `until ${formatMiladiDate(s.mentorshipEndsAt)}`
            : "—"}
        </TableCell>
        <TableCell className="text-center hidden xl:table-cell">
          {s.source === "ADMIN"
            ? "Admin grant"
            : formatPrice(s.payment?.total ?? 0)}
        </TableCell>
        <TableCell className="text-right">
          {s.status === "ACTIVE" && s.endsAt > now && (
            <SubscriptionActions id={s.id} />
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card">
          <div className="text-xs text-muted-foreground">
            Active subscribers
          </div>
          <div className="text-2xl font-bold">{activeCount.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-muted-foreground">
            Subscription revenue (all time)
          </div>
          <div className="text-2xl font-bold">
            {formatPrice(revenue._sum.total ?? 0)}
          </div>
        </div>
        <div className="card">
          <GrantSubscriptionForm />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
        <h3>{total} Subscriptions</h3>
        <div className="flex flex-wrap gap-3">
          <Search placeholder="Phone, email or name..." />
          <Filter
            placeholder="All"
            name="state"
            options={[
              { label: "Active / queued", value: "active" },
              { label: "Expired", value: "expired" },
              { label: "Canceled", value: "canceled" },
              { label: "Pending payment", value: "pending" },
            ]}
          />
        </div>
      </div>

      <div className="card">
        <Table columns={columns} data={subs} renderRows={renderRows} />
        <Pagination pageSize={15} totalItems={total} />
      </div>
    </div>
  );
};

const columns = [
  { label: "Student", className: "" },
  { label: "Lessons 24h", className: "text-center" },
  { label: "Plan", className: "text-center" },
  { label: "Status", className: "text-center" },
  { label: "Period", className: "text-center hidden lg:table-cell" },
  { label: "Mentorship", className: "text-center hidden lg:table-cell" },
  { label: "Paid", className: "text-center hidden xl:table-cell" },
  { label: "Actions", className: "text-right" },
];

export default page;
