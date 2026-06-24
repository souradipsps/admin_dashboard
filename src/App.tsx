import { useState, useEffect } from "react";
import { T, font, radius, shadow, transition } from "./theme";
import { useBreakpoint } from "./hooks";
import { NAV, EXISTING_ROLES, POSTINGS, JOB_APPLICATIONS, GENERAL_APPLICATIONS, INTERVIEWS, OFFERS } from "./data";

import Dashboard from "./screens/Dashboard";
import ExistingRoles from "./screens/ExistingRoles";
import RoleRequests from "./screens/RoleRequests";
import JobRequests from "./screens/JobRequests";
import ApprovalRequests from "./screens/ApprovalRequests";
import JobPostings from "./screens/JobPostings";
import Applications from "./screens/Applications";
import InterviewPanel from "./screens/InterviewPanel";
import Panelist from "./screens/Panelist";
import OfferManagement from "./screens/OfferManagement";
import Onboarding from "./screens/Onboarding";

const load = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [active, setActive] = useState("applications");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [roleRequests, setRoleRequests] = useState<any[]>(() => load("roleRequests", []));
  const [jobRequests, setJobRequests] = useState<any[]>(() => load("jobRequests", []));
  const [approvalRequests, setApprovalRequests] = useState<any[]>(() => load("approvalRequests", []));
  const [existingRoles, setExistingRoles] = useState<any[]>(() =>
    load(
      "existingRoles",
      EXISTING_ROLES.map((r) => ({ ...r, currentStatus: r.status, currentFilled: r.filled })),
    ),
  );
  const [jobPostings, setJobPostings] = useState<any[]>(() =>
    load(
      "jobPostings",
      POSTINGS.map((p) => ({ ...p, status: p.status || "Published" })),
    ),
  );
  const [jobApplications, setJobApplications] = useState<any[]>(() => load("jobApplications", JOB_APPLICATIONS));
  const [generalApplications, setGeneralApplications] = useState<any[]>(() => load("generalApplications", GENERAL_APPLICATIONS));
  const [offers, setOffers] = useState<any[]>(() => load("offers", OFFERS));
  const [interviews, setInterviews] = useState<any[]>(() => load("interviews", INTERVIEWS));
  const [panelists, setPanelists] = useState<any[]>(() => load("panelists", [
    "Dr. Roy", "Mr. Patel", "Ms. Nisha", "Mr. Kumar", "Mr. Rajan", "Dr. Ananya"
  ].map(name => ({
    name,
    email: `${name.toLowerCase().replace(". ", "_").replace(" ", "_")}@school.edu`,
    phone: "9876543210"
  }))));
  const [selectedPanelists] = useState<string[]>(() => 
    load("selectedPanelists", ["Dr. Roy", "Mr. Patel", "Ms. Nisha"])
  );
  const [currentUser] = useState<string>(() => 
    load("currentUser", "admin")
  );

  useEffect(() => { localStorage.setItem("roleRequests", JSON.stringify(roleRequests)); }, [roleRequests]);
  useEffect(() => { localStorage.setItem("jobRequests", JSON.stringify(jobRequests)); }, [jobRequests]);
  useEffect(() => { localStorage.setItem("approvalRequests", JSON.stringify(approvalRequests)); }, [approvalRequests]);
  useEffect(() => { localStorage.setItem("existingRoles", JSON.stringify(existingRoles)); }, [existingRoles]);
  useEffect(() => { localStorage.setItem("jobPostings", JSON.stringify(jobPostings)); }, [jobPostings]);
  useEffect(() => { localStorage.setItem("jobApplications", JSON.stringify(jobApplications)); }, [jobApplications]);
  useEffect(() => { localStorage.setItem("generalApplications", JSON.stringify(generalApplications)); }, [generalApplications]);
  useEffect(() => { localStorage.setItem("offers", JSON.stringify(offers)); }, [offers]);
  useEffect(() => { localStorage.setItem("interviews", JSON.stringify(interviews)); }, [interviews]);
  useEffect(() => { localStorage.setItem("panelists", JSON.stringify(panelists)); }, [panelists]);
  useEffect(() => { localStorage.setItem("selectedPanelists", JSON.stringify(selectedPanelists)); }, [selectedPanelists]);
  useEffect(() => { localStorage.setItem("currentUser", JSON.stringify(currentUser)); }, [currentUser]);

  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";
  const isCompact = isMobile || isTablet;

  const handleNav = (id: string) => {
    setActive(id);
    if (isCompact) setSidebarOpen(false);
  };

  const pendingCount = approvalRequests.filter((r) => r.status === "Pending").length;
  const pageLabel = NAV.find((n) => n.id === active)?.label || "";

  const handleGiveOffer = (candidate: any) => {
    const exists = offers.some((o) => o.candidate === candidate.name && o.role === candidate.role);
    if (!exists) {
      const newOffer = {
        id: `OFR-${Date.now()}`,
        candidate: candidate.name,
        role: candidate.role,
        ctc: "",
        issued: "",
        expiry: "",
        joining: "",
        status: "Draft",
      };
      setOffers((prev) => [...prev, newOffer]);
    }
    setActive("offer-management");
  };

  const renderScreen = () => {
    switch (active) {
      case "dashboard":
        return <Dashboard approvalRequests={approvalRequests} />;
      case "existing-roles":
        return <ExistingRoles roles={existingRoles} setRoles={setExistingRoles} />;
      case "role-requests":
        return (
          <RoleRequests
            roleRequests={roleRequests}
            setRoleRequests={setRoleRequests}
            setApprovalRequests={setApprovalRequests}
            existingRoles={existingRoles}
            setExistingRoles={setExistingRoles}
            onNavigateToExistingRoles={() => setActive("existing-roles")}
          />
        );
      case "job-requests":
        return (
          <JobRequests
            jobRequests={jobRequests}
            setJobRequests={setJobRequests}
            approvalRequests={approvalRequests}
            setApprovalRequests={setApprovalRequests}
            jobPostings={jobPostings}
            setJobPostings={setJobPostings}
            existingRoles={existingRoles}
            onNavigateToApplications={() => setActive("applications")}
          />
        );
      case "approval-requests":
        return (
          <ApprovalRequests
            requests={approvalRequests}
            setRequests={setApprovalRequests}
            existingRoles={existingRoles}
            setExistingRoles={setExistingRoles}
            jobPostings={jobPostings}
            setJobPostings={setJobPostings}
            setRoleRequests={setRoleRequests}
            setJobRequests={setJobRequests}
            onNavigateToApplications={() => setActive("applications")}
            onNavigateToExistingRoles={() => setActive("existing-roles")}
          />
        );
      case "job-postings":
        return (
          <JobPostings
            postings={jobPostings}
            setPostings={setJobPostings}
            jobRequests={jobRequests}
            existingRoles={existingRoles}
          />
        );
      case "applications":
        return (
          <Applications
            jobApplications={jobApplications}
            setJobApplications={setJobApplications}
            generalApplications={generalApplications}
            setGeneralApplications={setGeneralApplications}
            jobPostings={jobPostings}
            jobRequests={jobRequests}
          />
        );
      case "interview-panel":
        return (
          <InterviewPanel
            jobApplications={jobApplications}
            generalApplications={generalApplications}
            jobPostings={jobPostings}
            interviews={interviews}
            setInterviews={setInterviews}
            panelists={panelists}
            setPanelists={setPanelists}
            onGiveOffer={handleGiveOffer}
          />
        );
      case "panelist":
        return (
          <Panelist
            interviews={interviews}
            setInterviews={setInterviews}
            jobPostings={jobPostings}
            currentUser={currentUser}
          />
        );
      case "offer-management":
        return <OfferManagement offers={offers} setOffers={setOffers} jobPostings={jobPostings} />;
      case "onboarding":
        return <Onboarding jobPostings={jobPostings} offers={offers} />;
      default:
        return <Dashboard approvalRequests={approvalRequests} />;
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo & brand */}
      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: radius.lg - 2, 
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: 17, fontWeight: font.black, color: "#fff",
              boxShadow: shadow.accent,
            }}
          >
            S
          </div>
          <div>
            <div style={{ fontSize: font.base, fontWeight: font.extrabold, fontFamily: font.heading, color: "#fff", letterSpacing: "-0.01em" }}>South Point</div>
            <div style={{ fontSize: font.xs, fontFamily: font.body, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>School · HR Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        {NAV.map((item, idx) => {
          const isActive = active === item.id;
          const itemPending = item.id === "approval-requests" ? pendingCount : 0;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`sidebar-item ${isActive ? "active" : ""} animate-slide-in`}
              style={{
                display: "flex", alignItems: "center", gap: 11, width: "100%",
                padding: "10px 14px", borderRadius: radius.md + 1, border: "none",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                color: "#fff", 
                fontWeight: isActive ? font.bold : font.medium, 
                fontSize: font.base,
                fontFamily: font.body,
                cursor: "pointer", textAlign: "left",
                marginBottom: 2,
                letterSpacing: "-0.01em",
                animationDelay: `${idx * 0.03}s`,
              }}
            >
              <span style={{ 
                fontSize: font.md, 
                opacity: isActive ? 1 : 0.7, 
                transition: transition.fast,
                transform: isActive ? "scale(1.15)" : "scale(1)",
                display: "inline-block",
              }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {itemPending > 0 && (
                <span
                  className="badge-pulse"
                  style={{
                    background: `linear-gradient(135deg, ${T.accent}, ${T.accentDark})`,
                    color: "#fff", borderRadius: radius.full,
                    padding: "2px 8px", fontSize: font.xs, fontWeight: font.extrabold,
                    minWidth: 20, textAlign: "center",
                  }}
                >
                  {itemPending}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: "50%", 
              background: "linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))",
              display: "flex", alignItems: "center", justifyContent: "center", 
              fontSize: font.sm, fontWeight: font.bold, fontFamily: font.body, color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            HR
          </div>
          <div>
            <div style={{ fontSize: font.sm + 1, fontWeight: font.bold, fontFamily: font.body, color: "#fff" }}>HR Admin</div>
            <div style={{ fontSize: font.xs, fontFamily: font.body, color: "rgba(255,255,255,0.5)" }}>hr@southpoint.edu</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: T.canvas, fontFamily: font.body }}>
      {/* Desktop sidebar */}
      {!isCompact && (
        <div style={{ 
          width: 240, 
          background: `linear-gradient(180deg, ${T.primary} 0%, ${T.primaryDark} 100%)`, 
          display: "flex", flexDirection: "column", flexShrink: 0,
          boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
        }}>
          <SidebarContent />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isCompact && sidebarOpen && (
        <>
          <div
            className="modal-backdrop"
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="sidebar-slide-in"
            style={{
              position: "fixed", top: 0, left: 0, bottom: 0, width: 270,
              background: `linear-gradient(180deg, ${T.primary} 0%, ${T.primaryDark} 100%)`, 
              display: "flex", flexDirection: "column", zIndex: 201,
              boxShadow: "8px 0 32px rgba(0,0,0,0.25)",
            }}
          >
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar — glassmorphism style */}
        <div
          style={{
            background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryMid} 100%)`,
            borderBottom: `2px solid ${T.accent}`,
            padding: "0 24px", height: 60, display: "flex", alignItems: "center",
            justifyContent: "space-between", flexShrink: 0,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          {/* Left: hamburger (mobile) + school branding */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 16 }}>
            {isCompact && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="btn-hover"
                style={{ 
                  background: "rgba(255,255,255,0.08)", 
                  border: "1px solid rgba(255,255,255,0.15)", 
                  borderRadius: radius.md,
                  cursor: "pointer", padding: "6px 8px", 
                  color: T.canvas, fontSize: 18, lineHeight: 1,
                  transition: transition.fast,
                }}
              >
                ☰
              </button>
            )}
            <img
              src="/images-removebg-preview.png"
              alt="South Point School Logo"
              style={{ height: isMobile ? 36 : 44, width: "auto", objectFit: "contain", flexShrink: 0 }}
            />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{
                fontSize: isMobile ? font.base : font.lg,
                fontWeight: font.extrabold, 
                fontFamily: font.heading,
                color: T.accent,
                letterSpacing: "-0.01em", lineHeight: 1.2,
              }}>
                South Point School
              </div>
              <div style={{
                fontSize: isMobile ? 9 : font.xs,
                fontWeight: font.semibold,
                fontFamily: font.body,
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.3, marginTop: 1,
              }}>
                Guwahati, Assam
              </div>
            </div>
          </div>

          {/* Right: page label + pending */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!isMobile && (
              <span style={{ 
                fontSize: font.base, fontWeight: font.semibold, fontFamily: font.body,
                color: "rgba(255,255,255,0.75)", letterSpacing: "-0.01em",
              }}>
                {pageLabel}
              </span>
            )}
            {pendingCount > 0 && (
              <button
                onClick={() => handleNav("approval-requests")}
                className="btn-hover badge-pulse"
                style={{
                  background: "rgba(201,168,76,0.15)", 
                  border: `1px solid rgba(201,168,76,0.4)`,
                  borderRadius: radius.full, padding: "5px 14px", 
                  fontSize: font.sm, fontWeight: font.bold, 
                  fontFamily: font.body,
                  color: T.accent,
                  cursor: "pointer",
                  transition: transition.fast,
                }}
              >
                {pendingCount} Pending
              </button>
            )}
          </div>
        </div>

        {/* Page content — with entrance animation on tab switch */}
        <div 
          key={active}
          className="animate-fade-in-up"
          style={{ flex: 1, overflowY: "auto", padding: isMobile ? "18px 14px" : "28px 32px" }}
        >
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
