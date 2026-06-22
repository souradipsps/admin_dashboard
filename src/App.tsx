import React, { useState, useEffect } from "react";
import { T } from "./theme";
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
  const [active, setActive] = useState("dashboard");
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
  const [selectedPanelists, setSelectedPanelists] = useState<string[]>(() => 
    load("selectedPanelists", ["Dr. Roy", "Mr. Patel", "Ms. Nisha"])
  );
  const [currentUser, setCurrentUser] = useState<string>(() => 
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
            onNavigateToJobPostings={() => setActive("job-postings")}
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
            existingRoles={existingRoles}
            addOffer={(offer: any) => setOffers((prev) => [...prev, offer])}
          />
        );
      case "interview-panel":
        return (
          <InterviewPanel
            jobApplications={jobApplications}
            setJobApplications={setJobApplications}
            generalApplications={generalApplications}
            setGeneralApplications={setGeneralApplications}
            jobPostings={jobPostings}
            interviews={interviews}
            setInterviews={setInterviews}
            panelists={panelists}
            setPanelists={setPanelists}
            selectedPanelists={selectedPanelists}
            setSelectedPanelists={setSelectedPanelists}
            currentUser={currentUser}
          />
        );
      case "panelist":
        return (
          <Panelist
            interviews={interviews}
            setInterviews={setInterviews}
            jobPostings={jobPostings}
            panelists={panelists}
            selectedPanelists={selectedPanelists}
            currentUser={currentUser}
          />
        );
      case "offer-management":
        return <OfferManagement offers={offers} setOffers={setOffers} jobPostings={jobPostings} />;
      case "onboarding":
        return <Onboarding jobPostings={jobPostings} />;
      default:
        return <Dashboard approvalRequests={approvalRequests} />;
    }
  };

  const SidebarContent = () => (
    <>
      <div style={{ padding: "20px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10, background: T.accent,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff",
            }}
          >
            S
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>South Point</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>School · HR</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
        {NAV.map((item) => {
          const isActive = active === item.id;
          const itemPending = item.id === "approval-requests" ? pendingCount : 0;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "9px 12px", borderRadius: 9, border: "none",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                color: "#fff", fontWeight: isActive ? 700 : 400, fontSize: 13,
                cursor: "pointer", textAlign: "left",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 14, opacity: 0.85 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {itemPending > 0 && (
                <span
                  style={{
                    background: T.accent, color: "#fff", borderRadius: 99,
                    padding: "1px 7px", fontSize: 10, fontWeight: 800,
                  }}
                >
                  {itemPending}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff",
            }}
          >
            HR
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>HR Admin</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>hr@southpoint.edu</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: T.canvas, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Desktop sidebar */}
      {!isCompact && (
        <div style={{ width: 230, background: T.primary, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <SidebarContent />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isCompact && sidebarOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            style={{
              position: "fixed", top: 0, left: 0, bottom: 0, width: 260,
              background: T.blue, display: "flex", flexDirection: "column", zIndex: 201,
            }}
          >
            <SidebarContent />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div
          style={{
            background: T.primary,
            borderBottom: `2px solid ${T.accent}`,
            padding: "0 20px", height: 58, display: "flex", alignItems: "center",
            justifyContent: "space-between", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.22)",
          }}
        >
          {/* Left: hamburger (mobile) + school branding */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14 }}>
            {isCompact && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: T.canvas, fontSize: 20, lineHeight: 1 }}
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
                fontSize: isMobile ? 13 : 15, fontWeight: 800, color: T.accent,
                letterSpacing: "0.01em", lineHeight: 1.2,
              }}>
                South Point School
              </div>
              <div style={{
                fontSize: isMobile ? 9 : 10, fontWeight: 600, color: T.canvas,
                textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1.3, marginTop: 1,
                opacity: 0.85,
              }}>
                Guwahati, Assam
              </div>
            </div>
          </div>

          {/* Right: page label + pending */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!isMobile && (
              <span style={{ fontSize: 13, fontWeight: 600, color: T.canvas, opacity: 0.85 }}>{pageLabel}</span>
            )}
            {pendingCount > 0 && (
              <button
                onClick={() => handleNav("approval-requests")}
                style={{
                  background: "rgba(201,168,76,0.18)", border: `1px solid ${T.accent}`,
                  borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, color: T.accent,
                  cursor: "pointer",
                }}
              >
                {pendingCount} Pending
              </button>
            )}
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 12px" : "24px 28px" }}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
