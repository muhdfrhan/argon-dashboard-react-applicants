// src/components/Sidebar/ApplicantSidebar.js
import React from "react";
import { NavLink as RRNavLink, useNavigate } from "react-router-dom";
import {
  Nav,
  NavItem,
  NavLink,
  Navbar,
  Container,
  Collapse,
} from "reactstrap";
import zakatLogo from "assets/img/zakat-logo.png";

const ApplicantSidebar = () => {
  const navigate = useNavigate();

  // Handler for the logout action
  const handleLogout = (e) => {
    e.preventDefault(); // Prevent the link from navigating anywhere
    localStorage.clear(); // Clear all stored data (token, username, role)
    // NOTE: Adjust '/auth/applicant-login' to your actual applicant login route
    navigate("/auth/applicant-login"); 
  };

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
    >
      <Container fluid>
        {/* Zakat Logo */}
        <img
          src={zakatLogo}
          alt="Zakat Logo"
          className="img-fluid d-block mx-auto my-3"
          style={{ maxWidth: "120px", height: "auto" }}
        />
        <Collapse navbar isOpen={true}>
          {/* Main Navigation */}
          <Nav navbar>
            <NavItem>
              <NavLink to="/applicant/dashboard" tag={RRNavLink}>
                <i className="ni ni-tv-2 text-primary" /> Dashboard
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/applicant/apply" tag={RRNavLink}>
                <i className="ni ni-fat-add text-success" /> Apply for Aid
              </NavLink>
            </NavItem>
            <NavItem>
              {/* Corrected path for My Application */}
              <NavLink to="/applicant/my-application" tag={RRNavLink}>
                <i className="ni ni-bullet-list-67 text-info" /> My Application
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/applicant/profile" tag={RRNavLink}>
                <i className="ni ni-single-02 text-yellow" /> My Profile
              </NavLink>
            </NavItem>
          </Nav>

          {/* Divider */}
          <hr className="my-3" />
          
          {/* Logout Navigation */}
          <Nav navbar>
            <NavItem>
              {/* Changed to a clickable link that triggers a function */}
              <NavLink href="#" onClick={handleLogout} style={{cursor: 'pointer'}}>
                <i className="ni ni-user-run text-danger" /> Logout
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

export default ApplicantSidebar;