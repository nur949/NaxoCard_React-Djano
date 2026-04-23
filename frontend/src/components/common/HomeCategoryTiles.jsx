import { Link } from "react-router-dom";

const tiles = [
  ["Mens Sandal", "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=500&q=80"],
  ["Ladies Sandal", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80"],
  ["Bags", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80"],
  ["Casual Shoes", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=500&q=80"],
  ["All Shoes", "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=500&q=80"],
  ["Sports", "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=500&q=80"],
  ["Accessories", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80"],
  ["New Arrivals", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80"],
];

export default function HomeCategoryTiles() {
  return (
    <section className="section py-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {tiles.map(([label, image]) => (
          <Link key={label} to={`/products?search=${encodeURIComponent(label)}`} className="group text-center">
            <div className="overflow-hidden rounded-md bg-muted shadow-soft">
              <img src={image} alt={label} loading="lazy" className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <p className="mt-2 text-xs font-black uppercase tracking-wide group-hover:text-primary">{label}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
