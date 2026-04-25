import { Star } from "lucide-react";
import { Card } from "../ui/card.jsx";

const testimonials = [
  ["Clean storefront, fast cart, and checkout was simple for ordering shoes.", "Ari, repeat buyer"],
  ["Color-wise images made it easy to compare pairs before buying.", "Mina, lifestyle shopper"],
  ["Size selection and delivery flow felt straightforward and reliable.", "Sam, sneaker buyer"],
];

export default function Testimonials() {
  return (
    <section className="section py-12">
      <div className="mb-6">
        <h2>Trusted by modern shoppers</h2>
        <p className="mt-2 text-muted-foreground">Quiet UX, fast decisions, fewer abandoned carts.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map(([quote, person]) => (
          <Card key={person} className="p-5">
            <div className="mb-4 flex gap-1 text-accent">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={15} fill="currentColor" />)}</div>
            <p className="text-sm leading-6">{quote}</p>
            <p className="mt-4 text-sm font-semibold text-muted-foreground">{person}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
