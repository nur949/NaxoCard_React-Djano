import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const heroProducts = [
  {
    id: "red",
    title: "Are you ready to lead the way",
    subtitle: [
      "Mauris porta lectus nulla, non dignissim dolor",
      "sollicitudin et. Sed mi tortor, aliquam eget",
      "congue a, faucibus sed est.",
    ],
    name: "Aero Sprint",
    caption: "Mauris porta",
    image: "/hero/sneaker-blue.svg",
    accent: "from-[#ff5f6d] to-[#ffc371]",
  },
  {
    id: "orange",
    title: "Move faster with next-gen comfort",
    subtitle: [
      "Mauris porta lectus nulla, non dignissim dolor",
      "sollicitudin et. Sed mi tortor, aliquam eget",
      "congue a, faucibus sed est.",
    ],
    name: "Volt Runner",
    caption: "Mauris porta",
    image: "/hero/sneaker-black.svg",
    accent: "from-[#ff9966] to-[#ff5e62]",
  },
  {
    id: "white",
    title: "Step clean. Run bold. Stay ahead",
    subtitle: [
      "Mauris porta lectus nulla, non dignissim dolor",
      "sollicitudin et. Sed mi tortor, aliquam eget",
      "congue a, faucibus sed est.",
    ],
    name: "Street Dash",
    caption: "Mauris porta",
    image: "/hero/sneaker-white.svg",
    accent: "from-[#e0eafc] to-[#cfdef3]",
  },
];

export default function HeroSection() {
  const [activeId, setActiveId] = useState(heroProducts[1].id);
  const activeProduct = useMemo(
    () => heroProducts.find((item) => item.id === activeId) || heroProducts[1],
    [activeId]
  );

  return (
    <section className="relative isolate overflow-hidden bg-white text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.12),transparent_26%),radial-gradient(circle_at_84%_22%,rgba(14,165,233,0.1),transparent_22%),linear-gradient(180deg,rgba(255,255,255,1),rgba(247,250,255,0.96))]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.28, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[10%] top-[12%] h-[34%] w-[24%] rounded-full bg-sky-200/35 blur-3xl"
      />
      <div className="absolute left-[8%] top-[18%] h-24 w-24 rounded-full border border-sky-100 bg-sky-50/80 blur-2xl" />

      <div className="section relative z-10 grid min-h-[410px] items-center gap-4 pb-4 pt-16 sm:min-h-[520px] sm:gap-6 sm:pb-8 sm:pt-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:pt-24">
        <div className="relative hidden max-w-xl py-1 sm:block lg:-mt-4">
          <div className="max-w-xl">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/70 sm:text-xs">New season footwear</p>
            <h1 className="mt-4 max-w-[11ch] text-[2rem] font-black leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-[3.5rem] lg:text-[4.5rem]">
              Clean white storefront, bold shoe focus.
            </h1>
            <p className="mt-4 max-w-[34rem] text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
              Explore sneakers, sandals, and everyday pairs through a quieter layout with sharper product focus, faster browsing, and less visual noise.
            </p>
          </div>

          <div className="mt-8 flex min-h-[72px] items-center gap-3 sm:mt-10 sm:min-h-[88px] sm:gap-4 lg:mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-950 px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-primary hover:shadow-[0_22px_48px_rgba(37,99,235,0.18)] sm:gap-4 sm:px-9 sm:py-4 sm:text-base"
            >
              Buy now
              <ChevronRight size={20} />
            </Link>

            <div className="hidden min-w-[190px] rounded-[1.25rem] border border-slate-200 bg-white/88 px-4 py-3 text-sm text-slate-500 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.id + "-cta-copy"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <p className="font-semibold text-slate-900">{activeProduct.name}</p>
                  <p>{activeProduct.caption}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="relative flex h-[190px] items-center justify-center sm:h-[340px] lg:h-[390px]">
          <div className="absolute inset-0 rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.96))] shadow-[0_24px_80px_rgba(15,23,42,0.08)]" />
          <div className={`absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${activeProduct.accent} opacity-30 blur-3xl transition-all duration-500`} />
          <div className="absolute inset-x-[10%] bottom-[10%] h-10 rounded-full bg-slate-300/40 blur-2xl" />
          <AnimatePresence mode="wait">
            <motion.img
              key={activeProduct.id}
              src={activeProduct.image}
              alt={activeProduct.name}
              loading="eager"
              initial={{ opacity: 0, x: 80, rotate: -12, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, rotate: -8, scale: 1, y: [0, -8, 0] }}
              exit={{ opacity: 0, x: -60, rotate: -3, scale: 0.9 }}
              transition={{ duration: 0.55, ease: "easeOut", y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" } }}
              className="relative z-20 mx-auto block h-[165px] w-full max-w-[660px] object-contain object-center drop-shadow-[0_24px_32px_rgba(17,24,39,0.2)] sm:h-[320px] lg:h-[385px]"
            />
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2 lg:-mt-2">
          <div className="mx-auto flex w-fit items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] sm:gap-3 sm:px-4 sm:py-2.5">
            {heroProducts.map((product, index) => {
              const active = product.id === activeProduct.id;
              return (
                <motion.button
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + index * 0.08, duration: 0.4 }}
                  onClick={() => setActiveId(product.id)}
                  whileHover={{ y: -2, scale: active ? 1.1 : 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className={`grid h-10 w-10 place-items-center overflow-hidden rounded-full border transition-all duration-300 sm:h-14 sm:w-14 ${active ? "scale-110 border-slate-300 bg-slate-950 shadow-[0_12px_22px_rgba(17,24,39,0.14)]" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                  aria-label={product.name}
                >
                  <img src={product.image} alt={product.name} className="h-7 w-7 object-contain object-center sm:h-9 sm:w-9" loading="lazy" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
