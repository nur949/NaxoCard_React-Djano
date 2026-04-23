import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "./AuthContext.jsx";
import { useToast } from "./ToastContext.jsx";

const CartContext = createContext(null);

const emptyCart = { items: [], total: "0.00" };
const CART_SYNC_KEY = "myshop:cart-sync";
const CART_SYNC_INTERVAL = 15000;

function recalc(cart) {
  const total = cart.items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0);
  return {
    ...cart,
    total: total.toFixed(2),
    items: cart.items.map((item) => ({
      ...item,
      subtotal: (Number(item.product.price || 0) * item.quantity).toFixed(2),
    })),
  };
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pendingRef = useRef(new Set());
  const updateTimersRef = useRef({});
  const channelRef = useRef(null);

  const loadCart = useCallback(async ({ silent = false } = {}) => {
    if (!user) {
      setCart(emptyCart);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get("/cart/");
      setCart(data);
    } catch {
      if (!silent) pushToast("Cart could not be synced.", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [pushToast, user]);

  useEffect(() => { loadCart(); }, [loadCart]);

  const broadcastCartSync = useCallback((source = "local") => {
    const payload = { source, at: Date.now() };
    try {
      localStorage.setItem(CART_SYNC_KEY, JSON.stringify(payload));
      channelRef.current?.postMessage(payload);
    } catch {
      // localStorage or BroadcastChannel can be unavailable in private contexts.
    }
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel("myshop-cart");
      channelRef.current.onmessage = () => loadCart({ silent: true });
    }

    const onStorage = (event) => {
      if (event.key === CART_SYNC_KEY) loadCart({ silent: true });
    };
    const onFocus = () => loadCart({ silent: true });
    const onOnline = () => loadCart({ silent: true });
    const onVisibility = () => {
      if (document.visibilityState === "visible") loadCart({ silent: true });
    };
    const onApiMutation = (event) => {
      const url = event.detail?.url || "";
      if (url.startsWith("/cart") || url.includes("/cart/") || url.startsWith("/orders")) {
        loadCart({ silent: true });
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);
    window.addEventListener("myshop:api-mutated", onApiMutation);
    document.addEventListener("visibilitychange", onVisibility);
    const interval = window.setInterval(() => loadCart({ silent: true }), CART_SYNC_INTERVAL);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("myshop:api-mutated", onApiMutation);
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(interval);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [loadCart, user]);

  async function add(productId, quantity = 1, product = null) {
    if (!user) {
      pushToast("Login required to add items to cart.", "error");
      return false;
    }
    if (pendingRef.current.has(`add-${productId}`)) return false;
    pendingRef.current.add(`add-${productId}`);

    const previous = cart;
    if (product) {
      setCart((current) => {
        const existing = current.items.find((item) => item.product.id === productId);
        if (existing) {
          return recalc({ ...current, items: current.items.map((item) => item.product.id === productId ? { ...item, quantity: item.quantity + quantity } : item) });
        }
        return recalc({
          ...current,
          items: [{ id: `temp-${productId}`, product, quantity, subtotal: product.price }, ...current.items],
        });
      });
    }
    setDrawerOpen(true);

    try {
      const { data } = await api.post("/cart/add/", { product_id: productId, quantity });
      setCart(data);
      broadcastCartSync("add");
      pushToast(`${product?.name || "Product"} added to cart.`);
      return true;
    } catch (error) {
      setCart(previous);
      pushToast(error.response?.data?.detail || "Could not add item to cart.", "error");
      return false;
    } finally {
      pendingRef.current.delete(`add-${productId}`);
    }
  }

  async function update(itemId, quantity) {
    if (quantity < 1) return false;
    const previous = cart;
    setCart((current) => recalc({ ...current, items: current.items.map((item) => item.id === itemId ? { ...item, quantity } : item) }));

    if (updateTimersRef.current[itemId]) {
      window.clearTimeout(updateTimersRef.current[itemId]);
    }

    updateTimersRef.current[itemId] = window.setTimeout(async () => {
      pendingRef.current.add(`update-${itemId}`);
      try {
        const { data } = await api.post(`/cart/items/${itemId}/set/`, { quantity });
        setCart(data);
        broadcastCartSync("update");
      } catch (error) {
        setCart(previous);
        pushToast(error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || "Quantity update failed.", "error");
      } finally {
        pendingRef.current.delete(`update-${itemId}`);
        delete updateTimersRef.current[itemId];
      }
    }, 180);

    return true;
  }

  async function remove(itemId) {
    if (pendingRef.current.has(`remove-${itemId}`)) return false;
    pendingRef.current.add(`remove-${itemId}`);
    const previous = cart;
    setCart((current) => recalc({ ...current, items: current.items.filter((item) => item.id !== itemId) }));

    try {
      const { data } = await api.delete(`/cart/items/${itemId}/`);
      setCart(data);
      broadcastCartSync("remove");
      pushToast("Item removed from cart.");
      return true;
    } catch {
      setCart(previous);
      pushToast("Could not remove item.", "error");
      return false;
    } finally {
      pendingRef.current.delete(`remove-${itemId}`);
    }
  }

  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(() => ({
    cart,
    loading,
    count,
    drawerOpen,
    setDrawerOpen,
    loadCart,
    add,
    update,
    remove,
  }), [cart, loading, count, drawerOpen, loadCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
