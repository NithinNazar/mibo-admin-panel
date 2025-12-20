import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import { useAuth } from "../contexts/AuthContext";

// Auth
import LoginPage from "../modules/auth/pages/LoginPage";

// Dashboard
import DashboardPage from "../modules/dashboard/pages/DashboardPage";

// Patients
import PatientsListPage from "../modules/patients/pages/PatientsListPage";
import PatientDetailsPage from "../modules/patients/pages/PatientDetailsPage";

// Appointments
import BookAppointmentPage from "../modules/appointments/pages/BookAppointmentPage";
import CentreAppointmentsPage from "../modules/appointments/pages/CentreAppointmentsPage";
import ClinicianAppointmentsPage from "../modules/appointments/pages/ClinicianAppointmentsPage";

// Centres
import CentresPage from "../modules/centres/pages/CentresPage";

// Staff
import ManagersPage from "../modules/staff/pages/ManagersPage";
import CentreManagersPage from "../modules/staff/pages/CentreManagersPage";
import CliniciansPage from "../modules/staff/pages/CliniciansPage";
import CareCoordinatorsPage from "../modules/staff/pages/CareCoordinatorsPage";
import FrontDeskPage from "../modules/staff/pages/FrontDeskPage";

// Settings
import SettingsPage from "../modules/settings/pages/SettingsPage";
import SupportPage from "../modules/settings/pages/SupportPage";

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-miboBg flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Protected admin routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Main */}
        <Route path="patients" element={<PatientsListPage />} />
        <Route path="patients/:id" element={<PatientDetailsPage />} />
        <Route path="book-appointment" element={<BookAppointmentPage />} />
        <Route path="centres" element={<CentresPage />} />
        <Route
          path="centres/:centreId/appointments"
          element={<CentreAppointmentsPage />}
        />
        <Route
          path="clinicians/:clinicianId/appointments"
          element={<ClinicianAppointmentsPage />}
        />

        {/* Staff */}
        <Route path="staff/managers" element={<ManagersPage />} />
        <Route path="staff/centre-managers" element={<CentreManagersPage />} />
        <Route path="staff/clinicians" element={<CliniciansPage />} />
        <Route
          path="staff/care-coordinators"
          element={<CareCoordinatorsPage />}
        />
        <Route path="staff/front-desk" element={<FrontDeskPage />} />

        {/* Settings */}
        <Route path="settings" element={<SettingsPage />} />
        <Route path="support" element={<SupportPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRouter;
