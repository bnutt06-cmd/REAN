import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import AdminApp from "./admin/AdminApp.jsx";

// Simple path-based switch: /admin loads the admin area, everything else
// loads the public site. Keeps the no-router setup while giving the admin
// its own URL. On Vercel, add a rewrite so /admin serves index.html
// (see vercel.json).
const isAdmin = window.location.pathname.replace(/\/$/, "") === "/admin";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdmin ? <AdminApp /> : <App />}
  </React.StrictMode>
);
