// src/routes/ApplicantRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import ApplicantLayout from "layouts/ApplicantLayout";
import ApplicantDashboard from "views/Applicant/DashboardPage";
import ApplicantLogin from "views/Applicant/Login";
import ApplicantLogout from "views/Applicant/Logout";
import ApplicantProfile from "views/Applicant/Profile";
import ApplyZakat from "views/Applicant/ApplyZakat";
import MyApplication from "views/Applicant/MyApplication";
import ApplicantRegister from "views/Applicant/Register";

const ApplicantRoutes = () => (
  <Routes>
    {/* Routes that use the ApplicantLayout (for authenticated applicants) */}
    <Route path="/" element={<ApplicantLayout />}>
      <Route index element={<ApplicantDashboard />} />
      <Route path="dashboard" element={<ApplicantDashboard />} />
      <Route path="profile" element={<ApplicantProfile />} />
      <Route path="apply" element={<ApplyZakat />} />
      <Route path="my-application" element={<MyApplication />} />
    </Route>

    {/* Standalone routes that do NOT use ApplicantLayout */}
    <Route path="login" element={<ApplicantLogin />} />
    <Route path="logout" element={<ApplicantLogout />} />
    <Route path="register" element={<ApplicantRegister />} />
  </Routes>
);

export default ApplicantRoutes;