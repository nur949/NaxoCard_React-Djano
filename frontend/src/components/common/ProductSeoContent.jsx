import { Link } from "react-router-dom";

function formatPrice(price) {
  const value = Number(price || 0);
  return Number.isFinite(value) ? value.toLocaleString("en-BD") : "0";
}

export default function ProductSeoContent({ product }) {
  if (!product) return null;

  const categoryName = product.category?.name || "Shoes";
  const productName = product.name || "NaxoCard product";
  const price = formatPrice(product.price);
  const comparePrice = product.compare_at_price ? formatPrice(product.compare_at_price) : null;
  const inStock = Number(product.stock || 0) > 0;
  const shortDescription = product.description || `${productName} from NaxoCard.`;

  return (
    <section className="section py-8">
      <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:px-8 lg:px-10">
        <div className="max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">About This Product</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            {productName} price in Bangladesh, features, fit, and buying details
          </h2>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700">{shortDescription}</p>
        </div>

        <div className="mt-10 space-y-8">
          <article className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Why {productName} stands out</h3>
            <div className="mt-4 space-y-4 text-base leading-8 text-slate-700">
              <p>
                {productName} is listed under {categoryName} at NaxoCard for shoppers who want a cleaner way to compare shoe style,
                comfort, and day-to-day usability before placing an order. Product details, gallery images, and related products
                help buyers evaluate the item without guessing.
              </p>
              <p>
                The current selling price is Tk {price}
                {comparePrice ? `, compared with a previous price of Tk ${comparePrice}` : ""}.{" "}
                {inStock
                  ? "The item is currently available to order, which is useful for customers ready to buy immediately."
                  : "Stock status changes with live inventory, so customers should review availability before checkout."}
              </p>
            </div>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Best for daily wear, outfit matching, and easy shoe shopping</h3>
            <div className="mt-4 space-y-4 text-base leading-8 text-slate-700">
              <p>
                This product page is designed to answer common purchase questions around look, fit, category relevance, and order
                flow. For SEO, that matters because the page carries more product-specific context instead of relying only on a short
                title and image gallery.
              </p>
              <p>
                Shoppers browsing {categoryName.toLowerCase()} in Bangladesh usually compare design, color, price, intended use, and delivery
                convenience. A content block like this supports that intent while keeping the page more useful for real visitors.
              </p>
            </div>
          </article>

          <article className="border-t border-slate-200 pt-8">
            <h3 className="text-2xl font-black tracking-tight text-slate-900">Order {productName} online from NaxoCard</h3>
            <div className="mt-4 space-y-4 text-base leading-8 text-slate-700">
              <p>
                Customers can add {productName} to cart, review quantity and available variants, and complete checkout through a
                simpler purchase flow. Guest checkout and cash on delivery support make the order process easier for users who prefer
                not to create an account first.
              </p>
              <p>
                If you want to compare more items before buying, browse more from the same category or continue to related products
                below for similar alternatives.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                to={`/products?category=${product.category?.slug || ""}`}
              >
                Browse {categoryName}
              </Link>
              <Link
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                to="/products"
              >
                View All Products
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
