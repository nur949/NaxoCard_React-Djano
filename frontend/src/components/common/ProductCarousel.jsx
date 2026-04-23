import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import ProductCard from "../ProductCard.jsx";
import { Button } from "../ui/button.jsx";

export default function ProductCarousel({ title, subtitle, products = [] }) {
  const railRef = useRef(null);
  const scroll = (direction) => {
    railRef.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="section py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="icon" onClick={() => scroll(-1)} aria-label="Previous products"><ChevronLeft size={18} /></Button>
          <Button variant="outline" size="icon" onClick={() => scroll(1)} aria-label="Next products"><ChevronRight size={18} /></Button>
        </div>
      </div>
      <div ref={railRef} className="flex snap-x gap-5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div key={product.id} className="min-w-[280px] snap-start sm:min-w-[320px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
