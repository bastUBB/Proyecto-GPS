import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import Horario from "./pages/Horario.jsx";
import { BrowserRouter as Router } from "react-router-dom";
// import { extractSubjects } from '../scripts/extraccionExcel.js';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <App path="/horario" element={<Horario />} />
    </Router>
  </React.StrictMode>
)


// console.log(JSON.stringify(extractSubjects, null, 2));
