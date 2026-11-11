"use client";

import { updatePlan } from "@/actions/plan";
import Loader from "@igraph/ui/components/Loader";
import { Badge } from "@igraph/ui/components/ui/badge";
import { Button } from "@igraph/ui/components/ui/button";
import { Input } from "@igraph/ui/components/ui/input";
import { Label } from "@igraph/ui/components/ui/label";
import { Switch } from "@igraph/ui/components/ui/switch";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

type PlanValues = {
  id: number;
  months: number;
  title: string;
  price: number;
  compareAtPrice: number | null;
  mentorshipPrice: number;
  isActive: boolean;
  sortOrder: number;
};

const PlanForm = ({
  plan,
  activeSubscriptions,
}: {
  plan: PlanValues;
  activeSubscriptions: number;
}) => {
  const router = useRouter();
  const [values, setValues] = useState(plan);
  const [pending, start] = useTransition();

  const set = <K extends keyof PlanValues>(key: K, value: PlanValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const num = (s: string) => (s === "" ? 0 : Number(s.replace(/,/g, "")));

  const onSave = () =>
    start(async () => {
      const res = await updatePlan(plan.id, {
        title: values.title,
        price: values.price,
        compareAtPrice: values.compareAtPrice || null,
        mentorshipPrice: values.mentorshipPrice,
        isActive: values.isActive,
        sortOrder: values.sortOrder,
      });
      if (res.error) return void toast.error(res.error);
      toast.success(res.success);
      router.refresh();
    });

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{plan.months} months</h4>
          <Badge variant={values.isActive ? "green" : "gray"}>
            {values.isActive ? "Active" : "Hidden"}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {activeSubscriptions} active subscribers
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title (shown on site)">
          <Input
            dir="rtl"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>
        <Field label="Sort order">
          <Input
            type="number"
            value={values.sortOrder}
            onChange={(e) => set("sortOrder", num(e.target.value))}
          />
        </Field>
        <Field label="Price (Toman)">
          <Input
            inputMode="numeric"
            value={values.price}
            onChange={(e) => set("price", num(e.target.value))}
          />
        </Field>
        <Field label="Compare-at price (optional)">
          <Input
            inputMode="numeric"
            value={values.compareAtPrice ?? ""}
            onChange={(e) =>
              set(
                "compareAtPrice",
                e.target.value === "" ? null : num(e.target.value),
              )
            }
          />
        </Field>
        <Field label="Mentorship price (Toman)">
          <Input
            inputMode="numeric"
            value={values.mentorshipPrice}
            onChange={(e) => set("mentorshipPrice", num(e.target.value))}
          />
        </Field>
        <Field label="Visible on site">
          <div className="flex h-10 items-center">
            <Switch
              checked={values.isActive}
              onCheckedChange={(c) => set("isActive", c)}
            />
          </div>
        </Field>
      </div>

      <Button disabled={pending} onClick={onSave} className="w-full">
        <Loader loading={pending} />
        Save
      </Button>
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    {children}
  </div>
);

export default PlanForm;
