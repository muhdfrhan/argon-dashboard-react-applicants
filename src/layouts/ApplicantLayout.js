// src/layouts/ApplicantLayout.js
import React from "react";
import { Outlet } from "react-router-dom";
import ApplicantNavbar from "../components/Navbars/ApplicantNavBar"; // Note the path
import ApplicantSidebar from "../components/Sidebar/ApplicantSideBar"; // Note the path
import { Container, Row, Col } from "reactstrap";

const ApplicantLayout = () => {
  return (
    <>
      <ApplicantSidebar />
      <div className="main-content">
        <ApplicantNavbar />
        <Container fluid className="mt-4">
          <Row>
            <Col>
              <Outlet /> {/* Renders nested views like ApplicantDashboard */}
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default ApplicantLayout;