import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

// Auth
import LoginPage from "../modules/auth/pages/LoginPage";
import UnauthorizedPage from "../modules/auth/pages/UnauthorizedPage";

// Dashboard
import DashboardPage from "../modules/dashboard/pages/DashboardPage";

// Patients
import PatientsListPage from "../modules/patients/pages/PatientsListPage";
import PatientDetailsPage from "../modules/patients/pages/PatientDetailsPage";

// Appointments
import BookAppointmentPage from "../modules/appointments/pages/BookAppointmentPage";
import AllAppointmentsPage from "../modules/appointments/pages/AllAppointmentsPage";
import CentreAppointmentsPage from "../modules/appointments/pages/CentreAppointmentsPage";
import ClinicianAppointmentsPage from "../modules/appointments/pages/ClinicianAppointmentsPage";
import FrontDeskBookingPage from "../modules/appointments/pages/FrontDeskBookingPage";
import SlotBlockingPage from "../modules/appointments/pages/SlotBlockingPage";
import SlotBlockingByCentrePage from "../modules/appointments/pages/SlotBlockingByCentrePage";
import SlotBlockingByClinicianPage from "../modules/appointments/pages/SlotBlockingByClinicianPage";
import SlotBlockingByDatePage from "../modules/appointments/pages/SlotBlockingByDatePage";

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

// Profile
import ProfilePage from "../modules/profile/pages/ProfilePage";

// Clinician Dashboard
import ClinicianDashboardPage from "../modules/clinician/pages/ClinicianDashboardPage";

function AppRouter() {
  const { isAuthenticated, isLoading, isClinician } = useAuth();

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
          isAuthenticated ? (
            <Navigate
              to={isClinician ? "/appointments" : "/dashboard"}
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Unauthorized route */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={isClinician ? "/appointments" : "/dashboard"}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Protected admin routes */}
      <Route
        element={
          isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />
        }
      >
        {/* Dashboard - Admin, Manager, Front Desk */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Patients - Admin, Manager, Front Desk */}
        <Route
          path="patients"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}>
              <PatientsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="patients/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}>
              <PatientDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Appointments - All authenticated users */}
        <Route
          path="appointments"
          element={
            isClinician ? <ClinicianDashboardPage /> : <AllAppointmentsPage />
          }
        />

        {/* Appointment booking - Admin, Manager, Front Desk */}
        <Route
          path="book-appointment"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}>
              <BookAppointmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="front-desk-booking"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}>
              <FrontDeskBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="slot-blocking"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}>
              <SlotBlockingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="slot-blocking/by-centre"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}>
              <SlotBlockingByCentrePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="slot-blocking/by-clinician"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}>
              <SlotBlockingByClinicianPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="slot-blocking/by-date"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}>
              <SlotBlockingByDatePage />
            </ProtectedRoute>
          }
        />

        {/* Centres - Admin, Manager, Front Desk */}
        <Route
          path="centres"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "FRONT_DESK"]}>
              <CentresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="centres/:centreId/appointments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <CentreAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="clinicians/:clinicianId/appointments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <ClinicianAppointmentsPage />
            </ProtectedRoute>
          }
        />

        {/* Staff - Admin only */}
        <Route
          path="staff/managers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <ManagersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/centre-managers"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <CentreManagersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/clinicians"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <CliniciansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/care-coordinators"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <CareCoordinatorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff/front-desk"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <FrontDeskPage />
            </ProtectedRoute>
          }
        />

        {/* Settings - Admin only */}
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Support - All authenticated users */}
        <Route path="support" element={<SupportPage />} />

        {/* Profile - All authenticated users */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default AppRouter;
