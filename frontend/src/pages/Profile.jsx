import { Award, Heart, KeyRound, MapPin, Package, User } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/client.js";
import ErrorBox from "../components/ErrorBox.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const tabs = [
  ["loyalty", Award, "Loyalty"],
  ["profile", User, "Profile"],
  ["orders", Package, "Orders"],
  ["wishlist", Heart, "Wishlist"],
  ["security", KeyRound, "Security"],
];

export default function Profile() {
  const { user, loadProfile } = useAuth();
  const [active, setActive] = useState("profile");
  const [form, setForm] = useState({});
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loyalty, setLoyalty] = useState({ summary: null, transactions: [] });
  const [password, setPassword] = useState({ current_password: "", new_password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setForm(user || {}), [user]);
  useEffect(() => {
    api.get("/orders/").then(({ data }) => setOrders(data.results || data)).catch(() => {});
    api.get("/products/wishlist_items/").then(({ data }) => setWishlist(data.results || data)).catch(() => {});
    api.get("/auth/loyalty/").then(({ data }) => setLoyalty(data)).catch(() => {});
  }, []);

  async function submitProfile(e) {
    e.preventDefault(); setError(""); setMessage("");
    try { await api.patch("/auth/profile/", form); await loadProfile(); setMessage("Profile updated."); }
    catch { setError("Profile update failed."); }
  }

  async function submitPassword(e) {
    e.preventDefault(); setError(""); setMessage("");
    try { await api.post("/auth/password/", password); setPassword({ current_password: "", new_password: "" }); setMessage("Password updated."); }
    catch (e) { setError(e.response?.data?.current_password?.[0] || e.response?.data?.new_password?.[0] || "Password update failed."); }
  }

  return (
    <section className="section py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">Profile dashboard</h1>
        <p className="mt-2 text-muted-foreground">Manage account details, addresses, orders, wishlist, and security.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit p-3">
          {tabs.map(([id, Icon, label]) => (
            <button key={id} className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${active === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setActive(id)}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </Card>

        <div>
          <ErrorBox message={error} />
          {message && <div className="mb-4 rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</div>}

          {active === "loyalty" && (
            <div className="grid gap-5">
              <Card className="overflow-hidden">
                <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_280px]">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">MyShop Rewards</p>
                    <h2 className="mt-2 text-3xl font-black capitalize">{loyalty.summary?.loyalty_tier || user?.loyalty_tier || "bronze"} member</h2>
                    <p className="mt-2 text-muted-foreground">Earn 1 point per dollar spent. Points are added automatically after checkout.</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-muted p-4"><p className="text-sm text-muted-foreground">Available</p><p className="text-2xl font-black">{loyalty.summary?.loyalty_points ?? user?.loyalty_points ?? 0}</p></div>
                      <div className="rounded-lg bg-muted p-4"><p className="text-sm text-muted-foreground">Lifetime</p><p className="text-2xl font-black">{loyalty.summary?.lifetime_points ?? user?.lifetime_points ?? 0}</p></div>
                      <div className="rounded-lg bg-muted p-4"><p className="text-sm text-muted-foreground">Next tier</p><p className="text-2xl font-black">{loyalty.summary?.next_tier_points ?? user?.next_tier_points ?? 0}</p></div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-primary p-5 text-primary-foreground">
                    <Award size={32} />
                    <p className="mt-4 text-sm opacity-80">Member perks</p>
                    <ul className="mt-3 grid gap-2 text-sm font-semibold">
                      <li>Early access campaigns</li>
                      <li>Reward point balance</li>
                      <li>Tier-based customer care</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl">Recent loyalty activity</h2>
                  <div className="mt-4 grid gap-3">
                    {loyalty.transactions.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="font-semibold">{item.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
                        </div>
                        <span className={item.points >= 0 ? "font-black text-primary" : "font-black text-destructive"}>{item.points >= 0 ? "+" : ""}{item.points}</span>
                      </div>
                    ))}
                    {loyalty.transactions.length === 0 && <p className="text-sm text-muted-foreground">No loyalty activity yet.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {active === "profile" && (
            <form className="panel p-6" onSubmit={submitProfile}>
              <h2 className="mb-5 flex items-center gap-2 text-2xl"><MapPin size={22} /> Account and address</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {["first_name", "last_name", "phone", "city", "postal_code", "country"].map((field) => <input key={field} className="input" placeholder={field.replace("_", " ")} value={form[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />)}
                <textarea className="input min-h-28 sm:col-span-2" placeholder="Address" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Button className="mt-5">Save profile</Button>
            </form>
          )}

          {active === "orders" && (
            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap justify-between gap-3">
                      <strong>Order #{order.id}</strong>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold capitalize">{order.status}</span>
                      <strong className="text-primary">${order.total}</strong>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {orders.length === 0 && <Card className="p-6 text-muted-foreground">No orders yet.</Card>}
            </div>
          )}

          {active === "wishlist" && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {wishlist.map((product) => <ProductCard key={product.id} product={product} />)}
              {wishlist.length === 0 && <Card className="p-6 text-muted-foreground sm:col-span-2">Your wishlist is empty.</Card>}
            </div>
          )}

          {active === "security" && (
            <form className="panel max-w-lg p-6" onSubmit={submitPassword}>
              <h2 className="mb-5 text-2xl">Password</h2>
              <div className="grid gap-3">
                <input className="input" type="password" placeholder="Current password" value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} required />
                <input className="input" type="password" placeholder="New password" value={password.new_password} onChange={(e) => setPassword({ ...password, new_password: e.target.value })} required />
              </div>
              <Button className="mt-5">Update password</Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
