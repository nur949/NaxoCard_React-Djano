import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import api from "../../api/client.js";

export default function HeroSection() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/banners/")
      .then((res) => {
        setBanners(Array.isArray(res.data) ? res.data : (res.data?.results || []));
      })
      .catch((err) => console.error("Banner fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (loading || banners.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-background" style={{ aspectRatio: "1920/600" }}>
      <div className="relative h-full w-full max-w-[1920px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={banners[currentIndex]?.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 h-full w-full"
          >
            <img
              src={banners[currentIndex]?.image}
              alt={banners[currentIndex]?.title || "Hero Banner"}
              className="h-full w-full object-cover"
              style={{ width: "100%", height: "100%" }}
            />
            {banners[currentIndex]?.link && (
              <a 
                href={banners[currentIndex].link} 
                className="absolute inset-0 z-10"
                aria-label={banners[currentIndex].title}
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Slider Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentIndex === i ? "bg-primary w-8" : "bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
