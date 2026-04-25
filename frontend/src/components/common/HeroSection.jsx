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
    <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,#3f96d7_0%,#76a8d8_38%,#cbb7ef_100%)] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.22),transparent_22%)]" />
      <motion.div
        animate={{ x: [0, 16, 0], y: [0, -8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[7%] top-[17%] text-[4.5rem] font-black uppercase leading-none tracking-[-0.08em] text-white/20 sm:text-[6.5rem] lg:text-[10rem]"
      >
        NaxoCard
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.28, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[12%] top-[16%] h-[38%] w-[24%] rounded-full bg-white/12 blur-[2px]"
      />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-black/5" />

      <div className="section relative z-10 grid min-h-[520px] items-center gap-6 pb-6 pt-24 sm:pb-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:pt-24">
        <div className="relative max-w-lg py-1 lg:-mt-8">
          <div className="mt-32 flex min-h-[88px] items-center gap-4 lg:mt-40">
            <Link
              to="/products"
              className="inline-flex items-center gap-4 rounded-full border border-white/40 bg-white/75 px-8 py-4 text-sm font-black uppercase tracking-[0.12em] text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur transition hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white hover:shadow-[0_22px_48px_rgba(208,236,239,0.3)] sm:px-9 sm:text-base"
            >
              Buy now
              <ChevronRight size={20} />
            </Link>

            <div className="hidden min-w-[170px] text-sm text-white/75 sm:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProduct.id + "-cta-copy"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <p className="font-semibold text-white">{activeProduct.name}</p>
                  <p>{activeProduct.caption}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="relative flex h-[280px] items-center justify-center sm:h-[340px] lg:h-[390px]">
          <div className={`absolute left-1/2 top-1/2 h-[52%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${activeProduct.accent} opacity-25 blur-3xl transition-all duration-500`} />
          <div className="absolute inset-x-[10%] bottom-[8%] h-10 rounded-full bg-black/12 blur-2xl" />
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
              className="relative z-20 mx-auto block h-[240px] w-full max-w-[660px] object-contain object-center drop-shadow-[0_24px_26px_rgba(17,24,39,0.26)] sm:h-[320px] lg:h-[385px]"
            />
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2 lg:-mt-2">
          <div className="mx-auto flex w-fit items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur">
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
                  className={`grid h-14 w-14 place-items-center overflow-hidden rounded-full border transition-all duration-300 ${active ? "scale-110 border-white/80 bg-white shadow-[0_12px_22px_rgba(17,24,39,0.18)]" : "border-white/30 bg-white/70 hover:bg-white/90"}`}
                  aria-label={product.name}
                >
                  <img src={product.image} alt={product.name} className="h-9 w-9 object-contain object-center" loading="lazy" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
