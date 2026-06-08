import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronRight, Play, ShoppingBag } from "lucide-react";
import { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";

const heroProducts = [
  {
    id: "red",
    title: "Velocity in Every Stride",
    description: "Experience the ultimate fusion of speed and comfort with our latest Aero Sprint series.",
    name: "Aero Sprint",
    price: "$129.99",
    image: "/hero/sneaker-blue.svg",
    accent: "from-blue-600 to-indigo-600",
    glow: "rgba(37, 99, 235, 0.2)",
  },
  {
    id: "orange",
    title: "Redefine Your Limit",
    description: "Engineered for those who never stop. The Volt Runner provides unmatched energy return.",
    name: "Volt Runner",
    price: "$145.00",
    image: "/hero/sneaker-black.svg",
    accent: "from-orange-500 to-red-600",
    glow: "rgba(249, 115, 22, 0.2)",
  },
  {
    id: "white",
    title: "Purity Meets Performance",
    description: "The Street Dash combines minimalist aesthetics with high-performance cushioning.",
    name: "Street Dash",
    price: "$110.00",
    image: "/hero/sneaker-white.svg",
    accent: "from-slate-400 to-slate-600",
    glow: "rgba(148, 163, 184, 0.2)",
  },
];

export default function HeroSection() {
  const [activeId, setActiveId] = useState(heroProducts[1].id);
  const containerRef = useRef(null);
  
  const activeProduct = useMemo(
    () => heroProducts.find((item) => item.id === activeId) || heroProducts[1],
    [activeId]
  );

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] lg:min-h-screen overflow-hidden bg-background flex items-center pt-20"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.1),transparent)]" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.15, 0.1] 
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
            opacity: [0.05, 0.1, 0.05] 
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-accent/20 blur-[100px] rounded-full" 
        />
      </div>

      <div className="section relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Content Side */}
          <motion.div 
            style={{ y: y1, opacity }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider">New Drop 2026</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-5xl lg:text-8xl font-black mb-6 leading-[1] text-foreground">
                  {activeProduct.title.split(" ").map((word, i) => (
                    <span key={i} className={i === 1 ? "text-primary" : ""}>
                      {word}{" "}
                    </span>
                  ))}
                </h1>
                <p className="text-lg text-muted-foreground mb-10 max-w-lg leading-relaxed">
                  {activeProduct.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-premium">
                Shop Collection
                <ShoppingBag className="ml-2 w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-border bg-background/50 backdrop-blur-sm hover:bg-muted transition-all font-bold">
                <Play className="w-5 h-5 fill-current" />
                Watch Review
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8">
              <div>
                <p className="text-3xl font-black">24k+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Happy Users</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <p className="text-3xl font-black">4.9/5</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Rating</p>
              </div>
            </div>
          </motion.div>

          {/* Image/Visual Side */}
          <div className="relative aspect-square lg:aspect-auto lg:h-[600px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: -10 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                transition={{ duration: 0.6, type: "spring", damping: 12 }}
                className="relative z-20"
              >
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${activeProduct.accent} blur-[100px] opacity-40 rounded-full animate-pulse-glow`} 
                />
                <img 
                  src={activeProduct.image} 
                  alt={activeProduct.name}
                  className="relative z-10 w-full max-w-[550px] object-contain drop-shadow-[0_32px_64px_rgba(0,0,0,0.3)] animate-float"
                />
                
                {/* Floating Info Badge */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -right-4 top-1/4 surface-glass p-4 rounded-2xl shadow-premium z-30 hidden sm:block"
                >
                  <p className="text-xs font-bold text-primary uppercase tracking-tighter">Current Price</p>
                  <p className="text-2xl font-black">{activeProduct.price}</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Product Switcher */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4 p-2 rounded-full surface-glass z-30">
              {heroProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                    activeId === p.id ? "border-primary scale-110 shadow-neon" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
