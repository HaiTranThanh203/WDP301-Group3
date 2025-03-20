import React from "react";
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <div className="App">
      <ToastContainer />
      <AppRoutes />
    </div>
  );
}

export default App;
