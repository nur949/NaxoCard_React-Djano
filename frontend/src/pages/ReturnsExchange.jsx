import { ArrowRight, BadgeCheck, Clock3, MapPin, PhoneCall, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";

const policyCards = [
  {
    icon: RefreshCcw,
    title: "7 day exchange window",
    text: "Report sizing or product issues within 7 days of delivery for faster review.",
  },
  {
    icon: ShieldCheck,
    title: "Condition check required",
    text: "Items must stay unused, clean, and in returnable condition with original packaging.",
  },
  {
    icon: Truck,
    title: "Courier support available",
    text: "Approved requests can be handled through delivery coordination depending on location.",
  },
  {
    icon: Clock3,
    title: "Quick response flow",
    text: "Support review starts after order details and proof are shared correctly.",
  },
];

const steps = [
  "Share your order number, phone number, and reason for return or exchange.",
  "Send clear photos if the issue involves damage, wrong item, or delivery condition.",
  "Wait for support confirmation before sending any item back.",
  "After approval, follow the return or exchange instructions from the NaxoCard team.",
];

const faq = [
  {
    title: "Which cases are usually eligible?",
    text: "Wrong item delivered, visible damage, major size issue, or confirmed order mismatch reported within the review window.",
  },
  {
    title: "Which cases are usually rejected?",
    text: "Used products, damaged items after delivery, missing packaging, or delayed complaints outside the support period.",
  },
  {
    title: "How long can review take?",
    text: "Basic cases can be reviewed quickly, while delivery disputes or condition-based checks may take longer depending on evidence and courier coordination.",
  },
];

export default function ReturnsExchange() {
  return (
    <section className="section py-12">
      <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-[linear-gradient(135deg,#0f172a_0%,#1e3a8a_58%,#dbeafe_100%)] px-6 py-10 text-white sm:px-8 lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/65">Support Policy</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
              Returns and exchange made clearer, faster, and easier to follow
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-blue-50/90">
              This page brings together the full NaxoCard return and exchange flow in one place so customers know what qualifies,
              what to prepare, and how to contact support without confusion.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {policyCards.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/14">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h2 className="text-base font-black">{title}</h2>
                      <p className="mt-2 text-sm leading-7 text-blue-50/85">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">Quick Overview</p>
            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Eligible examples</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Wrong product, damaged condition, visible manufacturing issue, or confirmed size-related exchange request within the allowed window.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Required details</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Order number, phone number, issue summary, and supporting photos if the problem needs visual verification.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Support channel</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">
                  Customer care: <strong>09666200300</strong><br />
                  Email: <strong>admin@gmail.com</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/70">How It Works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Return or exchange process</h2>
            <div className="mt-6 space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-black text-white">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-sm leading-7 text-slate-700">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-black text-slate-900">Important notes before requesting support</h3>
              <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-700">
                <li className="flex gap-3"><BadgeCheck size={18} className="mt-1 shrink-0 text-primary" /> Always check the product in front of the delivery person when possible.</li>
                <li className="flex gap-3"><BadgeCheck size={18} className="mt-1 shrink-0 text-primary" /> Keep the box, tags, and product condition unchanged until support review is complete.</li>
                <li className="flex gap-3"><BadgeCheck size={18} className="mt-1 shrink-0 text-primary" /> Do not send back any item without confirmation from NaxoCard support.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/70">FAQ</p>
              <div className="mt-5 space-y-4">
                {faq.map((item) => (
                  <article key={item.title} className="rounded-2xl border border-slate-200 p-4">
                    <h3 className="text-base font-black text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{item.text}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_50%,#f8fafc_100%)] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/70">Need Help Now?</p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Start with support or keep shopping</h3>
              <div className="mt-5 grid gap-3">
                <Button asChild className="h-11 rounded-full px-5 font-bold">
                  <Link to="/contact">
                    <PhoneCall size={16} /> Contact support
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-full px-5 font-bold">
                  <Link to="/products">
                    <ArrowRight size={16} /> Continue shopping
                  </Link>
                </Button>
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <MapPin size={16} className="text-primary" /> Dhaka, Bangladesh
                </div>
                <p className="mt-2">
                  For approved return or exchange coordination, courier and location handling may vary depending on delivery zone and product condition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
