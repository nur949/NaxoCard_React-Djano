import { Camera, KeyRound, Mail, Phone, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import api, { mediaUrl } from "../api/client.js";
import ErrorBox from "../components/ErrorBox.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, loadProfile } = useAuth();
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", avatar: null });
  const [password, setPassword] = useState({ current_password: "", new_password: "" });
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
      avatar: null,
    });
  }, [user]);

  useEffect(() => {
    api.get("/orders/").then(({ data }) => setOrders(data.results || data)).catch(() => {});
  }, []);

  async function submitProfile(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const payload = new FormData();
      payload.append("first_name", form.first_name);
      payload.append("last_name", form.last_name);
      payload.append("phone", form.phone);
      if (form.avatar) payload.append("avatar", form.avatar);
      await api.patch("/auth/profile/", payload, { headers: { "Content-Type": "multipart/form-data" } });
      await loadProfile();
      setMessage("Profile updated.");
    } catch {
      setError("Profile update failed.");
    }
  }

  async function submitPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/auth/password/", password);
      setPassword({ current_password: "", new_password: "" });
      setMessage("Password updated.");
    } catch (e) {
      setError(e.response?.data?.current_password?.[0] || e.response?.data?.new_password?.[0] || "Password update failed.");
    }
  }

  return (
    <section className="section py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black">My profile</h1>
        <p className="mt-2 text-muted-foreground">Simple account settings and order history.</p>
      </div>

      <ErrorBox message={error} />
      {message && <div className="mb-4 rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</div>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="mb-5 flex items-center gap-4">
                <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-muted">
                  {user?.avatar ? <img className="h-full w-full object-cover" src={mediaUrl(user.avatar)} alt={user.username} /> : <UserRound size={34} className="text-muted-foreground" />}
                </div>
                <div>
                  <p className="text-lg font-black">{`${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.username}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <form className="grid gap-4" onSubmit={submitProfile}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="input" placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                  <input className="input" placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                  <div className="relative sm:col-span-2">
                    <Mail className="pointer-events-none absolute left-3 top-3 text-muted-foreground" size={16} />
                    <input className="input pl-9" value={user?.email || ""} disabled />
                  </div>
                  <div className="relative sm:col-span-2">
                    <Phone className="pointer-events-none absolute left-3 top-3 text-muted-foreground" size={16} />
                    <input className="input pl-9" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold text-muted-foreground sm:col-span-2">
                    <Camera size={16} />
                    <span>Upload avatar</span>
                    <input className="ml-auto" type="file" accept="image/*" onChange={(e) => setForm({ ...form, avatar: e.target.files?.[0] || null })} />
                  </label>
                </div>
                <Button className="w-fit">Save changes</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <KeyRound size={18} className="text-primary" />
                <h2 className="text-xl font-black">Change password</h2>
              </div>
              <form className="grid gap-3 sm:max-w-lg" onSubmit={submitPassword}>
                <input className="input" type="password" placeholder="Current password" value={password.current_password} onChange={(e) => setPassword({ ...password, current_password: e.target.value })} required />
                <input className="input" type="password" placeholder="New password" value={password.new_password} onChange={(e) => setPassword({ ...password, new_password: e.target.value })} required />
                <Button className="w-fit">Update password</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardContent className="p-6">
            <h2 className="text-xl font-black">Order history</h2>
            <div className="mt-4 grid gap-3">
              {orders.map((order) => (
                <div className="rounded-lg border p-4" key={order.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">Order #{order.id}</span>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold capitalize">{order.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                    {order.items.map((item) => <span key={item.id}>{item.product_name}</span>)}
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
