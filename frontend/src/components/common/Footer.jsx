import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button.jsx";

const footerGroups = [
  {
    title: "Shop",
    links: [
      ["Men", "/products?search=Men"],
      ["Women", "/products?search=Women"],
      ["Children", "/products?search=Kids"],
      ["Accessories", "/products?category=accessories"],
      ["Best sellers", "/products?ordering=-rating"],
    ],
  },
  {
    title: "Customer care",
    links: [
      ["Track order", "/orders"],
      ["My wishlist", "/products?wishlist=1"],
      ["Delivery info", "/products?search=delivery"],
      ["Returns & exchange", "/returns-exchange"],
      ["Store locator", "/store-locator"],
    ],
  },
  {
    title: "Account",
    links: [
      ["Login / Register", "/auth"],
      ["Profile", "/profile"],
      ["Order history", "/orders"],
      ["Loyalty points", "/profile"],
      ["Admin panel", "/admin"],
    ],
  },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "YouTube", href: "https://youtube.com", icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="section grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr_1.1fr]">
        <div>
          <Link to="/" className="text-3xl font-black tracking-tight text-primary">NaxoCard</Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Stylish shoes and accessories for everyday shopping in Bangladesh.
          </p>
          <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Dhaka, Bangladesh</span>
            <span className="flex items-center gap-2"><Phone size={16} className="text-primary" /> 09666200300</span>
            <span className="flex items-center gap-2"><Mail size={16} className="text-primary" /> admin@gmail.com</span>
          </div>
          <div className="mt-5 flex gap-2">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <Button
                key={label}
                asChild
                variant="outline"
                size="icon"
                className="transition hover:border-primary hover:text-primary"
              >
                <a href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon size={17} />
                </a>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-black uppercase tracking-wide">{group.title}</h3>
              <div className="mt-4 grid gap-2.5">
                {group.links.map(([label, to]) => (
                  <Link key={label} to={to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-background p-5 shadow-soft">
          <h3 className="text-lg font-black">Get member deals</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Get updates on new arrivals and special offers.</p>
          <form className="mt-4 grid gap-2" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="footer-email">Email address</label>
            <input id="footer-email" className="input" type="email" placeholder="Email address" />
            <Button type="submit" className="w-full">Subscribe</Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">Simple updates only.</p>
        </div>
      </div>

      <div className="border-t">
        <div className="section flex flex-col gap-3 py-5 text-xs font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span>&copy; 2026 NaxoCard. All rights reserved.</span>
            <span className="hidden sm:inline">|</span>
            <span>
              Developed by:{" "}
              <a
                href="https://github.com/nur949"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-foreground transition hover:text-primary"
              >
                Md. Nur Jamal Miah
              </a>
            </span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/refund-policy" className="hover:text-primary">Refund policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
