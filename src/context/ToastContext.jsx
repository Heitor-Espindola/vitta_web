import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

const ToastContext = createContext(null);
let toastSequence = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, tone = "info" }) => {
      const id = ++toastSequence;
      setToasts((current) => [...current, { id, title, message, tone }]);
      window.setTimeout(() => dismiss(id), 5000);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast, dismiss }), [showToast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-label="Avisos">
        {toasts.map((toast) => {
          const Icon =
            toast.tone === "success"
              ? CheckCircle2
              : toast.tone === "error"
                ? CircleAlert
                : Info;
          return (
            <div className={`toast toast--${toast.tone}`} key={toast.id}>
              <Icon aria-hidden="true" size={20} />
              <div>
                <strong>{toast.title}</strong>
                {toast.message ? <p>{toast.message}</p> : null}
              </div>
              <button
                className="icon-button icon-button--small"
                onClick={() => dismiss(toast.id)}
                aria-label="Fechar aviso"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de ToastProvider.");
  }
  return context;
}
