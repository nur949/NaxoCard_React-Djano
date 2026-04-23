import { Heart, ShoppingBag } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";
import api, { productImage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { Badge } from "./ui/badge.jsx";
import { Card, CardContent } from "./ui/card.jsx";

function ProductCard({ product, view = "grid", onChanged }) {
  const { user } = useAuth();
  const { add } = useCart();
  const image = productImage(product, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80");
  const brand = product.category?.name || "NaxoCard";

  async function toggleWishlist() {
    await api.post(`/products/${product.slug}/wishlist/`);
    onChanged?.();
  }

  const body = (
    <>
      <div className={`relative ${view === "list" ? "h-60 w-full overflow-hidden sm:h-auto sm:w-72" : "h-72 w-full overflow-hidden"} bg-white`}>
        <Link to={`/products/${product.slug}`} className="block h-full">
          <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]" />
        </Link>
        {product.discount_percent > 0 && <Badge className="absolute left-4 top-4 shadow-sm" variant="default">Sale</Badge>}
        <div className="absolute right-5 top-5">
          {user && (
            <button type="button" className="text-foreground transition-colors hover:text-primary" onClick={toggleWishlist} title="Wishlist" aria-label="Wishlist">
              <Heart size={28} strokeWidth={1.6} fill={product.is_wishlisted ? "currentColor" : "none"} />
            </button>
          )}
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col px-8 pb-8 pt-5 text-center">
        <div className="min-w-0 space-y-3">
          <p className="text-base font-medium uppercase tracking-wide text-foreground">{brand}</p>
          <Link to={`/products/${product.slug}`} className="line-clamp-2 block min-h-12 text-lg font-normal leading-snug text-foreground transition-colors hover:text-primary">{product.name}</Link>
        </div>

        <div className="mt-auto">
          <div className="mt-3 flex min-h-8 items-baseline justify-center gap-2">
            {product.compare_at_price && <span className="text-sm font-semibold text-muted-foreground line-through">Tk {product.compare_at_price}</span>}
            <span className="text-2xl font-black text-foreground">Tk {product.price}</span>
          </div>
          {product.stock < 1 ? (
            <button className="mt-5 h-14 w-full rounded bg-muted text-base font-black uppercase tracking-wide text-muted-foreground" disabled>
              Sold out
            </button>
          ) : (
            <button className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded bg-black text-base font-black uppercase tracking-wide text-white transition-colors duration-200 hover:bg-primary disabled:cursor-not-allowed disabled:bg-black/45" onClick={() => add(product.id, 1, product)} disabled={!user}>
              <ShoppingBag size={18} /> Shop now
            </button>
          )}
          {!user && (
            <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">Login to shop</p>
          )}
        </div>
      </CardContent>
    </>
  );

  return <Card className={`group overflow-hidden rounded-sm border border-border bg-white text-foreground shadow-sm transition-shadow duration-200 hover:shadow-md ${view === "list" ? "sm:flex" : ""}`}>{body}</Card>;
}

export default memo(ProductCard);
