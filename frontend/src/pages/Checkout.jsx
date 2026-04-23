import { CreditCard, Home, Loader2, MapPin, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import api from "../api/client.js";
import CheckoutSteps from "../components/common/CheckoutSteps.jsx";
import CheckoutSummary from "../components/common/CheckoutSummary.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Checkout() {
  const { user } = useAuth();
  const { cart, loadCart } = useCart();
  const [shipping_address, setAddress] = useState(user?.address || "");
  const [contact, setContact] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const composedAddress = [shipping_address, city && `City: ${city}`, contact && `Phone: ${contact}`].filter(Boolean).join("\n");
      await api.post("/orders/", { shipping_address: composedAddress });
      await loadCart();
      const { data } = await api.post("/checkout/stripe/");
      window.location.href = data.checkout_url;
    } catch (e) {
      setError(e.response?.data?.detail || e.response?.data?.non_field_errors?.[0] || "Checkout failed.");
    } finally { setLoading(false); }
  }

  return (
    <section className="section py-8">
      <CheckoutSteps active={2} />
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Secure checkout</p>
        <h1 className="mt-2 text-4xl font-black">Shipping and payment</h1>
        <p className="mt-2 text-muted-foreground">Confirm delivery details before redirecting to Stripe test checkout.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <form className="grid gap-5" onSubmit={submit}>
          <ErrorBox message={error} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><User size={20} /> Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <input className="input" value={user?.email || ""} disabled aria-label="Email" />
              <input className="input" placeholder="Phone number" value={contact} onChange={(e) => setContact(e.target.value)} required />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><MapPin size={20} /> Delivery address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <textarea className="input min-h-32" required placeholder="House, road, area, landmark" value={shipping_address} onChange={(e) => setAddress(e.target.value)} />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="input" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <input className="input" placeholder="Country" value={user?.country || ""} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><CreditCard size={20} /> Payment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                You will be redirected to Stripe Checkout in test mode after order creation.
              </div>
              <Button className="w-full sm:w-fit" disabled={loading || cart.items.length === 0}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                {loading ? "Processing..." : "Pay with Stripe"}
              </Button>
            </CardContent>
          </Card>
        </form>

        <div className="grid h-fit gap-4 lg:sticky lg:top-44">
          <CheckoutSummary items={cart.items} total={cart.total} />
          <Card>
            <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
              <Home className="mt-0.5 text-primary" size={18} />
              <span>Use a complete address to reduce delivery issues and failed order follow-up.</span>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
