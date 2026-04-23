import { Check } from "lucide-react";

export default function CheckoutSteps({ active = 1 }) {
  const steps = ["Cart", "Shipping", "Payment"];
  return (
    <div className="mb-6 grid grid-cols-3 overflow-hidden rounded-lg border bg-card">
      {steps.map((step, index) => {
        const number = index + 1;
        const complete = number < active;
        const current = number === active;
        return (
          <div key={step} className={`flex items-center justify-center gap-2 px-3 py-3 text-sm font-bold ${current ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${complete ? "bg-primary text-primary-foreground" : ""}`}>
              {complete ? <Check size={14} /> : number}
            </span>
            <span className="hidden sm:inline">{step}</span>
          </div>
        );
      })}
    </div>
  );
}
