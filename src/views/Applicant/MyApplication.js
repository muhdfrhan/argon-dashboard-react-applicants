// src/views/Applicant/MyApplication.js
import React, { useState, useEffect, useCallback } from "react";
import { 
  Container, Row, Col, Spinner, Alert, Button, 
  Card, CardHeader, CardBody, ListGroup, ListGroupItem, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input
} from "reactstrap";
import { getMyApplicationStatus, uploadAdditionalDocument } from "../../apicall";

const MyApplication = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false); 
  const [selectedApplication, setSelectedApplication] = useState(null); 

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const [dataVersion, setDataVersion] = useState(0);

  const fetchApplicationData = useCallback(async () => {
      setLoading(true);
      try {
        const data = await getMyApplicationStatus();
        setApplications(Array.isArray(data) ? data : (data ? [data] : []));
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setApplications([]);
        } else {
          setError("Failed to load application status.");
        }
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchApplicationData();
  }, [fetchApplicationData, dataVersion]);


  const toggleModal = () => {
    if (modalOpen) {
        setSelectedFile(null);
        setUploadError('');
        setUploadSuccess('');
        setIsUploading(false);
    }
    setModalOpen(!modalOpen);
  };

  const handleCardClick = (app) => {
    setSelectedApplication(app);
    toggleModal();
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadError('');
  };
  
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      const response = await uploadAdditionalDocument(selectedApplication.applicationId, formData);
      setUploadSuccess(response.message || 'Document uploaded successfully!');
      setSelectedFile(null); 

      setTimeout(() => {
        toggleModal(); 
        setDataVersion(prev => prev + 1); 
      }, 2000); 

    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to upload document.');
    } finally {
      setIsUploading(isUploading => !isUploading);
    }
  };


  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `RM ${parseFloat(value).toFixed(2)}`;
  };
  
  const canUpload = selectedApplication?.status?.title === 'Documents Requested';

  if (loading && applications.length === 0) { return <Container className="text-center mt-5"><Spinner /> <p>Loading your applications...</p></Container>; }
  if (error) { return <Container className="mt-5"><Alert color="danger">{error}</Alert></Container>; }
  if (applications.length === 0 && !loading) { 
    return (
        <Container className="text-center mt-5">
            <h3>No Applications Found</h3>
            <p>You have not submitted any applications yet.</p>
            <Button color="primary" tag="a" href="/apply">Apply for Zakat Now</Button>
        </Container>
    );
  }

  return (
    <Container className="mt-5" fluid>
      <h1 className="text-center mb-5">My Applications</h1>
      
        <Row className="justify-content-center">
          {applications.map(app => (
            <Col lg="9" md="10" key={app.applicationId} className="mb-4">
              <Card 
                className="shadow-lg border-0" 
                onClick={() => handleCardClick(app)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <CardHeader className={`bg-${app.status.color || 'secondary'} text-white`}>
                   <div className="d-flex justify-content-between align-items-center">
                    <h3 className="mb-0 text-white">{app.status.title || 'Unknown Status'}</h3>
                    <Badge color="light" pill className="p-2">
                      ID: {app.applicationId}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="p-4">
                  <p className="text-muted">{app.status?.description || 'No description available.'}</p>
                   {app.status.title === 'Documents Requested' && 
                        <Alert color="warning" className="mt-2 mb-3">
                            <strong>Action Required:</strong> Please open to view details and upload the requested documents.
                        </Alert>
                    }
                  <hr className="my-3" /> 
                  <Row>
                    <Col>
                      <small className="text-muted d-block">Submitted On</small>
                      <span className="font-weight-bold">{app.submissionDate}</span>
                    </Col>
                    <Col className="text-right">
                      <small className="text-muted d-block">Last Updated</small>
                      <span className="font-weight-bold">{app.lastUpdated}</span>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      
      {selectedApplication && (
        <Modal isOpen={modalOpen} toggle={toggleModal} size="lg" centered>
          <ModalHeader toggle={toggleModal}>
            Application Details (ID: {selectedApplication.applicationId})
          </ModalHeader>
          <ModalBody>
            <ListGroup flush>
              <ListGroupItem>
                <strong>Status:</strong> 
                <Badge color={selectedApplication.status?.color || 'secondary'} className="ml-2 px-2 py-1">
                  {selectedApplication.status?.title || 'Unknown'}
                </Badge>
              </ListGroupItem>
              
              {/* --- MODIFICATION START --- */}
              {/* Display the assigned staff member's name */}
              <ListGroupItem>
                <strong>Case Officer:</strong> {selectedApplication.staff_name || 'N/A'}
              </ListGroupItem>
              {/* --- MODIFICATION END --- */}

              {selectedApplication.details?.status_detail && (
                <ListGroupItem>
                  <Alert color="info" className="mb-0">
                    <h6 className="alert-heading">A Note From Our Staff</h6>
                    <p className="mb-0">{selectedApplication.details.status_detail}</p>
                  </Alert>
                </ListGroupItem>
              )}

              {canUpload && (
                <ListGroupItem>
                  <Card className="my-2 p-3 bg-light border">
                      <h5>Upload Requested Document</h5>
                      <Form onSubmit={handleUploadSubmit}>
                        {uploadError && <Alert color="danger">{uploadError}</Alert>}
                        {uploadSuccess && <Alert color="success">{uploadSuccess}</Alert>}
                        <FormGroup>
                          <Label for="documentUpload">Select Document</Label>
                          <Input
                            type="file"
                            id="documentUpload"
                            onChange={handleFileChange}
                            disabled={isUploading || uploadSuccess}
                          />
                        </FormGroup>
                        <Button color="primary" type="submit" disabled={!selectedFile || isUploading || uploadSuccess}>
                          {isUploading ? <><Spinner size="sm" /> Uploading...</> : 'Upload Document'}
                        </Button>
                      </Form>
                  </Card>
                </ListGroupItem>
              )}
              
              <ListGroupItem>
                <strong>Category Applied For:</strong> {selectedApplication.details?.category_name || 'N/A'}
              </ListGroupItem>
              <ListGroupItem>
                <strong>Employment Status:</strong> {selectedApplication.details?.employment_status || 'N/A'}
              </ListGroupItem>
              <ListGroupItem>
                <strong>Monthly Income:</strong> {formatCurrency(selectedApplication.details?.monthly_income)}
              </ListGroupItem>
              <ListGroupItem>
                <strong>Total Household Income:</strong> {formatCurrency(selectedApplication.details?.total_household_income)}
              </ListGroupItem>
              <ListGroupItem>
                <strong>Reason for Applying:</strong>
                <p className="text-muted mt-2 mb-0">{selectedApplication.details?.reason_for_applying || 'N/A'}</p>
              </ListGroupItem>
              <ListGroupItem>
                <strong>Signature:</strong> {selectedApplication.details?.signature || 'N/A'}
              </ListGroupItem>
            </ListGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={toggleModal}>Close</Button>
          </ModalFooter>
        </Modal>
      )}
    </Container>
  );
};

export default MyApplication;