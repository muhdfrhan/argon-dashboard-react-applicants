import React, { useState, useEffect } from "react";
import { 
  Container, Card, CardBody, Button, Spinner, Row, Col, Form, FormGroup, Label, Input, CardHeader 
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import { submitZakatApplication } from "../../apicall";
import axios from "axios";

// The Form Component with all updates
const ZakatApplicationForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    category_id: "",
    employment_status: "",
    employer_name: "",
    employer_address: "",
    institute_name: "",
    monthly_income: "",
    other_income_sources: "",
    total_household_income: "",
    monthly_expenses: "",
    outstanding_debts: "",
    aid_from_others: "",
    reason_for_applying: "",
    spouse_name: "",
    spouse_employment_status: "",
    declaration: false,
    consent: false,
    signature: "",
  });

  const [categories, setCategories] = useState([]);
  const [dependents, setDependents] = useState([]);
  // UPDATED: State to manage file objects and their selected types
  const [documentEntries, setDocumentEntries] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://192.168.0.240:3000/api/asnaf-categories");
        setCategories(res.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleDependentChange = (index, e) => {
    const { name, value } = e.target;
    const list = [...dependents];
    list[index][name] = value;
    setDependents(list);
  };

  const handleAddDependent = () => setDependents([...dependents, { name: "", relationship: "", age: "" }]);
  const handleRemoveDependent = (index) => setDependents(dependents.filter((_, i) => i !== index));

  // UPDATED: Handler for file input to populate the documentEntries state
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newEntries = files.map(file => ({
      file: file,
      type: '' // Default to empty, forcing user selection
    }));
    setDocumentEntries(newEntries);
  };

  // NEW: Handler to update the type of a specific document
  const handleDocumentTypeChange = (index, event) => {
    const newType = event.target.value;
    const updatedEntries = [...documentEntries];
    updatedEntries[index].type = newType;
    setDocumentEntries(updatedEntries);
  };

  // UPDATED: Submission logic to handle the new document structure
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.declaration || !formData.consent) {
      alert("Please agree to the declaration and consent.");
      return;
    }
    // Validate that all uploaded documents have a type selected
    if (documentEntries.some(entry => entry.type === '')) {
      alert("Please select a type for each uploaded document.");
      return;
    }

    const submissionData = new FormData();
    // Append all standard form fields
    for (const key in formData) {
      submissionData.append(key, formData[key]);
    }
    // Append dependents as a JSON string
    submissionData.append('dependents', JSON.stringify(dependents));
    
    // Append documents and their types as required by the backend
    if (documentEntries.length > 0) {
      documentEntries.forEach(entry => {
        submissionData.append('documents', entry.file);      // The file object
        submissionData.append('document_types', entry.type); // The corresponding type string
      });
    }
    
    onSubmit(submissionData);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardBody className="p-lg-5">
        <h3 className="text-center text-muted mb-4">Zakat Application Form</h3>
        <Form onSubmit={handleSubmit}>

          {/* SECTION 1: Applicant Details */}
          <Card className="mb-4">
            <CardHeader><h5>1. Applicant Details</h5></CardHeader>
            <CardBody>
              <FormGroup>
                <Label for="category_id">Category of Aid (Asnaf)</Label>
                <Input type="select" name="category_id" id="category_id" value={formData.category_id} onChange={handleChange} required>
                  <option value="">-- Select Asnaf Category --</option>
                  {categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name} - {cat.description}</option>)}
                </Input>
              </FormGroup>
              <FormGroup>
                <Label for="employment_status">Employment Status</Label>
                <Input type="select" name="employment_status" id="employment_status" value={formData.employment_status} onChange={handleChange} required>
                  <option value="">-- Select --</option>
                  <option>Employed</option><option>Unemployed</option><option>Self-employed</option><option>Student</option><option>Retired</option>
                </Input>
              </FormGroup>
              {formData.employment_status === "Employed" && (
                <Row form>
                  <Col md={6}><FormGroup>
                      <Label for="employer_name">Employer Name</Label>
                      <Input type="text" name="employer_name" id="employer_name" value={formData.employer_name} onChange={handleChange} />
                  </FormGroup></Col>
                  <Col md={6}><FormGroup>
                      <Label for="employer_address">Employer Address</Label>
                      <Input type="text" name="employer_address" id="employer_address" value={formData.employer_address} onChange={handleChange} />
                  </FormGroup></Col>
                </Row>
              )}
              {formData.employment_status === "Student" && (
                <FormGroup>
                  <Label for="institute_name">School/University Name</Label>
                  <Input type="text" name="institute_name" id="institute_name" value={formData.institute_name} onChange={handleChange} placeholder="e.g., Universiti Teknologi Malaysia" />
                </FormGroup>
              )}
            </CardBody>
          </Card>

          {/* SECTION 2: Financial Information */}
          <Card className="mb-4">
            <CardHeader><h5>2. Financial Information</h5></CardHeader>
            <CardBody>
              <Row form>
                <Col md={6}><FormGroup>
                  <Label for="monthly_income">Your Monthly Income (RM)</Label>
                  <Input type="number" name="monthly_income" id="monthly_income" value={formData.monthly_income} onChange={handleChange} required step="0.01" />
                </FormGroup></Col>
                <Col md={6}><FormGroup>
                  <Label for="total_household_income">Total Household Income (RM)</Label>
                  <Input type="number" name="total_household_income" id="total_household_income" value={formData.total_household_income} onChange={handleChange} required step="0.01" />
                </FormGroup></Col>
              </Row>
              <FormGroup>
                <Label for="other_income_sources">Other Income Sources</Label>
                <Input type="textarea" name="other_income_sources" id="other_income_sources" value={formData.other_income_sources} onChange={handleChange} />
              </FormGroup>
              <Row form>
                <Col md={6}><FormGroup>
                  <Label for="monthly_expenses">Total Monthly Expenses (RM)</Label>
                  <Input type="number" name="monthly_expenses" id="monthly_expenses" value={formData.monthly_expenses} onChange={handleChange} step="0.01" />
                </FormGroup></Col>
                 <Col md={6}><FormGroup>
                  <Label for="outstanding_debts">Total Outstanding Debts (RM)</Label>
                  <Input type="number" name="outstanding_debts" id="outstanding_debts" value={formData.outstanding_debts} onChange={handleChange} step="0.01" />
                </FormGroup></Col>
              </Row>
              <FormGroup>
                <Label for="aid_from_others">Receiving Aid from Other Organizations?</Label>
                <Input type="textarea" name="aid_from_others" id="aid_from_others" value={formData.aid_from_others} onChange={handleChange} />
              </FormGroup>
               <FormGroup>
                <Label for="reason_for_applying">Reason for Applying for Zakat</Label>
                <Input type="textarea" name="reason_for_applying" id="reason_for_applying" value={formData.reason_for_applying} onChange={handleChange} required />
              </FormGroup>
            </CardBody>
          </Card>

          {/* SECTION 3: Spouse & Dependents */}
          <Card className="mb-4">
            <CardHeader><h5>3. Spouse & Dependents</h5></CardHeader>
            <CardBody>
              <Row form>
                <Col md={6}><FormGroup>
                  <Label for="spouse_name">Spouse's Full Name (if applicable)</Label>
                  <Input type="text" name="spouse_name" id="spouse_name" value={formData.spouse_name} onChange={handleChange} />
                </FormGroup></Col>
                <Col md={6}><FormGroup>
                  <Label for="spouse_employment_status">Spouse's Employment Status</Label>
                  {/* UPDATED: Field changed to a select dropdown */}
                  <Input type="select" name="spouse_employment_status" id="spouse_employment_status" value={formData.spouse_employment_status} onChange={handleChange}>
                    <option value="">-- Select --</option>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Student">Student</option>
                    <option value="Retired">Retired</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </Input>
                </FormGroup></Col>
              </Row>
              <hr className="my-4" />
              <h6>Dependents Information</h6>
              {dependents.map((dependent, i) => (
                <Row key={i} className="mb-3 border-bottom pb-3 align-items-end">
                  <Col md={5}><FormGroup><Label>Full Name</Label><Input type="text" name="name" value={dependent.name} onChange={e => handleDependentChange(i, e)} required /></FormGroup></Col>
                  <Col md={3}><FormGroup><Label>Relationship</Label><Input type="text" name="relationship" value={dependent.relationship} onChange={e => handleDependentChange(i, e)} required /></FormGroup></Col>
                  <Col md={2}><FormGroup><Label>Age</Label><Input type="number" name="age" value={dependent.age} onChange={e => handleDependentChange(i, e)} required /></FormGroup></Col>
                  <Col md={2}><FormGroup><Button color="danger" outline block onClick={() => handleRemoveDependent(i)}>Remove</Button></FormGroup></Col>
                </Row>
              ))}
              <Button color="info" onClick={handleAddDependent}>+ Add Dependent</Button>
            </CardBody>
          </Card>

          {/* SECTION 4: Documents & Declaration */}
          <Card>
            <CardHeader><h5>4. Documents & Declaration</h5></CardHeader>
            <CardBody>
              <FormGroup>
                <Label for="documents">Upload Supporting Documents</Label>
                <Input type="file" name="documents" id="documents" onChange={handleFileChange} multiple />
                <small className="form-text text-muted">You can select multiple files. After selecting, please categorize each one below.</small>
              </FormGroup>

              {/* NEW: UI for categorizing each uploaded document */}
              {documentEntries.length > 0 && (
                <div className="p-3 mb-3 border rounded">
                  <h6 className="mb-3">Please categorize your uploaded documents:</h6>
                  {documentEntries.map((entry, index) => (
                    <Row key={index} className="align-items-center mb-2">
                      <Col xs="6" sm="7">
                        <span className="text-muted" style={{wordBreak: 'break-all'}}>{entry.file.name}</span>
                      </Col>
                      <Col xs="6" sm="5">
                        <Input
                          type="select"
                          bsSize="sm"
                          value={entry.type}
                          onChange={(e) => handleDocumentTypeChange(index, e)}
                          required
                        >
                          <option value="">-- Select Type --</option>
                          <option value="ID Card">ID Card / MyKad</option>
                          <option value="Payslip">Payslip</option>
                          <option value="Utility Bill">Utility Bill</option>
                          <option value="Bank Statement">Bank Statement</option>
                          <option value="Medical Report">Medical Report</option>
                          <option value="Other">Other</option>
                        </Input>
                      </Col>
                    </Row>
                  ))}
                </div>
              )}
              
              <FormGroup check>
                <Label check><Input type="checkbox" name="declaration" checked={formData.declaration} onChange={handleChange} required /> I declare that all information provided is true.</Label>
              </FormGroup>
              <FormGroup check className="mb-3">
                <Label check><Input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required /> I consent to the processing of my data.</Label>
              </FormGroup>
              <FormGroup>
                <Label for="signature">Digital Signature (Type your full name)</Label>
                <Input type="text" name="signature" id="signature" value={formData.signature} onChange={handleChange} required />
              </FormGroup>
            </CardBody>
          </Card>

          <div className="text-center mt-4">
            <Button color="success" size="lg" type="submit" disabled={loading} style={{ minWidth: '200px' }}>
              {loading ? <Spinner size="sm" /> : "Submit Application"}
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};


// Parent component that handles the API call logic (no changes needed here)
const Apply = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      await submitZakatApplication(formData);
      alert("Application submitted successfully.");
      navigate("/applicant/my-application");
    } catch (error) {
      const errorMsg = error.response ? error.response.data.error || "An unknown error occurred." : error.message;
      console.error("Submission Error:", error.response || error);
      alert(`Submission failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 mb-5" fluid>
      <Row className="justify-content-center">
        <Col lg="10" xl="8">
          <ZakatApplicationForm onSubmit={handleFormSubmit} loading={loading} />
        </Col>
      </Row>
    </Container>
  );
};

export default Apply;