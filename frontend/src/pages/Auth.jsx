import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthInput from "../components/auth/AuthInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
};

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const isRegister = mode === "register";

  const content = useMemo(
    () => ({
      title: isRegister ? "Create account" : "Login",
      button: isRegister ? "Create account" : "Login",
      switchLabel: isRegister ? "Already have an account?" : "Need an account?",
      switchAction: isRegister ? "Login" : "Register",
    }),
    [isRegister]
  );

  function validateField(name, value) {
    if (name === "email") {
      if (!value.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email.";
    }
    if (name === "username" && !value.trim()) return "Username is required.";
    if (name === "password" && !value.trim()) return "Password is required.";
    if (isRegister && (name === "first_name" || name === "last_name") && !value.trim()) {
      return "Required.";
    }
    return "";
  }

  function handleChange(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
    setServerError("");
  }

  function validateForm() {
    const nextErrors = {};
    ["username", "password", ...(isRegister ? ["email", "first_name", "last_name"] : [])].forEach((field) => {
      const message = validateField(field, form[field]);
      if (message) nextErrors[field] = message;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      if (isRegister) await register(form);
      else await login({ username: form.username, password: form.password });
      navigate("/products");
    } catch (error) {
      setServerError(
        error.response?.data?.detail ||
          Object.values(error.response?.data || {})?.[0]?.[0] ||
          "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section flex min-h-[80vh] items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-soft sm:p-8"
      >
        <h1 className="text-3xl font-black text-foreground">{content.title}</h1>

        {serverError && (
          <div className="mt-4 rounded-xl border border-rose-300/50 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-200">
            {serverError}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 grid gap-4" noValidate>
          <AuthInput
            id="auth-username"
            label="Username"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            onBlur={(e) => handleChange("username", e.target.value)}
            error={errors.username}
            required
          />

          {isRegister && (
            <>
              <AuthInput
                id="auth-first-name"
                label="First name"
                value={form.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                onBlur={(e) => handleChange("first_name", e.target.value)}
                error={errors.first_name}
                required
              />
              <AuthInput
                id="auth-last-name"
                label="Last name"
                value={form.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                onBlur={(e) => handleChange("last_name", e.target.value)}
                error={errors.last_name}
                required
              />
              <AuthInput
                id="auth-email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                onBlur={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                required
              />
            </>
          )}

          <AuthInput
            id="auth-password"
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={(e) => handleChange("password", e.target.value)}
            error={errors.password}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
          >
            {loading ? "Please wait..." : content.button}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          {content.switchLabel}
          <button
            type="button"
            onClick={() => {
              setMode((current) => (current === "login" ? "register" : "login"));
              setErrors({});
              setServerError("");
            }}
            className="ml-2 font-semibold text-primary"
          >
            {content.switchAction}
          </button>
        </div>
      </motion.div>
    </section>
  );
}
