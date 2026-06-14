import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/useAuth";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import Placeholder from "./pages/Placeholder";
import AdminMFA from "./pages/AdminMFA";
import AdminMFASetup from "./pages/AdminMfaSetup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateVerifier from "./pages/admin/CreateVerifier";
import ManageUsers from "./pages/admin/ManageUsers";
import AuditLogs from "./pages/admin/AuditLogs";
import ManageInstitutions from "./pages/admin/ManageInstitutions";
import IndividualDashboard from "./pages/individual/IndividualDashboard";
import MyDocuments from "./pages/individual/MyDocuments";
import UploadDocument from "./pages/individual/UploadDocument";
import ConsentRequests from "./pages/individual/ConsentRequests";
import CredentialVault from "./pages/individual/CredentialVault";
import MyInstitutions from "./pages/individual/MyInstitutions";
import EmployerDashboard from "./pages/employer/EmployerDashboard";
import SearchIndividual from "./pages/employer/SearchIndividual";
import ApprovedAccess from "./pages/employer/ApprovedAccess";
import ViewDocuments from "./pages/employer/ViewDocuments";
import VerifierDashboard from "./pages/verifier/VerifierDashboard";
import VerificationQueue from "./pages/verifier/VerificationQueue";
import ReviewDocument from "./pages/verifier/ReviewDocument";
import UserRegistration from "./pages/UserRegistration";
import InstitutionDashboard from "./pages/institution/InstitutionDashboard";
import InstitutionStudents from "./pages/institution/InstitutionStudents";
import InstitutionCredentialCenter from "./pages/institution/InstitutionCredentialCenter";
import InstitutionIssuedCredentials from "./pages/institution/InstitutionIssuedCredentials";
import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/ui/LoadingOverlay";
import ErrorBoundary from "./components/ui/ErrorBoundary";

const roleHomeMap = {
  INDIVIDUAL: "/individual/dashboard",
  EMPLOYER: "/employer/dashboard",
  INSTITUTION: "/institution/dashboard",
  ADMIN: "/admin/dashboard",
  VERIFIER: "/verifier/dashboard",
};

const RoleBasedRedirect = () => {
  const { role } = useAuth();
  const target = roleHomeMap[role] || "/login";
  return <Navigate to={target} replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
      <LoadingProvider>
        <LoadingOverlay />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/register" element={<UserRegistration />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/admin/mfa" element={<AdminMFA />} />
              <Route path="/admin/mfa/setup" element={<AdminMFASetup />} />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Redirect root to appropriate dashboard based on role */}
                <Route index element={<RoleBasedRedirect />} />

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
                        <Route path="vault" element={<CredentialVault />} />
                        <Route path="institutions" element={<MyInstitutions />} />
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
                        <Route path="institutions" element={<ManageInstitutions />} />
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

                {/* INSTITUTION Routes */}
                <Route
                  path="institution/*"
                  element={
                    <ProtectedRoute allowedRoles={["INSTITUTION"]}>
                      <Routes>
                        <Route path="dashboard" element={<InstitutionDashboard />} />
                        <Route path="students" element={<InstitutionStudents />} />
                        <Route path="credentials" element={<InstitutionCredentialCenter />} />
                        <Route path="issued" element={<InstitutionIssuedCredentials />} />
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
