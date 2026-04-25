import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productImage as resolveProductImage } from "../api/client.js";
import { useCart } from "../context/CartContext.jsx";
import { cn } from "../lib/utils.js";

function buildProductCardProps(props) {
  if (!props.product) return props;

  const { product, href, image, title, price, oldPrice, rating, ratingCount, stock, discount, availability, ...rest } = props;

  return {
    ...rest,
    product,
    href: href || `/products/${product.slug}`,
    image: image || resolveProductImage(product, "/media/demo-products/sneaker-black.svg"),
    title: title || product.name,
    price: price ?? product.price,
    oldPrice: oldPrice ?? product.compare_at_price,
    rating: rating ?? Number(product.rating || 0),
    ratingCount: ratingCount ?? Number(product.review_count || 0),
    stock: stock ?? Number(product.stock || 0),
    discount: discount ?? Number(product.discount_percent || 0),
    availability: availability || (Number(product.stock || 0) > 0 ? "In stock" : "Out of stock"),
    wishlisted: Boolean(product.is_wishlisted),
  };
}

function ProductCardComponent(rawProps) {
  const {
    product,
    href = "#",
    image,
    title,
    price,
    oldPrice,
    rating = 0,
    ratingCount = 0,
    stock = 0,
    discount = 0,
    availability,
    wishlisted = false,
    onAddToCart,
    onToggleWishlist,
    className,
    loading = false,
  } = buildProductCardProps(rawProps);

  const { add } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={cn("overflow-hidden rounded-xl border border-border bg-card p-4 shadow-soft", className)}>
        <div className="aspect-square animate-pulse rounded-xl bg-muted" />
        <div className="mt-4 h-5 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-7 w-1/2 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-5 h-11 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  async function handleWishlist(event) {
    event.preventDefault();
    event.stopPropagation();
    await onToggleWishlist?.(product);
  }

  async function handleAddToCart(event) {
    event.preventDefault();
    event.stopPropagation();
    if (onAddToCart) {
      await onAddToCart(product);
      return;
    }
    if (product?.id) {
      await add(product.id, 1, product);
    }
  }

  const hasDiscount = Number(discount) > 0;
  const numericRating = Number(rating || 0);

  function openProductDetails() {
    if (href) navigate(href);
  }

  function handleCardClick(event) {
    if (event.target.closest("button, a")) return;
    openProductDetails();
  }

  function handleCardKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProductDetails();
    }
  }

  return (
    <motion.article
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="link"
      tabIndex={0}
      className={cn("group relative overflow-hidden rounded-xl border border-border bg-card shadow-soft transition-shadow hover:shadow-lg", className)}
    >
      <div className="p-4">
        <div className="relative overflow-hidden rounded-xl border border-slate-100 bg-white">
          <Link to={href} className="block overflow-hidden" aria-label={title}>
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="aspect-square w-full object-contain p-4 transition duration-300 ease-out hover:scale-[1.05]"
            />
          </Link>
          <div className="absolute left-3 top-3 z-20 flex items-center gap-2">
            {hasDiscount ? (
              <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                {discount}% OFF
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/85 text-foreground shadow-sm transition hover:scale-105 hover:bg-white"
            aria-label="Add to wishlist"
          >
            <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <Link to={href} className="min-w-0">
              <h3 className="line-clamp-2 min-h-[3.25rem] text-base font-semibold leading-6 text-foreground transition-colors hover:text-primary">
                {title}
              </h3>
            </Link>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                stock > 0
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {availability || (stock > 0 ? "In stock" : "Out of stock")}
            </span>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-2xl font-black text-foreground">Tk {price}</span>
            {oldPrice ? (
              <span className="text-sm font-medium text-muted-foreground line-through">Tk {oldPrice}</span>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={15}
                  className={cn(
                    "transition-colors",
                    index < Math.round(numericRating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
                  )}
                />
              ))}
              <span className="ml-1 text-sm font-medium text-muted-foreground">
                {numericRating.toFixed(1)} ({ratingCount})
              </span>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleAddToCart}
            disabled={stock < 1 || (!onAddToCart && !product?.id)}
            initial={{ y: 10, opacity: 0.92 }}
            whileHover={{ y: 0 }}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-semibold text-background transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart size={17} />
            {stock > 0 ? "Add to cart" : "Unavailable"}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

const ProductCard = memo(ProductCardComponent);

export default ProductCard;
