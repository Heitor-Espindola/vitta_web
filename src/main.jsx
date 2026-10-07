import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { AppearanceProvider } from "./context/AppearanceContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AppearanceProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </AppearanceProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
