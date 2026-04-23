import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorBox from "../components/ErrorBox.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", first_name: "", last_name: "" });
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const navigate = useNavigate();
  async function submit(e) {
    e.preventDefault(); setError("");
    try {
      if (mode === "login") await login({ username: form.username, password: form.password });
      else await register(form);
      navigate("/products");
    } catch (e) {
      setError(e.response?.data?.detail || Object.values(e.response?.data || {})?.[0]?.[0] || "Authentication failed.");
    }
  }
  return (
    <section className="section flex min-h-[70vh] items-center justify-center py-8">
      <form className="panel w-full max-w-md p-6" onSubmit={submit}>
        <h1 className="text-3xl font-black">{mode === "login" ? "Login" : "Create account"}</h1>
        <ErrorBox message={error} />
        <div className="mt-5 grid gap-3">
          <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          {mode === "register" && <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />}
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <button className="btn-primary">{mode === "login" ? "Login" : "Register"}</button>
          <button className="btn-ghost" type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Need an account?" : "Already registered?"}</button>
        </div>
      </form>
    </section>
  );
}
