// // import React, { useState } from "react";
// // import { CheckCircle2 } from "lucide-react";

// // // Pages
// // import LoginPage from "./pages/LoginPage";
// // import MRDashboard from "./pages/MRDashboard";
// // import AddDoctor from "./pages/AddDoctor";
// // import DoctorList from "./pages/DoctorList";
// // import DoctorDetail from "./pages/DoctorDetail";
// // import { CalendarMonth, DesignSelect, CalendarSummary } from "./pages/CalendarSelect";
// // import InputGiven from "./pages/InputGiven";
// // import ManagerDashboard from "./pages/ManagerDashboard";
// // import { ApprovalQueue, DoctorReview } from "./pages/ApprovalQueue";
// // import { MRProgress, DelayReport } from "./pages/MRProgress";
// // import HODashboard from "./pages/HODashboard";
// // import HOReport from "./pages/HOReport";

// // import { getCurrentRole, routeFromText } from "./utils/helpers";

// // // All screens in order — index matters for routing
// // const pages = [
// //   ["Login",                       <LoginPage />],
// //   ["Forgot Password",             <LoginPage forgot />],
// //   ["MR Dashboard",                <MRDashboard />],
// //   ["Add Doctor",                  <AddDoctor />],
// //   ["Draft Doctors",               <DoctorList type="draft" />],
// //   ["Submitted Doctors",           <DoctorList type="submitted" />],
// //   ["Approved Doctors",            <DoctorList type="approved" />],
// //   ["Doctor Details",              <DoctorDetail />],
// //   ["Send Consent Modal",          <DoctorDetail consentModal />],
// //   ["Calendar Month Selection",    <CalendarMonth />],
// //   ["Month-wise Design Selection", <DesignSelect />],
// //   ["Calendar Selection Summary",  <CalendarSummary />],
// //   ["Calendar Finalized / Frozen", <CalendarSummary finalized />],
// //   ["Input Given List",            <InputGiven />],
// //   ["Input Given Date Panel",      <InputGiven modal />],
// //   ["Input Given Success",         <InputGiven success />],
// //   ["Manager Dashboard",           <ManagerDashboard />],
// //   ["Manager Approval Queue",      <ApprovalQueue />],
// //   ["Manager Doctor Review",       <DoctorReview />],
// //   ["Manager MR-wise Progress",    <MRProgress />],
// //   ["Manager Delay Report",        <DelayReport />],
// //   ["HO National Dashboard",       <HODashboard />],
// //   ["HO Approval Queue",           <ApprovalQueue role="ho" />],
// //   ["HO Doctor Review",            <DoctorReview role="ho" />],
// //   ["HO Approval Summary Report",  <HOReport type="summary" />],
// //   ["HO Approval Trend Report",    <HOReport type="trend" />],
// //   ["HO Hierarchy-wise Report",    <HOReport type="hierarchy" />],
// //   ["HO MR-wise Approval Report",  <HOReport type="mr" />],
// //   ["HO Pending Action Report",    <DelayReport role="ho" />],
// // ];

// // export default function App() {
// //   const [idx, setIdx] = useState(0);
// //   const [toast, setToast] = useState("");

// //   const notify = (message = "Action completed") => {
// //     setToast(message);
// //     window.clearTimeout(window.__pcpToastTimer);
// //     window.__pcpToastTimer = window.setTimeout(() => setToast(""), 1800);
// //   };

// //   const go = (target) => {
// //     if (target === "logout") { setIdx(0); notify("Logged out"); return; }
// //     if (target === "help") { notify("Help & Support panel opened"); return; }
// //     if (typeof target === "number")
// //       setIdx(Math.max(0, Math.min(pages.length - 1, target)));
// //   };

// //   const handleClick = (event) => {
// //     const clickable = event.target.closest(
// //       "button,.navitem,.quick > div,.listline,.doctorAct,tr,a,.stat,.selectbox,.bell,.location,.avatarWrap,.pager button,.actions button,[data-route]",
// //     );
// //     if (!clickable) return;

// //     const dataRoute = clickable.getAttribute("data-route");
// //     if (dataRoute !== null && dataRoute !== "" && dataRoute !== "null") {
// //       const n = Number(dataRoute);
// //       go(Number.isNaN(n) ? dataRoute : n);
// //       return;
// //     }

// //     let text = (clickable.innerText || clickable.textContent || "")
// //       .replace(/\s+/g, " ").trim();
// //     if (!text && clickable.classList.contains("bell")) text = "Notifications";
// //     if (!text && clickable.classList.contains("avatarWrap")) text = "Profile";

// //     const role = getCurrentRole(idx);
// //     const route = routeFromText(text, role, idx, clickable);

// //     if (typeof route === "number" || route === "logout" || route === "help") {
// //       go(route);
// //       return;
// //     }
// //     if (typeof route === "string" && route.startsWith("notify:")) {
// //       notify(route.replace("notify:", ""));
// //       return;
// //     }
// //     notify(text ? `${text.split("\n")[0].slice(0, 45)} clicked` : "Action clicked");
// //   };

// //   return (
// //     <div onClick={handleClick}>
// //       {/* Role switcher (visible after login) */}
// //       {idx >= 2 && (
// //         <div className="demoSwitcher" onClick={(e) => e.stopPropagation()}>
// //           <button className={idx < 16 ? "active" : ""} onClick={() => setIdx(2)}>MR Portal</button>
// //           <button className={idx >= 16 && idx < 21 ? "active" : ""} onClick={() => setIdx(16)}>Manager Portal</button>
// //           <button className={idx >= 21 ? "active" : ""} onClick={() => setIdx(21)}>HO Admin Portal</button>
// //         </div>
// //       )}

// //       {/* Render current page */}
// //       {pages[idx][1]}

// //       {/* Toast notification */}
// //       {toast && (
// //         <div className="toast">
// //           <CheckCircle2 size={18} />
// //           {toast}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import LoginPage from "./pages/LoginPage";
// import MRDashboard from "./pages/MRDashboard";
// import AddDoctor from "./pages/AddDoctor";
// import DoctorList from "./pages/DoctorList";
// import ManagerDashboard from "./pages/ManagerDashboard";
// import SubmittedDoctors from "./pages/SubmittedDoctors";
// import ApprovedDoctors from "./pages/ApprovedDoctors";
// import DraftDoctors from "./pages/DraftDoctors";
// import { ApprovalQueue, DoctorReview } from "./pages/ApprovalQueue";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/mr-dashboard" element={<MRDashboard />} />
//         <Route path="/add-doctor" element={<AddDoctor />} />
//         <Route path="/my-doctors" element={<DoctorList />} />
//         <Route path="/manager-dashboard" element={<ManagerDashboard />} />
//         <Route path="/draft-doctors" element={<DraftDoctors />} />
//         <Route path="/submitted-doctors" element={<SubmittedDoctors />} />
//         <Route path="/approved-doctors" element={<ApprovedDoctors />} />
//         // Manager route
//         <Route path="/manager/approvals" element={<ApprovalQueue />} />
//         // HO route (same component, different role)
//         <Route path="/ho/approvals" element={<ApprovalQueue role="ho" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

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
        <Route path="/manager/calendar-designs" element={<CalendarDesigns role="manager" />} />
<Route path="/ho/calendar-designs" element={<CalendarDesigns role="ho" />} />
        <Route path="/edit-doctor/:doctorId" element={<EditDoctor />} />
        <Route path="/calendar-selection" element={<CalendarMonth />} />
        <Route path="/calendar-design" element={<DesignSelect />} />
        <Route path="/calendar-summary" element={<CalendarSummary />} />
        <Route
          path="/calendar-finalized"
          element={<CalendarSummary finalized />}
        />
        <Route path="/input-given" element={<InputGiven />} />
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
