import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import {
  CalendarMonth,
  DesignSelect,
  CalendarSummary,
} from "./pages/CalendarSelect";
import InputGiven from "./pages/InputGiven";
import CalendarSelectionEntry from "./pages/CalendarSelectionEntry";

// Manager Pages
import ManagerDashboard from "./pages/ManagerDashboard";
import { ApprovalQueue, DoctorReview } from "./pages/ApprovalQueue";
import { MRProgress, DelayReport } from "./pages/MRProgress";
import CalendarDesigns from "./pages/CalendarDesigns";
// HO Pages
import HODashboard from "./pages/HODashboard";
import HOReport from "./pages/HOReport";
import AllDoctors from "./pages/Alldoctors ";
import FrozenDoctors from "./pages/Frozendoctors";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<LoginPage forgot />} />

        {/* MR Routes */}
        <Route path="/reports" element={<MRDashboard />} />
        <Route path="/mr-dashboard" element={<MRDashboard />} />
        <Route path="/add-doctor" element={<AddDoctor />} />
        <Route path="/draft-doctors" element={<DraftDoctors />} />
        <Route path="/submitted-doctors" element={<SubmittedDoctors />} />
        <Route path="/approved-doctors" element={<ApprovedDoctors />} />
        <Route path="/manager/mr-progress" element={<MRProgress />} />
        <Route path="/manager/delay-report" element={<DelayReport />} />
        <Route path="/profile-edit" element={<ProfileEdit />} />
        <Route path="/all-doctors" element={<AllDoctors />} />
        <Route path="/frozen-doctors" element={<FrozenDoctors />} />
        {/* <Route path="/doctor-detail" element={<DoctorDetail />} /> */}
        <Route path="/doctor-details/:doctorId" element={<DoctorDetail />} />
        <Route
          path="/doctor-detail/consent"
          element={<DoctorDetail consentModal />}
        />
        <Route
          path="/manager/calendar-designs"
          element={<CalendarDesigns role="manager" />}
        />
        <Route
          path="/ho/calendar-designs"
          element={<CalendarDesigns role="ho" />}
        />
        <Route path="/edit-doctor/:doctorId" element={<EditDoctor />} />
        <Route path="/calendar-selection" element={<CalendarSelectionEntry />} />
        <Route path="/calendar-design" element={<DesignSelect />} />
        <Route path="/calendar-summary" element={<CalendarSummary />} />
        <Route
          path="/calendar-finalized"
          element={<CalendarSummary finalized />}
        />
        <Route path="/input-given" element={<InputGiven />} />
        <Route path="/manager/input-given" element={<InputGiven />} />
        <Route path="/input-given/modal" element={<InputGiven modal />} />
        <Route path="/input-given/success" element={<InputGiven success />} />

        {/* Manager Routes */}
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/approvals" element={<ApprovalQueue />} />
        <Route path="/manager/doctor-review" element={<DoctorReview />} />
        <Route path="/manager/mr-progress" element={<MRProgress />} />
        <Route path="/manager/delay-report" element={<DelayReport />} />

        {/* HO Routes */}
        <Route path="/ho-dashboard" element={<HODashboard />} />
        <Route path="/ho/approvals" element={<ApprovalQueue role="ho" />} />
        <Route path="/ho/doctor-review" element={<DoctorReview role="ho" />} />
        <Route
          path="/ho/report-summary"
          element={<HOReport type="summary" />}
        />
        <Route path="/ho/report-trend" element={<HOReport type="trend" />} />
        <Route
          path="/ho/report-hierarchy"
          element={<HOReport type="hierarchy" />}
        />
        <Route path="/ho/report-mr" element={<HOReport type="mr" />} />
        <Route path="/ho/pending-report" element={<DelayReport role="ho" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
