import { CreditCard, Facebook, Headphones, Instagram, Mail, MapPin, Phone, ShieldCheck, Truck, Youtube } from "lucide-react";
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
      ["Returns & exchange", "/products?search=returns"],
      ["Store locator", "/products"],
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

const trustItems = [
  [Truck, "Fast delivery"],
  [ShieldCheck, "Secure checkout"],
  [CreditCard, "Stripe test mode"],
  [Headphones, "09666200300"],
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="border-b bg-muted/40">
        <div className="section grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(([Icon, label]) => (
            <div key={label} className="flex items-center gap-3 rounded-md bg-background px-4 py-3 text-sm font-bold shadow-sm">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary"><Icon size={18} /></span>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="section grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr_1.1fr]">
        <div>
          <Link to="/" className="text-3xl font-black tracking-tight text-primary">NaxoCard</Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Premium footwear and accessories with live cart, secure checkout, loyalty rewards, and order tracking.
          </p>
          <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Dhaka, Bangladesh</span>
            <span className="flex items-center gap-2"><Phone size={16} className="text-primary" /> Customer care: 09666200300</span>
            <span className="flex items-center gap-2"><Mail size={16} className="text-primary" /> support@naxocard.test</span>
          </div>
          <div className="mt-5 flex gap-2">
            {[Facebook, Instagram, Youtube].map((Icon, index) => (
              <Button key={index} variant="outline" size="icon" aria-label="Social link">
                <Icon size={17} />
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
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Join the list for new drops, limited offers, and loyalty updates.</p>
          <form className="mt-4 grid gap-2" onSubmit={(event) => event.preventDefault()}>
            <label className="sr-only" htmlFor="footer-email">Email address</label>
            <input id="footer-email" className="input" type="email" placeholder="Email address" />
            <Button type="submit" className="w-full">Subscribe</Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
        </div>
      </div>

      <div className="border-t">
        <div className="section flex flex-col gap-3 py-5 text-xs font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 NaxoCard. All rights reserved.</span>
          <div className="flex flex-wrap gap-4">
            <Link to="/products" className="hover:text-primary">Privacy</Link>
            <Link to="/products" className="hover:text-primary">Terms</Link>
            <Link to="/products" className="hover:text-primary">Refund policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
