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
    image: image || resolveProductImage(product, "/static/demo-products/sneaker-black.svg"),
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft transition-all duration-500 hover:shadow-premium",
        className
      )}
    >
      <div className="p-3 sm:p-4">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-muted/50 to-muted/20">
          <Link to={href} className="block h-full w-full" aria-label={title}>
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="h-full w-full object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-6"
            />
          </Link>
          
          {/* Badges */}
          <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
            {hasDiscount ? (
              <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary-foreground shadow-neon">
                {discount}% OFF
              </span>
            ) : null}
            {stock > 0 && stock < 5 ? (
              <span className="rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                Low Stock
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full surface-glass text-foreground shadow-soft transition-all hover:scale-110 hover:bg-primary hover:text-white"
            aria-label="Add to wishlist"
          >
            <Heart size={20} className={cn(wishlisted && "fill-current")} />
          </button>
        </div>

        {/* Content Section */}
        <div className="mt-5 px-1 pb-2">
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={12}
                  className={cn(
                    "transition-colors",
                    index < Math.round(numericRating) ? "fill-primary text-primary" : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
              ({ratingCount})
            </span>
          </div>

          <Link to={href} className="block mb-3">
            <h3 className="line-clamp-2 text-lg font-black leading-tight text-foreground transition-colors group-hover:text-primary">
              {title}
            </h3>
          </Link>

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
              {oldPrice ? (
                <span className="text-xs font-bold text-muted-foreground line-through opacity-60">Tk {oldPrice}</span>
              ) : null}
              <span className="text-2xl font-black text-foreground tracking-tighter">Tk {price}</span>
            </div>
            
            <motion.button
              type="button"
              onClick={handleAddToCart}
              disabled={stock < 1 || (!onAddToCart && !product?.id)}
              whileTap={{ scale: 0.9 }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-neon transition-all hover:rotate-12 disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              <ShoppingCart size={22} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

const ProductCard = memo(ProductCardComponent);

export default ProductCard;
