import { Link } from "react-router-dom";

const tiles = [
  { label: "Men's Shoes", image: "https://pngimg.com/d/shoes_PNG7475.png", to: "/products?category=mens-shoes" },
  { label: "Women's Shoes", image: "https://pngimg.com/d/women_shoes_PNG7486.png", to: "/products?category=womens-shoes" },
  { label: "Kids' Shoes", image: "https://pngimg.com/d/running_shoes_PNG5827.png", to: "/products?category=kids-shoes" },
  { label: "Casual Shoes", image: "https://pngimg.com/d/shoes_PNG7490.png", to: "/products?search=casual%20shoes" },
  { label: "Sneakers", image: "https://pngimg.com/d/running_shoes_PNG5814.png", to: "/products?category=sneakers" },
  { label: "Sandals", image: "https://pngimg.com/d/sandal_PNG26.png", to: "/products?category=sandals" },
  { label: "Loafers", image: "https://pngimg.com/d/shoes_PNG7487.png", to: "/products?category=loafers" },
  { label: "New Arrivals", image: "https://pngimg.com/d/running_shoes_PNG5818.png", to: "/products?sort=newest" },
];

export default function HomeCategoryTiles() {
  return (
    <section className="section py-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {tiles.map(({ label, image, to }) => (
          <Link key={label} to={to} className="group text-center">
            <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
              <img src={image} alt={label} loading="lazy" className="aspect-square w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" />
            </div>
            <p className="mt-2 text-xs font-black uppercase tracking-wide group-hover:text-primary">{label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
