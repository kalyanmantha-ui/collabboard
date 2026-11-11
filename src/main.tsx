import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "paper-ui/style.css";
import "./styles.css";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import { useTheme } from "./lib/theme";
import { initDirection } from "./lib/direction";

initDirection();

function ThemeBoot() {
  useTheme();
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeBoot />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
