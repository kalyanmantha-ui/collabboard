import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// dedupe keeps the app and paper-ui on one copy of React; two copies break hooks
export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ["react", "react-dom"] },
});
