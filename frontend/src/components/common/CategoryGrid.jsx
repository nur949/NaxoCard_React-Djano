import { Link } from "react-router-dom";
import { Card } from "../ui/card.jsx";

export default function CategoryGrid({ categories = [] }) {
  const images = [
    "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=700&q=80",
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category, index) => (
        <Card key={category.slug} className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-premium">
          <Link to={`/products?category=${category.slug}`} className="block p-5">
            <div className="mb-4 h-28 overflow-hidden rounded-md bg-muted">
              <img src={images[index % images.length]} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground">Category</span>
            <h3 className="mt-2 text-xl">{category.name}</h3>
          </Link>
        </Card>
      ))}
    </div>
  );
}
