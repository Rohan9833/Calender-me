export function cls(...a) {
  return a.filter(Boolean).join(" ");
}

export const BLUE = "#0b55f4";
export const NAVY = "#06185f";
export const palette = [
  "#2563eb","#16a34a","#f59e0b","#ef4444","#8b5cf6","#06b6d4",
];

export const mrDoctors = [
  ["Dr. Rajesh Shah","Cardiologist","MCL10291","Mumbai","Amit Sharma"],
  ["Dr. Priya Patel","Dermatologist","MCL10345","Andheri","Amit Sharma"],
  ["Dr. Amit Mehta","Diabetologist","MCL10412","Borivali","Amit Sharma"],
  ["Dr. Neha Kulkarni","Physician","MCL10478","Kandivali","Amit Sharma"],
  ["Dr. Sandeep Gupta","Orthopedic","MCL10531","Malad","Amit Sharma"],
  ["Dr. Smita More","Gynaecologist","MCL10590","Goregaon","Amit Sharma"],
  ["Dr. Arjun Kapoor","ENT Specialist","MCL10622","Jogeshwari","Amit Sharma"],
  ["Dr. Vikram Bhatia","Neurologist","MCL10675","Andheri","Amit Sharma"],
];

export const managerDoctors = [
  ["Dr. Ketan Desai","Orthopedic","MCL10567","Amit Sharma","20 May 2026, 04:50 PM","Same Day"],
  ["Dr. Riddhi Mehta","Dermatologist","MCL10345","Rahul Verma","20 May 2026, 03:15 PM","Same Day"],
  ["Dr. Nilesh Shah","Cardiologist","MCL10291","Amit Sharma","19 May 2026, 11:20 AM","1 Day"],
  ["Dr. Pooja Iyer","Gynecologist","MCL10789","Neha Singh","19 May 2026, 10:05 AM","1 Day"],
  ["Dr. Vivek Patil","Pediatrician","MCL10812","Vikas Patel","18 May 2026, 02:40 PM","2 Days"],
  ["Dr. Snehal Kulkarni","ENT Specialist","MCL10678","Suresh Yadav","18 May 2026, 10:20 AM","2 Days"],
  ["Dr. Anjali Patel","Diabetologist","MCL10412","Rahul Verma","17 May 2026, 04:35 PM","3 Days"],
  ["Dr. Mayur Joshi","General Physician","MCL10901","Pooja Mehta","17 May 2026, 11:10 AM","3 Days"],
];

export const mrs = [
  "Amit Sharma","Rahul Verma","Neha Singh","Vikas Patel","Suresh Yadav",
  "Priya Patel","Anil Mehta","Karan Shah","Deepak Gupta","Manoj Tiwari",
];

export const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export const navByRole = {
  mr: [
    ["Dashboard","LayoutDashboard"],
    ["Add Doctor","UserPlus"],
    ["My Doctors","Users"],
    ["Calendar Selection","CalendarDays"],
    ["Input Given","Hand"],
    ["Reports","BarChart3"],
  ],
  manager: [
    ["Dashboard","LayoutDashboard"],
    ["Doctor Approvals","ClipboardList"],
    ["My Team","Users"],
    ["Reports","BarChart3"],
    ["Pending Actions","Clock3"],
    ["Calendar Designs","ImageIcon"],
    ["Activity Log","FileText"],
  ],
  ho: [
    ["Dashboard","LayoutDashboard"],
    ["Doctor Approvals","ClipboardList"],
    ["Campaign Funnel","Filter"],
    ["Calendar Designs","ImageIcon"],
    ["Consent & Input Tracker","Users"],
    ["Reports","BarChart3"],
    ["Hierarchy","Building2"],
    ["Users Management","Users"],
    ["Activity Log","FileText"],
    ["System Settings","Settings"],
  ],
};

export function routeIndexFor(role, label) {
  const maps = {
    mr: {
      Dashboard: 2,"Add Doctor": 3,"My Doctors": 6,"Calendar Selection": 9,
      "Input Given": 13, Reports: 7,
    },
    manager: {
      Dashboard: 16,"Doctor Approvals": 17,"My Team": 19, Reports: 20,
      "Pending Actions": 20,"Calendar Designs": 20,"Activity Log": 20,
    },
    ho: {
      Dashboard: 21,"Doctor Approvals": 22,"Campaign Funnel": 24,
      "Calendar Designs": 24,"Consent & Input Tracker": 28, Reports: 24,
      Hierarchy: 26,"Users Management": 21,"Activity Log": 28,"System Settings": 21,
    },
  };
  return maps[role]?.[label] ?? null;
}

export function getCurrentRole(idx) {
  if (idx >= 21) return "ho";
  if (idx >= 16) return "manager";
  return "mr";
}

export function routeFromText(text, role, currentIdx, el) {
  const lower = text.toLowerCase();

  if (lower.includes("forgot password")) return 1;
  if (lower.includes("back to login")) return 0;
  if (lower.includes("sign in") || lower.includes("login with sso")) return 2;
  if (lower.includes("logout")) return "logout";
  if (lower.includes("notification")) return "notify:Notifications opened";
  if (lower.includes("profile")) return "notify:Profile menu opened";
  if (lower.includes("help")) return "help";
  if (lower.includes("mumbai west") || lower.includes("all india"))
    return "notify:Location selector opened";
  if (lower.includes("amit sharma") || lower.includes("sandeep mehta") || lower.includes("ho admin"))
    return "notify:Profile menu opened";

  if (lower.includes("go to dashboard"))
    return role === "ho" ? 21 : role === "manager" ? 16 : 2;
  if (lower.includes("back to summary")) return 11;
  if (lower.includes("back to months")) return 9;
  if (lower.includes("back to input given list")) return 13;
  if (lower.includes("back to queue")) return role === "ho" ? 22 : 17;
  if (lower.includes("download") || lower.includes("export excel") || lower === "export")
    return "notify:Download / export started";
  if (lower.includes("apply filters")) return "notify:Filters applied";
  if (lower.includes("clear filters") || lower === "clear") return "notify:Filters cleared";
  if (lower.includes("cancel"))
    return currentIdx === 8 ? 7 : currentIdx === 14 ? 13 : currentIdx;
  if (lower.includes("preview")) return "notify:Design preview opened";

  if (role === "mr") {
    if (lower === "dashboard" || lower.includes("mr dashboard")) return 2;
    if (lower.includes("add new doctor") || lower === "add doctor") return 3;
    if (lower.includes("save as draft")) return 4;
    if (lower.includes("submit for approval")) return 5;
    if (lower.includes("draft doctors")) return 4;
    if (lower.includes("submitted doctors")) return 5;
    if (lower.includes("approved doctors") || lower === "my doctors") return 6;
    if (lower.includes("send consent") || lower.includes("consent pending")) return 8;
    if (lower.includes("send reset instructions")) return 0;
    if (lower.includes("view / upload photo") || lower.includes("upload doctor photo") || lower.includes("photo pending")) return 7;
    if (lower.includes("select design") || lower.includes("change design")) return 10;
    if (lower.includes("calendar selection")) return 9;
    if (lower.includes("save january selection")) return 11;
    if (lower.includes("freeze calendar") || lower.includes("finalize calendar")) return 12;
    if (lower.includes("mark input given")) return 13;
    if (lower.includes("confirm input given")) return 15;
    if (lower.includes("input given"))
      return currentIdx === 13 ? 14 : currentIdx === 14 ? 15 : 13;
    if (lower.includes("my reports") || lower === "reports") return 7;
    if (lower.includes("view timeline") || lower.includes("view details") || lower === "view" || lower.includes("dr.")) return 7;
  }

  if (role === "manager") {
    if (lower === "dashboard" || lower.includes("manager dashboard")) return 16;
    if (lower.includes("doctor approvals") || lower.includes("approval queue") || lower.includes("doctors awaiting approval")) return 17;
    if (lower.includes("approve") || lower.includes("reject") || lower.includes("send back") || lower.includes("review") || lower.includes("dr.")) return 18;
    if (lower.includes("my team") || lower.includes("mr-wise progress") || lower.includes("view all") || lower.includes("view full mr-wise")) return 19;
    if (lower.includes("pending actions") || lower.includes("team delay") || lower.includes("overdue") || lower.includes("input given pending") || lower === "reports") return 20;
    if (lower.includes("calendar designs")) return "notify:Calendar design library is outside current 29-screen scope";
    if (lower.includes("activity log")) return 20;
  }

  if (role === "ho") {
    if (lower === "dashboard" || lower.includes("ho national dashboard")) return 21;
    if (lower.includes("doctor approval queue") || lower.includes("doctor approvals") || lower.includes("approval queue")) return 22;
    if (lower.includes("approve doctor") || lower.includes("reject doctor") || lower.includes("send back") || lower.includes("review") || lower.includes("dr.")) return 23;
    if (lower.includes("campaign funnel") || lower.includes("approval summary") || lower === "reports" || lower.includes("export reports")) return 24;
    if (lower.includes("approval trend")) return 25;
    if (lower.includes("hierarchy-wise") || lower === "hierarchy") return 26;
    if (lower.includes("mr-wise")) return 27;
    if (lower.includes("pending action") || lower.includes("overdue") || lower.includes("consent") || lower.includes("input tracker") || lower.includes("activity log")) return 28;
    if (lower.includes("view zone wise report")) return 26;
    if (lower.includes("calendar design library") || lower.includes("calendar designs")) return "notify:Calendar design library was removed from this version after Screen 29";
    if (lower.includes("users management") || lower.includes("system settings")) return "notify:This admin setting is outside the current 29-screen prototype";
  }

  if (el && el.tagName === "TR") {
    if (role === "manager") return currentIdx === 17 ? 18 : currentIdx === 19 ? 20 : 18;
    if (role === "ho") return currentIdx === 22 ? 23 : currentIdx >= 24 ? 28 : 23;
    return 7;
  }

  return null;
}