import { ArrowRight, BadgePercent, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button.jsx";
import { Card } from "../ui/card.jsx";

export default function PromoBanners() {
  return (
    <section className="section grid gap-5 py-8 lg:grid-cols-2">
      <Card className="overflow-hidden bg-secondary text-secondary-foreground">
        <div className="grid items-center gap-5 p-6 sm:grid-cols-[1fr_180px]">
          <div>
            <BadgePercent className="mb-4 text-accent" />
            <h2 className="text-2xl">Fresh sneaker and sandal drops</h2>
            <p className="mt-2 text-sm text-secondary-foreground/75">Save more on bestselling shoes, comfort pairs, and weekly new arrivals.</p>
            <Button asChild className="mt-5" variant="secondary"><Link to="/products">Explore deals <ArrowRight size={16} /></Link></Button>
          </div>
          <div className="flex h-40 w-full items-center justify-center rounded-md bg-white/80 p-4">
            <img className="h-full w-full object-contain" src="https://pngimg.com/d/running_shoes_PNG5817.png" alt="Featured sneaker" loading="lazy" />
          </div>
        </div>
      </Card>
      <Card className="overflow-hidden">
        <div className="grid items-center gap-5 p-6 sm:grid-cols-[1fr_180px]">
          <div>
            <ShieldCheck className="mb-4 text-primary" />
            <h2 className="text-2xl">Choose size, color, and order faster</h2>
            <p className="mt-2 text-sm text-muted-foreground">Transparent PNG shoe galleries, color-wise images, guest checkout, and clear returns.</p>
            <Button asChild className="mt-5" variant="outline"><Link to="/products">Start shopping <ArrowRight size={16} /></Link></Button>
          </div>
          <div className="flex h-40 w-full items-center justify-center rounded-md bg-muted/60 p-4">
            <img className="h-full w-full object-contain" src="https://pngimg.com/d/shoes_PNG7493.png" alt="Shoe product preview" loading="lazy" />
          </div>
        </div>
      </Card>
    </section>
  );
}
