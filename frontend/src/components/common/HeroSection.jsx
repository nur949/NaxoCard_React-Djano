import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button.jsx";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f8f9fa,#edf4ff)]">
      <div className="section grid min-h-[520px] items-center gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 max-w-xl animate-fade-in">
          <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-primary">NaxoCard eCommerce</p>
          <h1 className="text-5xl font-black leading-none text-foreground sm:text-7xl">Modern Shopping Experience</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            A clean Material UI storefront with fast discovery, live cart updates, loyalty, checkout, and admin operations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/products">Shop now <ArrowRight size={18} /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/products?search=Best Seller">Best seller</Link></Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -left-6 top-8 h-28 w-28 rounded-full bg-primary/15" />
          <div className="absolute -right-4 bottom-10 h-40 w-40 rounded-full bg-accent/20" />
          <img
            className="relative h-[470px] w-full rounded-lg object-cover object-center shadow-premium"
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=85"
            alt="Featured footwear campaign"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
