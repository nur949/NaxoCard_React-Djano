import { Link } from "react-router-dom";

const sections = [
  {
    title: "Leading Online Shoe Shop in Bangladesh",
    paragraphs: [
      "NaxoCard is focused on shoes only. The catalog is built around everyday footwear, sneakers, loafers, sandals, and comfort-first pairs for customers across Bangladesh who want a cleaner way to shop online.",
      "From casual daily wear to sport-inspired designs and occasion-ready pairs, the store keeps product discovery centered on footwear. Detailed product pages, related items, and category navigation make it easier to compare style, fit, and price with less friction.",
    ],
  },
  {
    title: "Shop Men's, Women's, and Kids' Shoes Online",
    paragraphs: [
      "If you are looking for men's shoes, women's shoes, or kids' shoes in Bangladesh, NaxoCard gives you a focused selection across popular categories. That includes everyday sneakers, sports shoes, comfort sandals, and seasonal fashion picks for different age groups and styles.",
      "Customers can move from category to category without friction, explore featured products, and discover popular items from the homepage before heading into detailed product pages and checkout.",
    ],
    links: [
      { label: "Men's Shoes", to: "/products?category=mens-shoes" },
      { label: "Women's Shoes", to: "/products?category=womens-shoes" },
      { label: "Kids' Shoes", to: "/products?category=kids-shoes" },
      { label: "Sandals", to: "/products?category=sandals" },
      { label: "Sneakers", to: "/products?category=sneakers" },
    ],
  },
  {
    title: "Transparent PNG Product Images and Color-wise Galleries",
    paragraphs: [
      "NaxoCard now leans into product presentation that works well for shoe shopping. Clean PNG-style visuals with background-free product focus make the listing cards, detail pages, and color selectors feel more professional and easier to scan.",
      "Color-wise multiple images also help customers understand exactly which version of the shoe they are selecting. That improves the shopping experience and gives product pages stronger, more specific context for search intent.",
    ],
    links: [
      { label: "Men's Shoes", to: "/products?category=mens-shoes" },
      { label: "Women's Shoes", to: "/products?category=womens-shoes" },
      { label: "Loafers", to: "/products?category=loafers" },
      { label: "New Arrivals", to: "/products?sort=newest" },
    ],
  },
  {
    title: "Fast Browsing, Simple Checkout, and Cash on Delivery",
    paragraphs: [
      "NaxoCard is designed for a faster shopping flow. Users can browse categories, open product details, review related products, add items to cart, and complete checkout with a straightforward process. Guest checkout and cash on delivery make ordering easier for buyers who do not want to create an account first.",
      "A homepage section like this can help SEO because it gives search engines real text context about your products, categories, audience, and shopping experience. It works best when the content is unique, relevant, and supported by strong product pages, internal links, and proper metadata.",
    ],
  },
];

export default function SeoContentSection() {
  return (
    <section className="section py-14">
      <div className="rounded-[32px] border border-slate-200 bg-white px-6 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-8 lg:px-10">
        <div className="max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary/70">SEO Content</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Discover shoes, sneakers, loafers, and sandals with clearer shopping intent
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            This section adds search-friendly copy under the product blocks while still staying useful for real visitors.
            It gives the homepage stronger topical context around footwear and online shoe shopping in Bangladesh.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <article key={section.title} className="border-t border-slate-200 pt-8 first:border-t-0 first:pt-0">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">{section.title}</h3>
              <div className="mt-4 space-y-4 text-base leading-8 text-slate-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.links ? (
                <div className="mt-5 flex flex-wrap gap-3">
                  {section.links.map((link) => (
                    <Link
                      key={link.label}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
                      to={link.to}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
