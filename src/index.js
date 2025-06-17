// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

// Import your route components
//import StaffRoutesComponent from "routes/staffRoutes"; 
import ApplicantRoutesComponent from "routes/ApplicantRoutes"; // <-- Your new applicant routes

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      
      
      {/* Applicant UI will be handled by its own set of routes */}
      <Route path="/applicant/*" element={<ApplicantRoutesComponent />} />
      
      {/* Optional: a default route to redirect users */}
      <Route path="*" element={<Navigate to="/applicant/login" replace />} />
    </Routes>
  </BrowserRouter>
);