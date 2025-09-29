// src/views/Applicant/Profile.js
import React, { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardBody, FormGroup, Form, Input, Container, Row, Col, CardText, Spinner, Alert } from 'reactstrap';
import { getApplicantProfile, updateApplicantProfile, getMaritalStatuses } from '../../apicall';

const malaysianBanks = [
  "Maybank", "CIMB Bank", "Public Bank Berhad", "RHB Bank", "Hong Leong Bank",
  "AmBank", "Bank Islam Malaysia Berhad", "Bank Simpanan Nasional (BSN)", "Bank Rakyat",
  "Affin Bank", "Alliance Bank", "Standard Chartered Bank Malaysia", "HSBC Bank Malaysia",
  "OCBC Bank Malaysia", "UOB Malaysia", "Other"
];

const ApplicantProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateStatus, setUpdateStatus] = useState({ msg: null, type: null });
  const [maritalStatuses, setMaritalStatuses] = useState([]);

  const fetchInitialData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [profileData, statusesData] = await Promise.all([
        getApplicantProfile(),
        getMaritalStatuses()
      ]);
      setProfile(profileData);
      setFormData(profileData);
      setMaritalStatuses(statusesData);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setError("Could not load your profile data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setUpdateStatus({ msg: null, type: null });

    const { password, account_number } = formData;

    if (password && password.length > 0) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
      if (!passwordRegex.test(password)) {
        setUpdateStatus({ msg: 'Password does not meet requirements.', type: 'danger' });
        return;
      }
    }
    
    const accountNumberRegex = /^\d{7,16}$/;
    if (account_number && !accountNumberRegex.test(account_number)) {
      setUpdateStatus({ msg: 'Bank account number must be between 7 and 16 digits.', type: 'danger' });
      return;
    }

    setUpdateStatus({ msg: 'Saving...', type: 'info' });
    try {
      const dataToUpdate = { ...formData };
      if (!dataToUpdate.password) delete dataToUpdate.password;
      
      await updateApplicantProfile(dataToUpdate);
      setUpdateStatus({ msg: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
      fetchInitialData(); 
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setUpdateStatus({ msg: `Update failed: ${errorMessage}`, type: 'danger' });
    }
  };
  
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB') : 'N/A';
  const formatCurrency = (amount) => (amount === null || isNaN(amount)) ? 'N/A' : new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount);

  if (loading) {
    return <Container className="mt-5 text-center" fluid><Spinner /> <p>Loading profile...</p></Container>;
  }

  if (error) {
    return <Container className="mt-5" fluid><Alert color="danger">{error}</Alert></Container>;
  }
  
  if (!profile) {
     return <Container className="mt-5" fluid><Alert color="warning">Profile data not available.</Alert></Container>;
  }

  return (
    <Container className="mt-5" fluid>
      <Row className="justify-content-center">
        <Col xl="8">
          <Card className="shadow">
            <CardHeader>
              <Row className="align-items-center">
                <Col xs="8"><h3 className="mb-0">My Profile</h3></Col>
                <Col className="text-right" xs="4">
                  <Button color={isEditing ? 'default' : 'primary'} onClick={() => setIsEditing(!isEditing)} size="sm">
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {updateStatus.msg && <Alert color={updateStatus.type} isOpen={!!updateStatus.msg} toggle={() => setUpdateStatus({ msg: null, type: null })}>{updateStatus.msg}</Alert>}
              <Form onSubmit={handleSaveChanges}>
                {/* --- Personal Information --- */}
                <h6 className="heading-small text-muted mb-4">Personal Information</h6>
                <div className="pl-lg-4">
                  <Row>
                    <Col lg="6"><FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Full Name</label><CardText className="pt-2 font-weight-bold">{profile.full_name}</CardText></FormGroup></Col>
                    <Col lg="6"><FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">NRIC</label><CardText className="pt-2 font-weight-bold">{profile.nric}</CardText></FormGroup></Col>
                  </Row>
                  {/* ✅ NEW: Row to display Applicant ID and Date of Birth */}
                  <Row>
                    <Col lg="6"><FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Applicant ID</label><CardText className="pt-2 font-weight-bold">{profile.applicant_id}</CardText></FormGroup></Col>
                    <Col lg="6"><FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Date of Birth</label><CardText className="pt-2 font-weight-bold">{formatDate(profile.date_of_birth)}</CardText></FormGroup></Col>
                  </Row>
                  <Row>
                    <Col lg="6"><FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Marital Status</label>{isEditing ? (<Input type="select" name="marital_status_id" value={formData.marital_status_id} onChange={handleInputChange}>{maritalStatuses.map((s) => (<option key={s.status_id} value={s.status_id}>{s.status_name}</option>))}</Input>) : (<CardText className="pt-2">{profile.status_name}</CardText>)}</FormGroup></Col>
                    <Col lg="6"><FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Gross Salary</label>{isEditing ? (<Input name="salary" value={formData.salary || ''} onChange={handleInputChange} type="number" step="0.01" />) : (<CardText className="pt-2">{formatCurrency(profile.salary)}</CardText>)}</FormGroup></Col>
                  </Row>
                   <Row><Col><FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Home Address</label>{isEditing ? (<Input name="address" value={formData.address || ''} onChange={handleInputChange} type="textarea" />) : (<CardText className="pt-2">{profile.address}</CardText>)}</FormGroup></Col></Row>
                </div>
                
                {/* --- Bank Information --- */}
                <hr className="my-4" />
                <h6 className="heading-small text-muted mb-4">Bank Information (for Aid Disbursement)</h6>
                <div className="pl-lg-4">
                  <Row>
                    <Col lg="6">
                      <FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Bank Name</label>
                        {isEditing ? (
                          <Input type="select" name="bank_name" value={formData.bank_name || ''} onChange={handleInputChange}>
                            <option value="">-- Select a Bank --</option>
                            {malaysianBanks.map(bank => (<option key={bank} value={bank}>{bank}</option>))}
                          </Input>
                        ) : (<CardText className="pt-2">{profile.bank_name || 'Not Provided'}</CardText>)}
                      </FormGroup>
                    </Col>
                    <Col lg="6">
                      <FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Account Number</label>
                        {isEditing ? <Input name="account_number" value={formData.account_number || ''} onChange={handleInputChange} type="text" placeholder="Digits only"/> : <CardText className="pt-2">{profile.account_number || 'Not Provided'}</CardText>}
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
                
                {/* --- Contact & Account --- */}
                <hr className="my-4" />
                <h6 className="heading-small text-muted mb-4">Contact & Account</h6>
                <div className="pl-lg-4">
                  <Row>
                    <Col lg="6"><FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Email Address</label>{isEditing ? <Input name="email" value={formData.email || ''} onChange={handleInputChange} type="email" /> : <CardText className="pt-2">{profile.email}</CardText>}</FormGroup></Col>
                    <Col lg="6"><FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Phone Number</label>{isEditing ? <Input name="phone" value={formData.phone || ''} onChange={handleInputChange} type="text" /> : <CardText className="pt-2">{profile.phone}</CardText>}</FormGroup></Col>
                  </Row>
                   <Row>
                    <Col lg="6"><FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">Username</label>{isEditing ? <Input name="username" value={formData.username || ''} onChange={handleInputChange} type="text" /> : <CardText className="pt-2">{profile.username}</CardText>}</FormGroup></Col>
                    <Col lg="6">{isEditing && (<FormGroup><label className="text-uppercase text-primary font-weight-bold small mb-1">New Password</label><Input name="password" autoComplete="new-password" placeholder="Leave blank to keep current" onChange={handleInputChange} type="password" /><small className="form-text text-muted">Min 8 chars, with uppercase, lowercase, number & symbol.</small></FormGroup>)}</Col>
                  </Row>
                </div>

                {isEditing && (<div className="text-right mt-4"><Button color="success" type="submit">Save Changes</Button></div>)}
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ApplicantProfile;