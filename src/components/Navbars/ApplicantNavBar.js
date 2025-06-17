// src/components/Navbars/ApplicantNavBar.js
import React from "react";
import { Navbar, Container } from "reactstrap";

const ApplicantNavbar = () => {
  const username = localStorage.getItem("username") || "Applicant";

  return (
    <Navbar className="navbar-top navbar-light bg-primary" expand="md">
      <Container fluid>
        <h4 className="mb-0 text-white">{username}</h4>
      </Container>
    </Navbar>
  );
};

export default ApplicantNavbar;