import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./store/store";
import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);
