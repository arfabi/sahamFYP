import React from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import "./index.css";

const root = document.getElementById("root") as HTMLElement;
createRoot(root).render(
  <>
    <App />
    <Analytics />
  </>
);