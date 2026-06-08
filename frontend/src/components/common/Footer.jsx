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
    <footer className="mt-24 border-t border-border bg-card">
      <div className="section grid gap-12 py-16 lg:grid-cols-[1.5fr_2fr_1fr]">
        
        {/* Brand Section */}
        <div className="space-y-6 text-center lg:text-left">
          <Link to="/" className="text-4xl font-black tracking-tighter text-foreground">
            Naxo<span className="text-primary">Card</span>
          </Link>
          <p className="max-w-xs mx-auto lg:mx-0 text-muted-foreground leading-relaxed">
            Redefining the shoe shopping experience with premium quality and unparalleled comfort.
          </p>
          <div className="flex justify-center lg:justify-start gap-4">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-soft"
                aria-label={label}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/50">{group.title}</h3>
              <ul className="space-y-3">
                {group.links.map(([label, to]) => (
                  <li key={label}>
                    <Link 
                      to={to} 
                      className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="p-8 rounded-[2rem] bg-muted/30 border border-border shadow-soft">
          <h3 className="text-xl font-black mb-2">Join the Club</h3>
          <p className="text-sm text-muted-foreground mb-6">Get early access to drops and exclusive offers.</p>
          <form className="space-y-3" onSubmit={(event) => event.preventDefault()}>
            <input 
              className="w-full h-12 px-4 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold" 
              type="email" 
              placeholder="Your email address" 
            />
            <button className="w-full h-12 bg-foreground text-background rounded-xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all">
              Subscribe
            </button>
          </form>
        </div>

      </div>

      <div className="border-t border-border py-8">
        <div className="section flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>&copy; 2026 NaxoCard</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>Built by Md. Nur Jamal Miah</span>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
