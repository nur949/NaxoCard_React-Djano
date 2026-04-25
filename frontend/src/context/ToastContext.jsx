import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { X } from "lucide-react";

const ToastContext = createContext(null);
const defaultToastContext = {
  pushToast: () => {},
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, type = "success") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[80] grid w-[calc(100vw-2rem)] max-w-sm gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-fade-in rounded-lg border bg-card p-4 text-sm shadow-premium ${toast.type === "error" ? "border-destructive/30 text-destructive" : "border-primary/25 text-foreground"}`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <span>{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} aria-label="Dismiss notification"><X size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext) || defaultToastContext;
