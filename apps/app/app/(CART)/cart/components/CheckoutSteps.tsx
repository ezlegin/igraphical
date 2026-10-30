import { Check } from "lucide-react";

const steps = ["سبد خرید", "پرداخت", "شروع یادگیری"];

export default function CheckoutSteps({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 text-xs">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                active
                  ? "border-primary bg-primary/15 text-foreground"
                  : done
                    ? "border-lime/40 text-lime"
                    : "border-foreground/10 text-muted-foreground"
              }`}
            >
              <span
                className={`en-digits flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  active ? "bg-primary text-primary-foreground" : done ? "bg-lime text-black" : "bg-foreground/10"
                }`}
              >
                {done ? <Check size={11} strokeWidth={3} /> : i + 1}
              </span>
              {step}
            </span>
            {i < steps.length - 1 && <span className="h-px w-4 bg-foreground/15 md:w-8" />}
          </li>
        );
      })}
    </ol>
  );
}
