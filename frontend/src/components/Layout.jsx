import { Footprints, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import CartPreview from "./common/CartPreview.jsx";
import Footer from "./common/Footer.jsx";
import MegaNav from "./common/MegaNav.jsx";
import MiniCartDrawer from "./common/MiniCartDrawer.jsx";
import UserMenu from "./common/UserMenu.jsx";
import { Button } from "./ui/button.jsx";

const primaryNav = [
  ["Home", "/"],
  ["About Us", "/products?search=about"],
  ["Shop", "/products"],
  ["Contact", "/contact"],
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { count } = useCart();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const heroMode = isHome && !scrolled;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  const navTone = useMemo(
    () =>
      heroMode
        ? {
            header: "bg-transparent text-white shadow-none",
            link: "text-white/90 hover:text-white",
            iconButton: "border-white/20 bg-white/8 text-white hover:bg-white/14",
            mobile: "bg-slate-950/92 text-white border-white/10",
            logo: "text-white",
          }
        : {
            header: "bg-background/92 text-foreground shadow-sm backdrop-blur-xl border-b border-border/60",
            link: "text-foreground/80 hover:text-primary",
            iconButton: "border-border bg-background text-foreground hover:bg-muted",
            mobile: "bg-background text-foreground border-border",
            logo: "text-primary",
          },
    [heroMode]
  );

  return (
    <div className="min-h-screen">
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${navTone.header}`}>
        <div className="section flex min-h-24 items-center justify-between gap-4 py-4">
          <Link to="/" className={`flex items-center gap-3 text-3xl font-black tracking-tight ${navTone.logo}`}>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white/12 backdrop-blur hero-safe-icon">
              <Footprints size={22} />
            </span>
            <span className="text-[2rem] leading-none">Shoe</span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {primaryNav.map(([label, to]) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-black uppercase tracking-[0.12em] transition-colors ${navTone.link} ${isActive && !heroMode ? "text-primary" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="outline" size="icon" className={navTone.iconButton} title="Search">
              <Search size={18} />
            </Button>
            <Button asChild variant="outline" size="icon" className={navTone.iconButton} title="Wishlist">
              <Link to="/products?wishlist=1"><Heart size={18} /></Link>
            </Button>
            <CartPreview>
              <Button variant="outline" size="icon" className={`${navTone.iconButton} relative`} title="Cart">
                <ShoppingCart size={18} />
                {count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">{count}</span>}
              </Button>
            </CartPreview>
            {user ? (
              <UserMenu>
                <Button variant="outline" size="icon" className={navTone.iconButton} title="Profile">
                  <User size={18} />
                </Button>
              </UserMenu>
            ) : (
              <Link className={`inline-flex h-10 items-center rounded-full px-5 text-sm font-bold transition ${heroMode ? "bg-white/14 text-white hover:bg-white/20" : "bg-primary text-primary-foreground hover:bg-primary/90"}`} to="/auth">
                Login
              </Link>
            )}
          </div>

          <button className={`inline-flex h-11 w-11 items-center justify-center rounded-full border md:hidden ${navTone.iconButton}`} onClick={() => setOpen((current) => !current)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className={`border-t ${navTone.mobile}`}>
            <div className="section grid gap-2 py-4">
              {primaryNav.map(([label, to]) => (
                <Link key={label} to={to} className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] hover:bg-white/10">
                  {label}
                </Link>
              ))}
              <Link to="/products?wishlist=1" className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] hover:bg-white/10">Wishlist</Link>
              <Link to="/cart" className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] hover:bg-white/10">Cart</Link>
              <Link to={user ? "/profile" : "/auth"} className="rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] hover:bg-white/10">
                {user ? "Profile" : "Login"}
              </Link>
            </div>
          </div>
        )}
      </header>

      {!isHome && <div className="pt-24"><MegaNav /></div>}
      <main className={isHome ? "" : ""}>
        <Outlet />
      </main>
      <MiniCartDrawer />
      <Footer />
    </div>
  );
}
