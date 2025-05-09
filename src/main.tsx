import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import "./utils/browserglobals/browserglobals.ts"; // Just import for side effects

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

createRoot(rootElement).render(<App />);
