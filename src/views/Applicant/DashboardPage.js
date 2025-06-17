// src/views/Applicant/Dashboard.js
import React from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const ApplicantDashboard = () => {
  const applicantName = localStorage.getItem("ApplicantName") || localStorage.getItem("username") || "Applicant";
  const navigate = useNavigate();

  return (
    <Container className="mt-5" fluid>
      <Row className="justify-content-center mb-5">
        <Col lg="10">
          <Card className="shadow-lg border-0">
            <CardBody className="p-lg-5 text-center">
              <h1 className="text-primary mb-3">
                Assalamualaikum, {applicantName}!
              </h1>
              <p className="lead text-muted">
                Welcome to the Zakat Applicant Portal.
              </p>
              <hr className="my-4" />
              <p>
                This portal allows you to apply for Zakat aid and track the
                status of your application.
              </p>
              <p>
                To begin a new application, please proceed to the "Apply for Aid" section.
              </p>
              <Button
                color="primary"
                size="lg"
                onClick={() => navigate("/applicant/apply")}
                className="mt-3"
              >
                Get Started
              </Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ApplicantDashboard;