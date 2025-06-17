// src/views/Applicant/Login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import zakatLogo from "assets/img/zakat-logo.png";
import { applicantLogin } from "../../apicall";
import { Row, Col } from "reactstrap";

const ApplicantLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      await applicantLogin(username, password);
      navigate("/applicant/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid credentials or server error.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-7 d-flex justify-content-center">
      <div className="col-lg-5 col-md-7">
        <div
          className="card bg-white shadow"
          style={{ border: "2px solid #007bff", borderRadius: "10px" }}
        >
          <div className="card-header bg-white pb-5 text-center">
            <img src={zakatLogo} alt="Zakat Logo" style={{ maxWidth: "120px" }} />
            <h2 className="text-primary">Applicant Login</h2>
            <h4 className="text-muted">Welcome Back!</h4>
            <hr />
             <p className="text-muted">Please enter your credentials to access your account.</p>
          </div>
          <div className="card-body px-lg-5 py-lg-1">
            {error && <div className="alert alert-danger text-center">{error}</div>}
            <form role="form" onSubmit={handleLogin}>
              <div className="form-group mb-3">
                <label>Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  style={{ border: "1.5px solid #007bff" }}
                />
              </div>
              <div className="form-group mb-3">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  style={{ border: "1.5px solid #007bff" }}
                />
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="btn my-4 w-100"
                  style={{
                    backgroundColor: "#007bff",
                    border: "1.5px solid #007bff",
                    color: "white",
                  }}
                  disabled={loading}
                >
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : "Sign in"}
                </button>
              </div>
            </form>
            <Row className="mt-3">
              <Col className="text-center">
                <Link to="/applicant/register">
                  <small>Don't have an account? Create one</small>
                </Link>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantLogin;
