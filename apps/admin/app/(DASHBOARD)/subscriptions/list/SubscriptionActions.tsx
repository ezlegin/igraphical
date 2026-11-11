"use client";

import {
  cancelSubscription,
  extendSubscription,
  grantSubscription,
} from "@/actions/subscription";
import { Button } from "@igraph/ui/components/ui/button";
import { Input } from "@igraph/ui/components/ui/input";
import { Switch } from "@igraph/ui/components/ui/switch";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const useAction = () => {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ error?: string; success?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.error) return void toast.error(res.error);
      toast.success(res.success);
      router.refresh();
    });
  return { pending, run };
};

export const SubscriptionActions = ({ id }: { id: number }) => {
  const { pending, run } = useAction();
  const [months, setMonths] = useState(1);

  return (
    <div className="flex items-center justify-end gap-2">
      <Input
        type="number"
        min={1}
        max={36}
        value={months}
        onChange={(e) => setMonths(Number(e.target.value))}
        className="h-8 w-16"
      />
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => run(() => extendSubscription(id, months))}
      >
        Extend
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (confirm("Cancel this subscription? The student loses access."))
            run(() => cancelSubscription(id));
        }}
      >
        Cancel
      </Button>
    </div>
  );
};

export const GrantSubscriptionForm = () => {
  const { pending, run } = useAction();
  const [identifier, setIdentifier] = useState("");
  const [months, setMonths] = useState(1);
  const [mentorship, setMentorship] = useState(false);

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Grant free time</div>
      <Input
        placeholder="Phone or email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="h-8"
      />
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          max={36}
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="h-8 w-16"
        />
        <span className="text-xs">months</span>
        <label className="flex items-center gap-1 text-xs">
          <Switch checked={mentorship} onCheckedChange={setMentorship} />
          Mentorship
        </label>
        <Button
          size="sm"
          className="ml-auto"
          disabled={pending || !identifier.trim()}
          onClick={() =>
            run(() => grantSubscription(identifier, months, mentorship))
          }
        >
          Grant
        </Button>
      </div>
    </div>
  );
};
