// src/App.jsx
import React from "react";
import AllRoutes from "./routes/AllRoutes";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <AllRoutes />
    </AuthProvider>
  );
};

export default App;
