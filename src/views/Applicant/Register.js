// src/views/Applicant/Register.js
import React, { useState, useEffect } from "react";
import {
  Button, Card, CardHeader, CardBody, FormGroup, Form, Input,
  Container, Row, Col, Spinner, Alert
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { registerApplicant, getMaritalStatuses, verifyNric } from "../../apicall";

const ApplicantRegister = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '', nric: '', dateOfBirth: '', address: '', phone: '',
    email: '', maritalStatusId: '', username: '', password: '', 
    confirmPassword: ''
  });
  const [maritalStatuses, setMaritalStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2) {
      const fetchStatuses = async () => {
        try {
          const statuses = await getMaritalStatuses();
          setMaritalStatuses(statuses);
        } catch (err) {
          setError('Could not load form data. Please refresh the page.');
        }
      };
      fetchStatuses();
    }
  }, [step]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNricVerification = async (e) => {
    e.preventDefault();
    setError('');
    
    const nricRegex = /^\d{12}$/;
    if (!nricRegex.test(formData.nric)) {
      return setError("NRIC must be in the format xxxxxxxxxxxx.");
    }
    if (!formData.fullName.trim()) {
        return setError("Full Name is required.");
    }
    
    setLoading(true);
    try {
      await verifyNric({ 
        fullName: formData.fullName, 
        nric: formData.nric 
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Could not verify your details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // --- Start of Validations for Step 2 ---
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError("Password must be at least 8 characters long...");
    }
    const phoneRegex = /^\d{3}-\d{7,8}$/;
    if (!phoneRegex.test(formData.phone)) {
      return setError("Phone number must be in the format xxx-xxxxxxx...");
    }

    // ✅ --- NEW: DATE OF BIRTH VALIDATION ---
    if (formData.dateOfBirth && formData.nric) {
      const nricDob = formData.nric.substring(0, 6);
      
      const dob = new Date(formData.dateOfBirth);
      const year = dob.getFullYear().toString().slice(-2); // Get last two digits of the year
      const month = (dob.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
      const day = dob.getDate().toString().padStart(2, '0');
      const formDob = `${year}${month}${day}`;

      if (nricDob !== formDob) {
        return setError("The Date of Birth does not match the NRIC. Please enter the correct date.");
      }
    }
    // ✅ --- END OF NEW VALIDATION ---

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
            <p className="text-muted text-center">
              {step === 1 ? 'Step 1: Verify Your Identity' : 'Step 2: Complete Your Details'}
            </p>
          </CardHeader>
          <CardBody className="px-lg-5 py-lg-5">
            {error && <Alert color="danger">{error}</Alert>}
            {success && <Alert color="success">{success}</Alert>}

            {/* --- STEP 1: VERIFICATION --- */}
            {step === 1 && (
              <Form role="form" onSubmit={handleNricVerification}>
                <h6 className="heading-small text-muted mb-4">Please enter your details as per your NRIC</h6>
                <FormGroup>
                  <label>Full Name</label>
                  <Input name="fullName" type="text" value={formData.fullName} onChange={handleInputChange} placeholder="e.g. AHMAD BIN ABU" required />
                </FormGroup>
                <FormGroup>
                  <label>NRIC Number</label>
                  <Input name="nric" type="text" value={formData.nric} onChange={handleInputChange} placeholder="eg: 900101141234" required />
                </FormGroup>
                <div className="text-center">
                  <Button className="my-4 w-100" color="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : "Verify & Continue"}
                  </Button>
                </div>
              </Form>
            )}

            {/* --- STEP 2: COMPLETE REGISTRATION --- */}
            {step === 2 && (
              <Form role="form" onSubmit={handleSubmit}>
                <h6 className="heading-small text-muted mb-4">Personal Information (Verified)</h6>
                <Row>
                  <Col md="6"><FormGroup><label>Full Name</label><Input name="fullName" type="text" value={formData.fullName} readOnly /></FormGroup></Col>
                  <Col md="6"><FormGroup><label>NRIC</label><Input name="nric" type="text" value={formData.nric} readOnly /></FormGroup></Col>
                </Row>
                
                <hr className="my-4" />
                <h6 className="heading-small text-muted mb-4">Please Complete Your Details</h6>
                
                {/* The Date of Birth input remains here, fully editable */}
                <Row>
                   <Col md="6"><FormGroup><label>Date of Birth</label><Input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleInputChange} required/></FormGroup></Col>
                   <Col md="6"><FormGroup><label>Marital Status</label><Input name="maritalStatusId" type="select" value={formData.maritalStatusId} onChange={handleInputChange} required><option value="">-- Select --</option>{maritalStatuses.map(status => (<option key={status.status_id} value={status.status_id}>{status.status_name}</option>))}</Input></FormGroup></Col>
                </Row>
                <FormGroup>
                    <label>Address</label>
                    <Input name="address" type="textarea" value={formData.address} onChange={handleInputChange} required/>
                </FormGroup>
                 <FormGroup>
                    <label>Phone Number</label>
                    <Input name="phone" type="text" value={formData.phone} onChange={handleInputChange} placeholder="eg: 012-3456789" required/>
                </FormGroup>

                <hr className="my-4" />
                <h6 className="heading-small text-muted mb-4">Account Information</h6>
                <Row>
                   <Col md="6"><FormGroup><label>Email</label><Input name="email" type="email" value={formData.email} onChange={handleInputChange} required /></FormGroup></Col>
                   <Col md="6"><FormGroup><label>Username</label><Input name="username" type="text" value={formData.username} onChange={handleInputChange} required /></FormGroup></Col>
                </Row>
                <Row>
                   <Col md="6"><FormGroup><label>Password</label><Input name="password" type="password" value={formData.password} onChange={handleInputChange} required /><small className="form-text text-muted">Min 8 characters...</small></FormGroup></Col>
                   <Col md="6"><FormGroup><label>Confirm Password</label><Input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required /></FormGroup></Col>
                </Row>

                <div className="text-center">
                  <Button className="my-4 w-100" color="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner size="sm" /> : "Create Account"}
                  </Button>
                </div>
              </Form>
            )}
          </CardBody>
        </Card>
      </Col>
    </Container>
  );
};

export default ApplicantRegister;