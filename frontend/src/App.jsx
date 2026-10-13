import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import LoginPage from "./pages/LoginPage";
import EditDoctor from "./pages/EditDoctor";
import ProfileEdit from "./pages/ProfileEdit";

// MR Pages
import MRDashboard from "./pages/MRDashboard";
import AddDoctor from "./pages/AddDoctor";
import DraftDoctors from "./pages/DraftDoctors";
import SubmittedDoctors from "./pages/SubmittedDoctors";
import ApprovedDoctors from "./pages/ApprovedDoctors";
import DoctorDetail from "./pages/DoctorDetail";
import { CalendarMonth, DesignSelect, CalendarSummary, CalendarFinalized } from "./pages/CalendarSelect";
import InputGiven from "./pages/InputGiven";
import CalendarSelectionEntry from "./pages/CalendarSelectionEntry";

// Manager Pages
import ManagerDashboard from "./pages/ManagerDashboard";
import { ApprovalQueue, DoctorReview } from "./pages/ApprovalQueue";
import { MRProgress, DelayReport } from "./pages/MRProgress";
import ManagerReports from "./pages/ManagerReports";
import CalendarDesigns from "./pages/CalendarDesigns";

// HO Pages
import HODashboard from "./pages/HODashboard";
import HOReport from "./pages/HOReport";
import AllDoctors from "./pages/Alldoctors ";
import FrozenDoctors from "./pages/Frozendoctors";
import HOOperations from "./pages/HOOperations";

function RequireRole({ allowedRoles, children }) {
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch { user = null; }
  const role = String(user?.role || "").toLowerCase();
  if (!user || !role) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(role)) {
    const destination = role === "ho" ? "/ho-dashboard" : role === "mr" ? "/mr-dashboard" : "/manager-dashboard";
    return <Navigate to={destination} replace />;
  }
  return children;
}

const HO = ({ children }) => <RequireRole allowedRoles={["ho"]}>{children}</RequireRole>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<LoginPage forgot />} />

        <Route path="/reports" element={<MRDashboard />} />
        <Route path="/mr-dashboard" element={<MRDashboard />} />
        <Route path="/add-doctor" element={<AddDoctor />} />
        <Route path="/draft-doctors" element={<DraftDoctors />} />
        <Route path="/submitted-doctors" element={<SubmittedDoctors />} />
        <Route path="/approved-doctors" element={<ApprovedDoctors />} />
        <Route path="/manager/mr-progress" element={<MRProgress />} />
        <Route path="/manager/delay-report" element={<ManagerReports />} />
        <Route path="/profile-edit" element={<ProfileEdit />} />
        <Route path="/ho/profile-edit" element={<HO><ProfileEdit /></HO>} />
        <Route path="/all-doctors" element={<AllDoctors />} />
        <Route path="/frozen-doctors" element={<FrozenDoctors />} />
        <Route path="/doctor-details/:doctorId" element={<DoctorDetail />} />
        <Route path="/doctor-detail/consent" element={<DoctorDetail consentModal />} />
        <Route path="/manager/calendar-designs" element={<CalendarDesigns role="manager" />} />
        <Route path="/ho/calendar-designs" element={<HO><CalendarDesigns role="ho" /></HO>} />
        <Route path="/edit-doctor/:doctorId" element={<EditDoctor />} />
        <Route path="/calendar-selection" element={<CalendarSelectionEntry />} />
        <Route path="/calendar-design" element={<DesignSelect />} />
        <Route path="/calendar-summary" element={<CalendarSummary />} />
        <Route path="/calendar-finalized" element={<CalendarFinalized />} />
        <Route path="/input-given" element={<InputGiven />} />
        <Route path="/manager/input-given" element={<InputGiven />} />
        <Route path="/input-given/modal" element={<InputGiven modal />} />
        <Route path="/input-given/success" element={<InputGiven success />} />

        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/approvals" element={<ApprovalQueue />} />
        <Route path="/manager/doctor-review" element={<DoctorReview />} />
        <Route path="/manager/delay-report" element={<ManagerReports />} />

        <Route path="/ho-dashboard" element={<HO><HODashboard /></HO>} />
        <Route path="/ho/users" element={<HO><HOOperations page="users" /></HO>} />
        <Route path="/ho/deleted-users" element={<HO><HOOperations page="deleted-users" /></HO>} />
        <Route path="/ho/hierarchy" element={<HO><HOOperations page="hierarchy" /></HO>} />
        <Route path="/ho/activity" element={<HO><HOOperations page="activity" /></HO>} />
        <Route path="/ho/consent-tracker" element={<HO><HOOperations page="consent" /></HO>} />
        <Route path="/ho/input-tracker" element={<HO><HOOperations page="input" /></HO>} />
        <Route path="/ho/settings" element={<HO><HOOperations page="settings" /></HO>} />
        <Route path="/ho/approvals" element={<HO><ApprovalQueue role="ho" /></HO>} />
        <Route path="/ho/doctor-review" element={<HO><DoctorReview role="ho" /></HO>} />
        <Route path="/ho/report-funnel" element={<HO><HOReport type="summary" /></HO>} />
        <Route path="/ho/report-summary" element={<HO><HOReport type="summary" /></HO>} />
        <Route path="/ho/report-trend" element={<HO><HOReport type="trend" /></HO>} />
        <Route path="/ho/report-hierarchy" element={<HO><HOReport type="hierarchy" /></HO>} />
        <Route path="/ho/report-mr" element={<HO><HOReport type="mr" /></HO>} />
        <Route path="/ho/pending-report" element={<HO><DelayReport role="ho" /></HO>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
