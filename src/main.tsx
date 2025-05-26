import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/tabs-fix.css";
import App from "./App.tsx";

// Add this meta tag to ensure proper scaling
const updateViewportMeta = () => {
  // Check if viewport meta exists
  let viewport = document.querySelector('meta[name="viewport"]');

  // Create it if it doesn't exist
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }

  // Set the content with fixed width and proper scaling
  viewport.setAttribute('content',
    'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

// Apply meta tag updates
updateViewportMeta();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
