import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const tiles = [
  { label: "Men's Collection", image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=500&q=80", to: "/products?category=mens-shoes", size: "large" },
  { label: "Women's Fashion", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=500&q=80", to: "/products?category=womens-shoes", size: "small" },
  { label: "Newest Arrivals", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80", to: "/products?sort=newest", size: "small" },
  { label: "Elite Sneakers", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=500&q=80", to: "/products?category=sneakers", size: "small" },
  { label: "Urban Style", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=500&q=80", to: "/products?search=casual%20shoes", size: "small" },
];

export default function HomeCategoryTiles() {
  return (
    <section className="section py-16 sm:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Curated Categories</h2>
          <p className="text-lg text-muted-foreground">Find your perfect pair by exploring our specialized collections.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px] md:h-[500px]">
        {tiles.map((tile, index) => (
          <Link 
            key={tile.label} 
            to={tile.to}
            className={`group relative overflow-hidden rounded-[2.5rem] ${
              tile.size === "large" ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1"
            }`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="h-full w-full"
            >
              <img
                src={tile.image}
                alt={tile.label}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
                <p className="text-white/70 text-xs font-black uppercase tracking-[0.2em] mb-2">{tile.size === "large" ? "Premium Selection" : "Collection"}</p>
                <h3 className="text-2xl md:text-3xl font-black text-white group-hover:text-primary transition-colors">
                  {tile.label}
                </h3>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
