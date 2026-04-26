import { Link } from "react-router-dom";

const tiles = [
  { label: "Men's Shoes", image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=500&q=80", to: "/products?category=mens-shoes" },
  { label: "Women's Shoes", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80", to: "/products?category=womens-shoes" },
  { label: "Kids' Shoes", image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=500&q=80", to: "/products?category=kids-shoes" },
  { label: "Casual Shoes", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=500&q=80", to: "/products?search=casual%20shoes" },
  { label: "Sneakers", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=500&q=80", to: "/products?category=sneakers" },
  { label: "Sandals", image: "https://images.unsplash.com/photo-1562273138-f46be4ebdf33?auto=format&fit=crop&w=500&q=80", to: "/products?category=sandals" },
  { label: "Loafers", image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=500&q=80", to: "/products?category=loafers" },
  { label: "New Arrivals", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80", to: "/products?sort=newest" },
];

export default function HomeCategoryTiles() {
  return (
    <section className="section py-8">
      <div
        className="grid auto-cols-[20%] grid-flow-col gap-3 overflow-x-auto pb-2 snap-x snap-mandatory sm:grid-cols-4 sm:grid-flow-row sm:auto-cols-auto sm:overflow-visible lg:grid-cols-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tiles.map(({ label, image, to }) => (
          <Link key={label} to={to} className="group min-w-0 snap-start text-center">
            <div className="overflow-hidden rounded-full bg-muted shadow-soft sm:rounded-md">
              <img
                src={image}
                alt={label}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.06em] leading-tight group-hover:text-primary sm:text-xs sm:tracking-wide">
              {label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
