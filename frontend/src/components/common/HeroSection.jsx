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
    image: "https://pngimg.com/d/running_shoes_PNG5818.png",
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
    image: "https://pngimg.com/d/running_shoes_PNG5827.png",
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
    image: "https://pngimg.com/d/running_shoes_PNG5816.png",
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
      <div className="absolute left-[8%] top-[18%] text-[4.5rem] font-black uppercase leading-none tracking-[-0.08em] text-white/10 sm:text-[6.5rem] lg:text-[10rem]">
        Nike
      </div>
      <div className="absolute left-[4%] top-[60%] h-[26%] w-[54%] rounded-[42px] border border-white/10 bg-[radial-gradient(circle_at_60%_10%,rgba(255,255,255,0.10),transparent_58%)]" />
      <div className="absolute right-[12%] top-[16%] h-[38%] w-[24%] rounded-full bg-white/12 blur-[2px]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-black/5" />

      <div className="section relative z-10 grid min-h-[520px] items-center gap-4 pb-4 pt-24 sm:pb-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6 lg:pt-24">
        <motion.div
          key={activeProduct.id + "-content"}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative max-w-lg py-4"
        >
          <h1 className="relative z-20 max-w-[8.5ch] text-[2.55rem] font-black leading-[0.94] tracking-[-0.05em] text-[#c9fff8] sm:text-[3.4rem] lg:text-[4rem]">
            {activeProduct.title}
          </h1>

          <div className="mt-5 max-w-md space-y-2 text-sm text-white/68 sm:text-[15px]">
            {activeProduct.subtitle.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          <div className="mt-7">
            <Link
              to="/products"
              className="inline-flex items-center gap-4 rounded-full bg-[#d0ecef] px-7 py-3.5 text-sm font-black uppercase tracking-[0.06em] text-slate-900 transition hover:scale-[1.02] sm:px-8 sm:text-base"
            >
              Buy now
              <ChevronRight size={20} />
            </Link>
          </div>
        </motion.div>

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
              animate={{ opacity: 1, x: 0, rotate: -8, scale: 1 }}
              exit={{ opacity: 0, x: -60, rotate: -3, scale: 0.9 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="relative z-20 mx-auto block h-[220px] w-full max-w-[620px] object-contain object-center drop-shadow-[0_24px_26px_rgba(17,24,39,0.26)] sm:h-[300px] lg:h-[360px]"
            />
          </AnimatePresence>
        </div>

        <div className="lg:col-span-2 lg:-mt-3">
          <div className="mx-auto flex w-fit items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur">
          {heroProducts.map((product, index) => {
            const active = product.id === activeProduct.id;
            return (
              <motion.button
                key={product.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + index * 0.08, duration: 0.4 }}
                onClick={() => setActiveId(product.id)}
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
