// src/apicall.js
import axios from "axios";

const BASE_URL = "http://localhost:3000/api"; // Ensure this matches your backend

// Helper to get token from localStorage
const getToken = () => localStorage.getItem("authToken");

// Helper to create the authorization header for authenticated requests.
// This function is robust: it only adds the Authorization header.
// Axios will automatically set the correct 'Content-Type' header
// based on the data being sent (e.g., 'application/json' for objects,
// or 'multipart/form-data' for FormData).
const getAuthHeader = () => {
  const token = getToken();
  if (!token) {
    // This can help in debugging if a token is missing
    console.error("No auth token found for API request");
    return {};
  }
  return { headers: { Authorization: `Bearer ${token}` } };
};


// --- Applicant Login ---
/**
 * Logs in an applicant and stores their token, username, name, and role.
 * @param {string} username - The applicant's username.
 * @param {string} password - The applicant's password.
 * @returns {Promise<object>} The response data from the API.
 */
export const applicantLogin = async (username, password) => {
  // Using the endpoint from your provided file
  const response = await axios.post(`${BASE_URL}/ApplcnLogin`, { username, password });
  
  if (response.data && response.data.token) {
    localStorage.setItem("authToken", response.data.token);

    // IMPORTANT FIX: Set the role to 'applicant' for protected routes
    localStorage.setItem("role", "applicant"); 

    if (response.data.user) {
      localStorage.setItem("username", response.data.user.username);
      // Using your updated 'ApplicantName' key
      localStorage.setItem("ApplicantName", response.data.user.name); 
      // The user ID from the token is used by the backend, so no need to store it here unless you need it on the frontend
    }
  }
  return response.data;
};


// --- Get Applicant's Profile ---
/**
 * Fetches the profile details for the currently logged-in applicant.
 * @returns {Promise<object>} The profile data from the API.
 */
export const getApplicantProfile = async () => {
  // This endpoint comes from your 'routes/staffProfile.js' (you may want to rename that file to routes/applicantProfile.js)
  const response = await axios.get(`${BASE_URL}/ApplcnProfile`, getAuthHeader());
  return response.data;
};


// --- Get Applicant's Application Status ---
/**
 * Fetches the current application details for the logged-in applicant.
 * @returns {Promise<object>} The application data from the API.
 */
export const getMyApplicationStatus = async () => {
  // NOTE: Ensure '/applicant/my-application' matches your actual backend route for fetching status.
  const response = await axios.get(`${BASE_URL}/my-application`, getAuthHeader());
  return response.data;
};

export const verifyNric = async (nricData) => {
  const response = await axios.post(`${BASE_URL}/validationR/verify-nric`, nricData);
  return response.data;
};

export const registerApplicant = async (registrationData) => {
  const response = await axios.post(`${BASE_URL}/register/applicant`, registrationData);
  return response.data;
};

export const getMaritalStatuses = async () => {
  const response = await axios.get(`${BASE_URL}/marital-statuses`);
  return response.data;
};

// --- UPDATED Zakat Application Submission ---
/**
 * Submits the zakat application form, including any files.
 * @param {FormData} formData - A FormData object containing the application fields, dependents (as a JSON string), and uploaded files.
 * @returns {Promise<object>} The response data from the API.
 */
export const submitZakatApplication = async (formData) => {
  // Axios will automatically detect the FormData object and set the
  // Content-Type header to 'multipart/form-data'.
  const response = await axios.post(`${BASE_URL}/applicant/apply`, formData, getAuthHeader());
  return response.data;
};

export const uploadAdditionalDocument = async (applicationId, formData) => {
  // The backend route is POST /api/applicant/upload-document/:applicationId
  // Axios will automatically handle the 'multipart/form-data' header because we are sending FormData.
  const response = await axios.post(
    `${BASE_URL}/upload-document/${applicationId}`,
    formData,
    getAuthHeader()
  );
  return response.data;
};

export const updateApplicantProfile = async (profileData) => {
  // Create a copy of the data to avoid modifying the original state object directly.
  const dataToSend = { ...profileData };

  // Remove the password field if it's empty, so we don't send an empty string to the backend.
  if (!dataToSend.password || dataToSend.password === '') {
    delete dataToSend.password;
  }

  // Use axios.put for consistency with the rest of the file.
  // Pass the data as the second argument and the auth headers from the helper as the third.
  const response = await axios.put(
    `${BASE_URL}/ApplcnProfile`,
    dataToSend,
    getAuthHeader()
  );

  // With axios, the response body is directly in `response.data`.
  // Axios also automatically throws an error for non-2xx statuses, simplifying error handling in your components.
  return response.data;
};

