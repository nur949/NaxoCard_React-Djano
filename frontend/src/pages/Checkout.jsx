import { Banknote, CreditCard, Home, Loader2, MapPin, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import CheckoutSteps from "../components/common/CheckoutSteps.jsx";
import CheckoutSummary from "../components/common/CheckoutSummary.jsx";
import ErrorBox from "../components/ErrorBox.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clear } = useCart();
  const [guestName, setGuestName] = useState(user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "");
  const [email, setEmail] = useState(user?.email || "");
  const [shipping_address, setAddress] = useState(user?.address || "");
  const [contact, setContact] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "");
  const [country, setCountry] = useState(user?.country || "Bangladesh");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function applyCoupon() {
    setError("");
    try {
      const { data } = await api.post("/coupons/validate/", { code: couponCode, subtotal: cart.total });
      setCouponInfo(data);
    } catch (e) {
      setCouponInfo(null);
      setError(e.response?.data?.detail || "Coupon is invalid.");
    }
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const composedAddress = [
        shipping_address,
        city && `City: ${city}`,
        country && `Country: ${country}`,
      ].filter(Boolean).join("\n");
      const payload = {
        shipping_address: composedAddress,
        guest_name: guestName,
        guest_email: email,
        guest_phone: contact,
        payment_method: paymentMethod,
        coupon_code: couponInfo?.coupon?.code || couponCode,
        items_payload: cart.items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
      };
      const { data: order } = await api.post("/orders/", payload);

      if (paymentMethod === "stripe") {
        const { data } = await api.post("/checkout/stripe/");
        window.location.href = data.checkout_url;
        return;
      }

      clear();
      navigate(`/order-confirmation?payment=cod&order=${order.id}`);
    } catch (e) {
      setError(e.response?.data?.detail || e.response?.data?.non_field_errors?.[0] || "Checkout failed.");
    } finally { setLoading(false); }
  }

  return (
    <section className="section py-8">
      <CheckoutSteps active={2} />
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Easy checkout</p>
        <h1 className="mt-2 text-4xl font-black">Shipping and payment</h1>
        <p className="mt-2 text-muted-foreground">Fill in your details and place the order directly. No account is required for cash on delivery.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <form className="grid gap-5" onSubmit={submit}>
          <ErrorBox message={error} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><User size={20} /> Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="Full name" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
              <input className="input" placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                <input className="input" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl"><CreditCard size={20} /> Payment</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <input type="radio" name="payment-method" className="mt-1" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                  <span className="grid gap-1">
                    <span className="flex items-center gap-2 font-bold"><Banknote size={18} /> Cash on delivery</span>
                    <span className="text-sm text-muted-foreground">Order now, pay when the delivery arrives.</span>
                  </span>
                </label>
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${paymentMethod === "stripe" ? "border-primary bg-primary/5" : "border-border"} ${!user ? "opacity-60" : ""}`}>
                  <input type="radio" name="payment-method" className="mt-1" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} disabled={!user} />
                  <span className="grid gap-1">
                    <span className="flex items-center gap-2 font-bold"><CreditCard size={18} /> Stripe</span>
                    <span className="text-sm text-muted-foreground">{user ? "Pay online with Stripe test checkout." : "Stripe payment requires login."}</span>
                  </span>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input className="input" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                <Button type="button" variant="outline" onClick={applyCoupon}>Apply coupon</Button>
              </div>
              {couponInfo?.valid && <div className="rounded-md border border-primary/20 bg-primary/10 p-3 text-sm text-primary">Coupon applied. Discount: Tk {couponInfo.discount_amount}</div>}
              <div className="rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                {paymentMethod === "cod" ? "Cash on delivery is selected. We will save the order immediately after you submit." : "You will be redirected to Stripe Checkout after order creation."}
              </div>
              <Button className="w-full sm:w-fit" disabled={loading || cart.items.length === 0}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                {loading ? "Processing..." : paymentMethod === "cod" ? "Place order" : "Pay with Stripe"}
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
