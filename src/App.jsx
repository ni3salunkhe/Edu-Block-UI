import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Placeholder from "./pages/Placeholder";
import AdminMFA from "./pages/AdminMFA";
import AdminMFASetup from "./pages/AdminMFASetup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateVerifier from "./pages/admin/CreateVerifier";
import ManageUsers from "./pages/admin/ManageUsers";
import AuditLogs from "./pages/admin/AuditLogs";
import IndividualDashboard from "./pages/individual/IndividualDashboard";
import MyDocuments from "./pages/individual/MyDocuments";
import UploadDocument from "./pages/individual/UploadDocument";
import ConsentRequests from "./pages/individual/ConsentRequests";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import SearchIndividual from "./pages/employer/SearchIndividual";
import ApprovedAccess from "./pages/employer/ApprovedAccess";
import ViewDocuments from "./pages/employer/ViewDocuments";
import VerifierDashboard from "./pages/verifier/VerifierDashboard";
import VerificationQueue from "./pages/verifier/VerificationQueue";
import ReviewDocument from "./pages/verifier/ReviewDocument";
import UserRegistration from "./pages/UserRegistration";
import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/ui/LoadingOverlay";
import ErrorBoundary from "./components/ui/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <LoadingOverlay />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/register" element={<UserRegistration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/admin/mfa" element={<AdminMFA />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Redirect root to appropriate dashboard or handle default */}
                <Route index element={<Navigate to="/individual/dashboard" replace />} />

                {/* INDIVIDUAL Routes */}
                <Route
                  path="individual/*"
                  element={
                    <ProtectedRoute allowedRoles={["INDIVIDUAL"]}>
                      <Routes>
                        <Route path="dashboard" element={<IndividualDashboard />} />
                        <Route path="documents" element={<MyDocuments />} />
                        <Route path="upload" element={<UploadDocument />} />
                        <Route path="consents" element={<ConsentRequests />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />

                {/* EMPLOYER Routes */}
                <Route
                  path="employer/*"
                  element={
                    <ProtectedRoute allowedRoles={["EMPLOYER"]}>
                      <Routes>
                        <Route path="dashboard" element={<EmployerDashboard />} />
                        <Route path="search" element={<SearchIndividual />} />
                        <Route path="approved" element={<ApprovedAccess />} />
                        <Route path="view/:consentId" element={<ViewDocuments />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />

                {/* ADMIN Routes */}
                <Route
                  path="admin/*"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="create" element={<CreateVerifier />} />
                        <Route path="audit" element={<AuditLogs />} />
                        <Route path="users" element={<ManageUsers />} />
                        <Route path="mfa/setup" element={<AdminMFASetup />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />

                {/* VERIFIER Routes */}
                <Route
                  path="verifier/*"
                  element={
                    <ProtectedRoute allowedRoles={["VERIFIER"]}>
                      <Routes>
                        <Route path="dashboard" element={<VerifierDashboard />} />
                        <Route path="queue" element={<VerificationQueue />} />
                        <Route path="review/:id" element={<ReviewDocument />} />
                      </Routes>
                    </ProtectedRoute>
                  }
                />

              </Route>
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
