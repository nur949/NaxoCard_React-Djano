import ProductCard from "../ProductCard.jsx";

export default function HomeProductShowcase({ title, subtitle, products = [] }) {
  const items = Array.isArray(products) ? products : [];
  if (!items.length) return null;

  return (
    <section className="section py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black tracking-tight text-foreground">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
