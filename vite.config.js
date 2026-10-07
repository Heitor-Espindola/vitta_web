import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  test: {
    include: ["src/**/*.test.{js,jsx}"],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
});
