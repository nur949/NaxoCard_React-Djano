import { Heart, MapPin, Menu, Phone, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import CartPreview from "./common/CartPreview.jsx";
import Footer from "./common/Footer.jsx";
import MegaNav from "./common/MegaNav.jsx";
import MiniCartDrawer from "./common/MiniCartDrawer.jsx";
import SearchBox from "./common/SearchBox.jsx";
import ThemeToggle from "./common/ThemeToggle.jsx";
import UserMenu from "./common/UserMenu.jsx";
import { Button } from "./ui/button.jsx";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { count } = useCart();
  const nav = [
    ["Shop", "/products"],
    ["Orders", "/orders"],
    ...(user?.is_staff ? [["Admin", "/admin"]] : []),
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-background/95 shadow-sm backdrop-blur-xl">
        <div className="hidden border-b bg-muted/60 py-2 text-muted-foreground md:block">
          <div className="section flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1"><MapPin size={14} /> Find A Store</span>
              <span className="inline-flex items-center gap-1"><Phone size={14} /> Customer care: 09666200300</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/products?wishlist=1" className="hover:text-primary">My Wishlists</Link>
              <Link to="/orders" className="hover:text-primary">Track Order</Link>
            </div>
          </div>
        </div>
        <div className="section grid min-h-20 grid-cols-[auto_1fr_auto] items-center gap-4 py-3">
          <div className="hidden md:block">
            <SearchBox />
          </div>
          <Link to="/" className="justify-self-start text-3xl font-black tracking-tight text-primary md:justify-self-center">NaxoCard</Link>
          <nav className="hidden items-center gap-6 md:hidden">
            {nav.map(([label, to]) => <NavLink key={to} to={to} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{label}</NavLink>)}
          </nav>
          <div className="hidden items-center justify-end gap-2 md:flex">
            <ThemeToggle />
            <Button asChild variant="outline" size="icon" title="Wishlist"><Link to="/products?wishlist=1"><Heart size={18} /></Link></Button>
            <CartPreview>
              <Button variant="outline" size="icon" className="relative" title="Cart">
                <ShoppingCart size={18} />{count > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-accent px-1.5 text-xs text-accent-foreground">{count}</span>}
              </Button>
            </CartPreview>
            {user ? (
              <UserMenu><Button variant="outline" size="icon" title="Profile"><User size={18} /></Button></UserMenu>
            ) : <Link className="btn-primary" to="/auth">Login</Link>}
          </div>
          <button className="btn-ghost px-3 md:hidden" onClick={() => setOpen(!open)}><Menu size={20} /></button>
        </div>
        <MegaNav />
        {open && <div className="section grid gap-3 pb-4 md:hidden"><SearchBox compact />{[...nav, ["Cart", "/cart"], [user ? "Profile" : "Login", user ? "/profile" : "/auth"]].map(([l, t]) => <Link key={t} to={t} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold hover:bg-muted">{l}</Link>)}</div>}
      </header>
      <main><Outlet /></main>
      <MiniCartDrawer />
      <Footer />
    </div>
  );
}
