import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import DriverDashboard from "./DriverDashboard.jsx";
import "./index.css";

const isDriverRoute = window.location.hash === "#/driver";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isDriverRoute ? <DriverDashboard /> : <App />}
  </React.StrictMode>
);
