import { motion } from "framer-motion";
import ProductCard from "../ProductCard.jsx";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeProductShowcase({ title, subtitle, products = [] }) {
  const items = Array.isArray(products) ? products.slice(0, 10) : [];
  if (!items.length) return null;

  return (
    <section className="section py-16 sm:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black tracking-tighter mb-4"
          >
            {title}
          </motion.h2>
          {subtitle && (
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Link 
            to="/products" 
            className="group inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm hover:gap-4 transition-all"
          >
            Explore All
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-10">
        {items.map((product, index) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
