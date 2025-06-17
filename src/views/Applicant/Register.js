// src/views/Applicant/Register.js
import React, { useState, useEffect } from "react";
import {
  Button, Card, CardHeader, CardBody, FormGroup, Form, Input,
  Container, Row, Col, Spinner, Alert
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { registerApplicant, getMaritalStatuses } from "../../apicall";

// ✅ NEW: Predefined list of major Malaysian banks for the dropdown
const malaysianBanks = [
  "Maybank",
  "CIMB Bank",
  "Public Bank Berhad",
  "RHB Bank",
  "Hong Leong Bank",
  "AmBank",
  "Bank Islam Malaysia Berhad",
  "Bank Simpanan Nasional (BSN)",
  "Bank Rakyat",
  "Affin Bank",
  "Alliance Bank",
  "Standard Chartered Bank Malaysia",
  "HSBC Bank Malaysia",
  "OCBC Bank Malaysia",
  "UOB Malaysia",
  "Other"
];

const ApplicantRegister = () => {
  // ✅ NEW: Add bankName and accountNumber to the form state
  const [formData, setFormData] = useState({
    fullName: '', nric: '', dateOfBirth: '', address: '', phone: '',
    salary: '', email: '', maritalStatusId: '', bankName: '', accountNumber: '',
    username: '', password: '', confirmPassword: ''
  });

  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statuses = await getMaritalStatuses();
        setMaritalStatuses(statuses);
      } catch (err) {
        setError('Could not load form data. Please refresh the page.');
      }
    };
    fetchStatuses();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Existing Validations ---
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a symbol (!@#$%^&*).");
    }
    const nricRegex = /^\d{6}-\d{2}-\d{4}$/;
    if (!nricRegex.test(formData.nric)) {
      return setError("NRIC must be in the format xxxxxx-xx-xxxx.");
    }
    const phoneRegex = /^\d{3}-\d{7,8}$/;
    if (!phoneRegex.test(formData.phone)) {
      return setError("Phone number must be in the format xxx-xxxxxxx or xxx-xxxxxxxx.");
    }

    // ✅ NEW: Bank Account Number Validation
    // This regex checks for 7 to 16 digits, which covers most Malaysian bank account lengths.
    const accountNumberRegex = /^\d{7,16}$/;
    if (!accountNumberRegex.test(formData.accountNumber)) {
      return setError("Bank account number must contain only digits and be between 7 and 16 characters long.");
    }

    setLoading(true);

    try {
      const dataToSubmit = { ...formData };
      delete dataToSubmit.confirmPassword;

      await registerApplicant(dataToSubmit);

      setSuccess("Registration successful! You will be redirected to the login page.");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Col lg="8" md="10">
        <Card className="card bg-secondary shadow" style={{ border: "2px solid #007bff" }}>
          <CardHeader className="bg-white pb-4">
            <h2 className="text-muted text-center">Applicant Registration</h2>
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-5">
            {error && <Alert color="danger">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}

            <Form role="form" onSubmit={handleSubmit}>
              <h6 className="heading-small text-muted mb-4">Personal & Financial Information</h6>
              <Row>
                <Col md="6"><FormGroup><label>Full Name</label><Input name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} required /></FormGroup></Col>
                <Col md="6"><FormGroup><label>NRIC</label><Input name="nric" type="text" value={formData.nric} onChange={handleInputChange} placeholder="eg: 900101-14-1234" required /></FormGroup></Col>
              </Row>
              <Row>
                 <Col md="6"><FormGroup><label>Date of Birth</label><Input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} required/></FormGroup></Col>
                <Col md="6"><FormGroup><label>Marital Status</label><Input name="maritalStatusId" type="select" value={formData.maritalStatusId} onChange={handleInputChange} required><option value="">-- Select --</option>{maritalStatuses.map(status => (<option key={status.status_id} value={status.status_id}>{status.status_name}</option>))}</Input></FormGroup></Col>
              </Row>
              <Row>
                <Col md="6"><FormGroup><label>Phone Number</label><Input name="phone" type="text" value={formData.phone} onChange={handleInputChange} placeholder="eg: 012-3456789" required/></FormGroup></Col>
                <Col md="6"><FormGroup><label>Gross Salary (MYR)</label><Input name="salary" type="number" step="0.01" value={formData.salary} onChange={handleInputChange} required/></FormGroup></Col>
              </Row>
               <FormGroup>
                <label>Address</label>
                <Input name="address" type="textarea" value={formData.address} onChange={handleInputChange} required/>
              </FormGroup>

              {/* ✅ NEW: Bank Information Section */}
              <Row>
                <Col md="6">
                  <FormGroup>
                    <label>Bank Name</label>
                    <Input name="bank_name" type="select" value={formData.bankName} onChange={handleInputChange} required>
                      <option value="">-- Select a Bank --</option>
                      {malaysianBanks.map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md="6">
                  <FormGroup>
                    <label>Bank Account Number</label>
                    <Input name="account_number" type="text" value={formData.accountNumber} onChange={handleInputChange} placeholder="Enter account number" required />
                  </FormGroup>
                </Col>
              </Row>

              <hr className="my-4" />
              <h6 className="heading-small text-muted mb-4">Account Information</h6>
              <Row>
                 <Col md="6"><FormGroup><label>Email</label><Input name="email" type="email" value={formData.email} onChange={handleInputChange} required /></FormGroup></Col>
                 <Col md="6"><FormGroup><label>Username</label><Input name="username" type="text" value={formData.username} onChange={handleInputChange} required /></FormGroup></Col>
              </Row>
              <Row>
                 <Col md="6"><FormGroup><label>Password</label><Input name="password" type="password" value={formData.password} onChange={handleInputChange} required /><small className="form-text text-muted">Min 8 characters, with uppercase, lowercase, number & symbol.</small></FormGroup></Col>
                 <Col md="6"><FormGroup><label>Confirm Password</label><Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required /></FormGroup></Col>
              </Row>

              <div className="text-center">
                <Button className="my-4 w-100" color="primary" type="submit" disabled={loading}>
                  {loading ? <Spinner size="sm" /> : "Create Account"}
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Container>
  );
};

export default ApplicantRegister;