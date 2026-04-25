import { Lock, PackageCheck, Truck } from "lucide-react";
import { productImage } from "../../api/client.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";

export default function CheckoutSummary({ items = [], total = "0.00" }) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {items.map((item) => (
          <div className="flex gap-3 text-sm" key={item.id}>
            <img className="h-14 w-14 rounded-md bg-white object-contain" src={productImage(item.product, "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80")} alt={item.product.name} />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 font-semibold">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
            </div>
            <span className="font-bold">Tk {item.subtotal}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-3 font-black">
          <span>Total</span>
          <span className="text-primary">Tk {total}</span>
        </div>
        <div className="grid gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><Lock size={14} /> Guest checkout supported</span>
          <span className="flex items-center gap-2"><Truck size={14} /> Delivery status tracked after order</span>
          <span className="flex items-center gap-2"><PackageCheck size={14} /> Cash on delivery available</span>
        </div>
      </CardContent>
    </Card>
  );
}
