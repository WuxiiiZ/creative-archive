import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@chinese-fonts/yozai/dist/Yozai-Medium/result.css";
import "./index.css";
import App from "./App.tsx";
import { ErrorBoundary } from "./reusableUI/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
