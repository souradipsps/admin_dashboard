export const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "existing-roles", label: "Existing Roles", icon: "◧" },
  { id: "role-requests", label: "Role Requests", icon: "◈" },
  { id: "job-requests", label: "Job Requests", icon: "◉" },
  { id: "approval-requests", label: "Approve Request", icon: "◎" },
  { id: "applications", label: "Applications", icon: "☰" },
  { id: "job-postings", label: "Job Postings", icon: "◆" },
  { id: "interview-panel", label: "Interview Panel", icon: "◐" },
  {
  id: "panelist",
  label: "Panelist",
  icon: "◐",
},
  { id: "offer-management", label: "Offer Management", icon: "◑" },
  { id: "onboarding", label: "Onboarding", icon: "◒" },
];

export const EXISTING_ROLES = [
  { id: "ROL-001", dept: "Science", role: "Mathematics Teacher", type: "Full-time", headcount: 4, filled: 3, status: "Active", experience: "3-5", salaryRange: "40,000-60,000" },
  { id: "ROL-002", dept: "Science", role: "Physics Teacher", type: "Full-time", headcount: 2, filled: 2, status: "Active", experience: "3-5", salaryRange: "40,000-60,000" },
  { id: "ROL-003", dept: "Science", role: "Chemistry Teacher", type: "Full-time", headcount: 2, filled: 1, status: "Inactive", experience: "2-4", salaryRange: "35,000-50,000" },
  { id: "ROL-004", dept: "Science", role: "Lab Assistant", type: "Part-time", headcount: 3, filled: 0, status: "Inactive", experience: "1-2", salaryRange: "18,000-25,000" },
  { id: "ROL-005", dept: "Commerce", role: "Accountancy Teacher", type: "Full-time", headcount: 3, filled: 3, status: "Active", experience: "3-5", salaryRange: "40,000-60,000" },
  { id: "ROL-006", dept: "Commerce", role: "Business Studies Teacher", type: "Full-time", headcount: 2, filled: 1, status: "Inactive", experience: "3-5", salaryRange: "40,000-60,000" },
  { id: "ROL-007", dept: "Arts", role: "Drawing Teacher", type: "Full-time", headcount: 2, filled: 2, status: "Active", experience: "2-4", salaryRange: "30,000-45,000" },
  { id: "ROL-008", dept: "Arts", role: "Music Teacher", type: "Part-time", headcount: 1, filled: 0, status: "Inactive", experience: "2-4", salaryRange: "25,000-35,000" },
  { id: "ROL-009", dept: "Administration", role: "Office Coordinator", type: "Full-time", headcount: 2, filled: 1, status: "Inactive", experience: "2-4", salaryRange: "25,000-35,000" },
  { id: "ROL-010", dept: "Administration", role: "Receptionist", type: "Full-time", headcount: 1, filled: 1, status: "Active", experience: "1-3", salaryRange: "20,000-30,000" },
  { id: "ROL-011", dept: "Sports", role: "Physical Education Teacher", type: "Full-time", headcount: 2, filled: 2, status: "Active", experience: "2-4", salaryRange: "35,000-50,000" },
  { id: "ROL-012", dept: "Languages", role: "Hindi Teacher", type: "Full-time", headcount: 3, filled: 2, status: "Inactive", experience: "3-5", salaryRange: "38,000-55,000" },
  { id: "ROL-013", dept: "Languages", role: "English Teacher", type: "Full-time", headcount: 4, filled: 4, status: "Active", experience: "3-5", salaryRange: "40,000-60,000" },
];

export const ROLE_REQUESTS = [
  { id: "RR-2026-0001", dept: "Science", role: "Mathematics Teacher", just: "Teacher resigned effective 30 Jun", status: "Pending", date: "2026-06-01" },
  { id: "RR-2026-0002", dept: "Administration", role: "Office Coordinator", just: "New branch opening — workload increase", status: "Approved", date: "2026-05-28" },
  { id: "RR-2026-0003", dept: "Commerce", role: "Accountancy Teacher", just: "Batch enrollment exceeds faculty capacity", status: "Rejected", date: "2026-05-20" },
  { id: "RR-2026-0004", dept: "Arts", role: "Drawing Teacher", just: "Existing teacher retiring in July", status: "Pending", date: "2026-06-08" },
];

export const JOB_REQUESTS = [
  { id: "JR-2026-0001", role: "Mathematics Teacher", vac: 2, exp: "3–5 yrs", sal: "₹40K–₹60K", type: "Full-time", qual: "M.Sc + B.Ed", status: "Pending" },
  { id: "JR-2026-0002", role: "Office Coordinator", vac: 1, exp: "2–4 yrs", sal: "₹25K–₹35K", type: "Full-time", qual: "Graduate", status: "Approved" },
  { id: "JR-2026-0003", role: "Lab Assistant", vac: 3, exp: "1–2 yrs", sal: "₹18K–₹24K", type: "Part-time", qual: "B.Sc", status: "Pending" },
];

export const APPROVALS = [
  {
    id: "JR-2026-0001", type: "Job Request", title: "Mathematics Teacher", dept: "Science",
    by: "Dr. Ananya Roy", date: "2026-06-02", status: "Pending",
    history: [{ act: "Submitted", by: "Dr. Ananya Roy", date: "2026-06-02", note: "" }],
  },
  {
    id: "JR-2026-0003", type: "Job Request", title: "Lab Assistant ×3", dept: "Science",
    by: "Mr. Rajan Mehta", date: "2026-06-05", status: "Pending",
    history: [{ act: "Submitted", by: "Mr. Rajan Mehta", date: "2026-06-05", note: "" }],
  },
  {
    id: "RR-2026-0001", type: "Role Request", title: "Mathematics Teacher Role", dept: "Science",
    by: "Dr. Ananya Roy", date: "2026-06-01", status: "Sent Back",
    history: [
      { act: "Submitted", by: "Dr. Ananya Roy", date: "2026-06-01", note: "" },
      { act: "Sent Back", by: "Principal", date: "2026-06-03", note: "Please attach resignation letter copy." },
    ],
  },
];

export const POSTINGS = [
  { id: "JP-2026-0001", role: "Mathematics Teacher", channel: "External", status: "Published", posted: "2026-06-04", expiry: "2026-07-04", apps: 14 },
  { id: "JP-2026-0002", role: "Office Coordinator", channel: "Internal", status: "Published", posted: "2026-05-30", expiry: "2026-06-30", apps: 5 },
  { id: "JP-2026-0003", role: "Hindi Teacher", channel: "External", status: "Unpublished", posted: "—", expiry: "—", apps: 0 },
];

export const JOB_APPLICATIONS = [
  { id: "JAPP-2026-0001", name: "Priya Sharma", email: "priya.sharma@email.com", phone: "9876543210", role: "Mathematics Teacher", jobPostingId: "JP-2026-0001", exp: "4 yrs", qualification: "M.Sc + B.Ed", applied: "2026-06-05", status: "Shortlisted", referredBy: "Dr. Roy", resume: "https://example.com/resumes/priya-sharma.pdf" },
  { id: "JAPP-2026-0002", name: "Arjun Das", email: "arjun.das@email.com", phone: "9876543211", role: "Mathematics Teacher", jobPostingId: "JP-2026-0001", exp: "3 yrs", qualification: "M.Sc + B.Ed", applied: "2026-06-06", status: "Applied", referredBy: "None", resume: "https://example.com/resumes/arjun-das.pdf" },
  { id: "JAPP-2026-0005", name: "Sonal Verma", email: "sonal.verma@email.com", phone: "9876543214", role: "Office Coordinator", jobPostingId: "JP-2026-0002", exp: "3 yrs", qualification: "MBA", applied: "2026-06-02", status: "Selected", referredBy: "Mr. Patel", resume: "https://example.com/resumes/sonal-verma.pdf" },
  { id: "JAPP-2026-0006", name: "Deepak Nair", email: "deepak.nair@email.com", phone: "9876543215", role: "Mathematics Teacher", jobPostingId: "JP-2026-0001", exp: "1 yr", qualification: "M.Sc", applied: "2026-06-08", status: "Rejected", referredBy: "None", resume: "https://example.com/resumes/deepak-nair.pdf" },
];

export const GENERAL_APPLICATIONS = [
  { id: "GAPP-2026-0001", name: "Ritu Patel", email: "ritu.patel@email.com", phone: "9123456780", preferredRole: "Chemistry Teacher", preferredDept: "Science", exp: "6 yrs", qualification: "M.Sc + B.Ed", applied: "2026-06-03", status: "Applied", resume: "https://example.com/resumes/ritu-patel.pdf" },
  { id: "GAPP-2026-0003", name: "Anita Deshmukh", email: "anita.d@email.com", phone: "9123456782", preferredRole: "English Teacher", preferredDept: "Languages", exp: "8 yrs", qualification: "M.A + B.Ed", applied: "2026-06-05", status: "Shortlisted", resume: "https://example.com/resumes/anita-deshmukh.pdf" },
  { id: "GAPP-2026-0004", name: "Suresh Menon", email: "suresh.m@email.com", phone: "9123456783", preferredRole: "Physical Education Teacher", preferredDept: "Sports", exp: "3 yrs", qualification: "B.P.Ed", applied: "2026-06-09", status: "Applied", resume: "https://example.com/resumes/suresh-menon.pdf" },
  { id: "GAPP-2026-0005", name: "Nisha Agarwal", email: "nisha.a@email.com", phone: "9123456784", preferredRole: "Music Teacher", preferredDept: "Arts", exp: "5 yrs", qualification: "M.A Music", applied: "2026-06-10", status: "Applied", resume: "https://example.com/resumes/nisha-agarwal.pdf" },
];

export const INTERVIEWS = [
  { id: "INT-2026-0001", candidate: "Priya Sharma", role: "Mathematics Teacher", date: "2026-06-12", time: "10:00 AM", panel: ["Dr. Roy", "Mr. Patel"], score: 87, rec: "Selected", status: "Completed", mode: "Online", meetingLink: "https://meet.google.com/abc-mnop-xyz", round: 1 },
];

export const OFFERS = [
  { id: "OFR-2026-0001", candidate: "Priya Sharma", role: "Mathematics Teacher", ctc: "₹52,000/mo", issued: "2026-06-15", expiry: "2026-06-22", status: "Sent" },
  { id: "OFR-2026-0002", candidate: "Sonal Verma", role: "Office Coordinator", ctc: "₹30,000/mo", issued: "2026-06-10", expiry: "2026-06-17", status: "Accepted" },
  { id: "OFR-2026-0003", candidate: "Amit Joshi", role: "Hindi Teacher", ctc: "₹38,000/mo", issued: "2026-05-28", expiry: "2026-06-04", status: "Expired" },
];

export const ONBOARDING = [
  {
    id: "ONB-2026-0001", name: "Sonal Verma", role: "Office Coordinator", joining: "2026-07-01", empId: "—",
    status: "Documents Pending",
    tasks: { profile: false, offer: false, docsUpload: false, docsVerify: false, bgc: false, checkin: false },
  },
  {
    id: "ONB-2026-0002", name: "Rahul Singh", role: "Physics Teacher", joining: "2026-06-16", empId: "EMP-2026-042",
    status: "Completed",
    tasks: { profile: true, offer: true, docsUpload: true, docsVerify: true, bgc: true, checkin: true },
  },
];

export const ROLE_OPTIONS = [...new Set(EXISTING_ROLES.map((r) => r.role))].map((r) => ({ value: r, label: r }));
export const DEPT_OPTIONS = [...new Set(EXISTING_ROLES.map((r) => r.dept))].map((d) => ({ value: d, label: d }));
export const VACANCY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => ({ value: String(n), label: String(n) }));
export const EXP_OPTIONS = [
  { value: "0–1 yrs", label: "0–1 years" },
  { value: "1–2 yrs", label: "1–2 years" },
  { value: "2–4 yrs", label: "2–4 years" },
  { value: "3–5 yrs", label: "3–5 years" },
  { value: "5–8 yrs", label: "5–8 years" },
  { value: "8+ yrs", label: "8+ years" },
];
export const QUAL_OPTIONS = [
  { value: "Graduate", label: "Graduate" },
  { value: "Post Graduate", label: "Post Graduate" },
  { value: "B.Ed", label: "B.Ed" },
  { value: "M.Ed", label: "M.Ed" },
  { value: "B.Sc", label: "B.Sc" },
  { value: "M.Sc", label: "M.Sc" },
  { value: "M.Sc + B.Ed", label: "M.Sc + B.Ed" },
  { value: "B.A + B.Ed", label: "B.A + B.Ed" },
  { value: "M.A + B.Ed", label: "M.A + B.Ed" },
  { value: "MBA", label: "MBA" },
  { value: "B.Com + B.Ed", label: "B.Com + B.Ed" },
  { value: "Ph.D", label: "Ph.D" },
];
export const TYPE_OPTIONS = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];
export const SALARY_OPTIONS = [
  { value: "₹10K–₹15K", label: "₹10,000 – ₹15,000" },
  { value: "₹15K–₹20K", label: "₹15,000 – ₹20,000" },
  { value: "₹18K–₹24K", label: "₹18,000 – ₹24,000" },
  { value: "₹20K–₹30K", label: "₹20,000 – ₹30,000" },
  { value: "₹25K–₹35K", label: "₹25,000 – ₹35,000" },
  { value: "₹30K–₹45K", label: "₹30,000 – ₹45,000" },
  { value: "₹40K–₹60K", label: "₹40,000 – ₹60,000" },
  { value: "₹50K–₹70K", label: "₹50,000 – ₹70,000" },
  { value: "₹60K–₹80K", label: "₹60,000 – ₹80,000" },
  { value: "₹80K–₹1L", label: "₹80,000 – ₹1,00,000" },
  { value: "₹1L+", label: "₹1,00,000+" },
];
