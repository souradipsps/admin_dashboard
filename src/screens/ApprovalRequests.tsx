import React, { useState, useRef } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Btn, Input, Badge, Mono } from "../components/ui";
import { QUAL_OPTIONS, TYPE_OPTIONS, VACANCY_OPTIONS } from "../data";

interface ApprovalRequestsProps {
  requests: any[];
  setRequests: React.Dispatch<React.SetStateAction<any[]>>;
  existingRoles: any[];
  setExistingRoles: React.Dispatch<React.SetStateAction<any[]>>;
  jobPostings: any[];
  setJobPostings: React.Dispatch<React.SetStateAction<any[]>>;
  setRoleRequests: React.Dispatch<React.SetStateAction<any[]>>;
  setJobRequests: React.Dispatch<React.SetStateAction<any[]>>;
  onNavigateToApplications?: () => void;
  onNavigateToExistingRoles?: () => void;
}

const labelCss: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase",
  letterSpacing: "0.06em", marginBottom: 4,
};

export default function ApprovalRequests({ requests, setRequests, setExistingRoles, setJobPostings, setRoleRequests, setJobRequests, onNavigateToApplications, onNavigateToExistingRoles }: ApprovalRequestsProps) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const [sel, setSel] = useState<any>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const avatar = (name: string, size = 48, fs = 16) => {
    const val = name || "RQ";
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "rgba(255,255,255,0.15)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: fs, flexShrink: 0,
        border: "1px solid rgba(255,255,255,0.25)"
      }}>
        {val.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
      </div>
    );
  };

  const parseSal = (v: string) => parseFloat((v || "").replace(/,/g, "")) || 0;

  const filtered = requests
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        (r.role || "").toLowerCase().includes(q) ||
        (r.dept || "").toLowerCase().includes(q) ||
        (String(r.sourceId) || "").toLowerCase().includes(q) ||
        (r.requestedBy || "").toLowerCase().includes(q) ||
        (r.date || "").toLowerCase().includes(q)
      );
    });

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  const openModal = (r: any) => { setSel(r); setComment(""); setFieldErrors({}); };
  const closeModal = () => { setSel(null); setComment(""); setFieldErrors({}); };

  const performAction = (r: any, action: "Approved" | "Rejected" | "Sent Back", customComment?: string) => {
    const now = new Date().toLocaleDateString();
    const entry = { act: action, by: "HR Admin", date: now, note: customComment || "" };
    const updated = { ...r, status: action, comment: customComment || "", history: [...(r.history || []), entry] };

    setRequests((prev) => prev.map((item) => (item.id === r.id ? updated : item)));

    if (r.type === "Role Request") {
      setRoleRequests((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(r.sourceId)) return item;
          const updated2 = {
            ...item,
            dept: r.dept,
            role: r.role,
            status: action,
            comment: customComment || "",
            history: updated.history,
            salaryRange: r.salary ? r.salary.replace(/^₹/, "") : item.salaryRange,
            experience: r.experience || item.experience,
          };
          // Clear stale temp split-fields so popup reads the fresh combined values
          delete updated2.minSalary;
          delete updated2.maxSalary;
          delete updated2.minExperience;
          delete updated2.maxExperience;
          return updated2;
        }),
      );
    }
    if (r.type === "Job Request") {
      setJobRequests((prev) =>
        prev.map((item) => {
          if (String(item.id) !== String(r.sourceId)) return item;
          return {
            ...item,
            status: action,
            comment: customComment || "",
            history: updated.history,
            vacancies: r.vacancies !== undefined ? r.vacancies : item.vacancies,
            qual: r.qual !== undefined ? r.qual : item.qual,
            type: r.empType !== undefined ? r.empType : item.type,
            description: r.description !== undefined ? r.description : item.description,
          };
        }),
      );
    }

    if (action === "Approved" && r.type === "Role Request") {
      setExistingRoles((prev: any[]) => {
        const exists = prev.some((x) => x.role === r.role && x.dept === r.dept);
        if (exists) return prev;
        const cleanedSalary = r.salary ? r.salary.replace(/^₹/, "") : "";
        return [...prev, {
          id: `ROL-${Date.now()}`, dept: r.dept, role: r.role, type: "Full-time",
          headcount: 1, filled: 0, currentFilled: 0, status: "Inactive", currentStatus: "Inactive",
          experience: r.experience || "—",
          salaryRange: cleanedSalary || "—",
        }];
      });
      if (onNavigateToExistingRoles) {
        setTimeout(() => { onNavigateToExistingRoles(); }, 300);
      }
    }

    if (action === "Approved" && r.type === "Job Request") {
      setJobPostings((prev: any[]) => {
        const exists = prev.some((p) => p.role === r.role);
        if (exists) return prev;
        return [...prev, {
          id: `POST-${Date.now()}`, role: r.role, channel: "Career Page",
          status: "Unpublished", posted: now, expiry: "30 Days", apps: 0,
          location: r.location || "",
          salary: r.salary || "",
          vacancies: r.vacancies || "",
          exp: r.exp || "",
          qual: r.qual || "",
          type: r.empType || "",
          description: r.description || "",
        }];
      });
      if (onNavigateToApplications) {
        setTimeout(() => { onNavigateToApplications(); }, 300);
      }
    }

    if (sel && sel.id === r.id) {
      setSel(updated);
    }
  };

  const takeAction = (action: "Approved" | "Rejected" | "Sent Back") => {
    if (!sel) return;
    let updatedSel = { ...sel };
    if (sel.type === "Role Request") {
      const minS = sel.minSalary ?? sel.salary?.replace(/^₹/, "").split("-")[0]?.trim() ?? "";
      const maxS = sel.maxSalary ?? sel.salary?.replace(/^₹/, "").split("-")[1]?.trim() ?? "";
      const minE = sel.minExp ?? (sel.experience ? String(sel.experience).split("-")[0]?.trim() : "");
      const maxE = sel.maxExp ?? (sel.experience ? String(sel.experience).split("-")[1]?.trim() : "");

      const errs: Record<string, string> = {};
      if (minS && maxS && parseSal(minS) >= parseSal(maxS)) errs.minSalary = "Min salary must be less than max salary";
      if (minE && maxE && parseFloat(minE) >= parseFloat(maxE)) errs.minExp = "Min experience must be less than max experience";
      if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }

      updatedSel.salary = minS && maxS ? `₹${minS}-${maxS}` : sel.salary;
      updatedSel.experience = minE && maxE ? `${minE}-${maxE}` : sel.experience;
    }
    // For Job Requests, merge edited fields back
    if (sel.type === "Job Request") {
      updatedSel.vacancies = sel.vacancies;
      updatedSel.qual = sel.qual;
      updatedSel.empType = sel.empType;
      updatedSel.description = sel.description;
    }
    setFieldErrors({});
    performAction(updatedSel, action, comment);
    // Close modal only for Approved or Rejected; keep open for Sent Back so edits remain visible
    if (action !== "Sent Back") closeModal();
  };



  const isPending = sel?.status === "Pending";

  return (
    <div>
      <SectionTitle title="Approve Request" sub="Review, approve, or return pending role and job requests" />

      {/* Modal */}
      {sel && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(15,23,42,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.surface, borderRadius: 16, width: "100%", maxWidth: 540,
              maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              position: "sticky", top: 0, background: T.surface, zIndex: 1,
              borderRadius: "16px 16px 0 0",
            }}>
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                  <Badge label={sel.type || "Request"} variant="blue" />
                  <Badge label={sel.status} variant={statusVariant(sel.status)} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>
                  {sel.type === "Role Request" ? "Role Request Details" : sel.role}
                </div>
                <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
                  {sel.type === "Role Request"
                    ? `${sel.requestedBy} · ${sel.date}`
                    : `${sel.dept && sel.dept !== "N/A" ? `${sel.dept} · ` : ""}${sel.requestedBy} · ${sel.date}`}
                </div>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 8,
                  width: 32, height: 32, fontSize: 18, color: T.inkMid, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, lineHeight: 1,
                }}
              >×</button>
            </div>

            {/* Modal body */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: T.canvas, borderRadius: 10, padding: 16, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Department — Role Request only */}
                {sel.type === "Role Request" && (
                  <div>
                    <div style={labelCss}>Department</div>
                    {sel.status === "Pending" ? (
                      <input
                        value={sel.dept || ""}
                        onChange={(e) => setSel({ ...sel, dept: e.target.value })}
                        placeholder="e.g. Science"
                        style={{ width: "100%", padding: 9, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: T.surface, color: T.ink }}
                      />
                    ) : (
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{sel.dept || "—"}</div>
                    )}
                  </div>
                )}

                {/* Role Name — Role Request only */}
                {sel.type === "Role Request" && (
                  <div>
                    <div style={labelCss}>Role Name</div>
                    {sel.status === "Pending" ? (
                      <input
                        value={sel.role || ""}
                        onChange={(e) => setSel({ ...sel, role: e.target.value })}
                        placeholder="e.g. Mathematics Teacher"
                        style={{ width: "100%", padding: 9, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: T.surface, color: T.ink }}
                      />
                    ) : (
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{sel.role || "—"}</div>
                    )}
                  </div>
                )}

                {/* Salary Range — Role Request only, editable when Pending */}
                {(sel.salary || sel.type === "Role Request") && (
                  <div>
                    <div style={labelCss}>Salary Range</div>
                    {sel.type === "Role Request" && sel.status === "Pending" ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 3 }}>Min (₹)</div>
                          <input
                            value={sel.minSalary ?? (sel.salary ? sel.salary.replace(/^₹/, "").split("-")[0]?.trim() : "")}
                            onChange={(e) => { setSel({ ...sel, minSalary: e.target.value }); setFieldErrors((p) => { const n = { ...p }; delete n.minSalary; return n; }); }}
                            placeholder="e.g. 40,000"
                            style={{ width: "100%", padding: 9, border: `1.5px solid ${fieldErrors.minSalary ? T.red : T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: T.surface }}
                          />
                          {fieldErrors.minSalary && <div style={{ color: T.red, fontSize: 11, marginTop: 3, fontWeight: 600 }}>{fieldErrors.minSalary}</div>}
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 3 }}>Max (₹)</div>
                          <input
                            value={sel.maxSalary ?? (sel.salary ? sel.salary.replace(/^₹/, "").split("-")[1]?.trim() : "")}
                            onChange={(e) => setSel({ ...sel, maxSalary: e.target.value })}
                            placeholder="e.g. 60,000"
                            style={{ width: "100%", padding: 9, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: T.surface }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{sel.salary || "—"}</div>
                    )}
                  </div>
                )}

                {/* Experience — Role Request only, editable when Pending */}
                {(sel.experience || sel.exp || sel.type === "Role Request") && (
                  <div>
                    <div style={labelCss}>Experience</div>
                    {sel.type === "Role Request" && sel.status === "Pending" ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 3 }}>Min (yrs)</div>
                          <input
                            value={sel.minExp ?? (sel.experience ? String(sel.experience).split("-")[0]?.trim() : "")}
                            onChange={(e) => { setSel({ ...sel, minExp: e.target.value }); setFieldErrors((p) => { const n = { ...p }; delete n.minExp; return n; }); }}
                            placeholder="e.g. 2"
                            style={{ width: "100%", padding: 9, border: `1.5px solid ${fieldErrors.minExp ? T.red : T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: T.surface }}
                          />
                          {fieldErrors.minExp && <div style={{ color: T.red, fontSize: 11, marginTop: 3, fontWeight: 600 }}>{fieldErrors.minExp}</div>}
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 3 }}>Max (yrs)</div>
                          <input
                            value={sel.maxExp ?? (sel.experience ? String(sel.experience).split("-")[1]?.trim() : "")}
                            onChange={(e) => setSel({ ...sel, maxExp: e.target.value })}
                            placeholder="e.g. 5"
                            style={{ width: "100%", padding: 9, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" as const, background: T.surface }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>
                        {sel.experience ? `${sel.experience} yrs` : sel.exp ? `${sel.exp} yrs` : "—"}
                      </div>
                    )}
                  </div>
                )}

                {/* Job Request editable fields: Vacancies, Qualification, Employment Type */}
                {sel.type === "Job Request" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={labelCss}>Vacancies</div>
                      {isPending ? (
                        <select
                          value={sel.vacancies || ""}
                          onChange={(e) => setSel({ ...sel, vacancies: e.target.value })}
                          style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", background: T.surface, color: T.ink }}
                        >
                          <option value="">Select…</option>
                          {VACANCY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{sel.vacancies || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div style={labelCss}>Qualification</div>
                      {isPending ? (
                        <select
                          value={sel.qual || ""}
                          onChange={(e) => setSel({ ...sel, qual: e.target.value })}
                          style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", background: T.surface, color: T.ink }}
                        >
                          <option value="">Select…</option>
                          {QUAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <div style={{ fontSize: 13, color: T.ink }}>{sel.qual || "—"}</div>
                      )}
                    </div>
                    <div>
                      <div style={labelCss}>Emp Type</div>
                      {isPending ? (
                        <select
                          value={sel.empType || ""}
                          onChange={(e) => setSel({ ...sel, empType: e.target.value })}
                          style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", background: T.surface, color: T.ink }}
                        >
                          <option value="">Select…</option>
                          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <div style={{ fontSize: 13, color: T.ink }}>{sel.empType || "—"}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Job Description — editable for Job Requests when Pending */}
                {sel.type === "Job Request" && (
                  <div>
                    <div style={labelCss}>Job Description</div>
                    {isPending ? (
                      <textarea
                        value={sel.description || ""}
                        onChange={(e) => setSel({ ...sel, description: e.target.value })}
                        placeholder="Enter job description…"
                        style={{ width: "100%", minHeight: 80, padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" as const, background: T.surface, color: T.ink }}
                      />
                    ) : (
                      <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{sel.description || "—"}</div>
                    )}
                  </div>
                )}

                {/* Justification — always read-only, moved to bottom */}
                {sel.just && (
                  <div>
                    <div style={labelCss}>Justification</div>
                    <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{sel.just}</div>
                  </div>
                )}
              </div>

              {sel.history?.length > 0 && (
                <div>
                  <div style={{ ...labelCss, marginBottom: 12 }}>Activity History</div>
                  {sel.history.map((h: any, i: number) => (
                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === sel.history.length - 1 ? T.blue : T.border, marginTop: 3, flexShrink: 0 }} />
                        {i < sel.history.length - 1 && <div style={{ width: 2, flex: 1, background: T.border, margin: "3px 0" }} />}
                      </div>
                      <div style={{ paddingBottom: i < sel.history.length - 1 ? 4 : 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>
                          {h.act} <span style={{ fontWeight: 400, color: T.inkLight }}>by {h.by}</span>
                        </div>
                        <div style={{ fontSize: 11, color: T.inkFaint }}>{h.date}</div>
                        {h.note && (
                          <div style={{ marginTop: 4, fontSize: 12, color: T.amber, background: T.amberLight, padding: "6px 10px", borderRadius: 7, border: `1px solid #FDE68A` }}>
                            {h.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isPending ? (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: T.inkLight, display: "block", marginBottom: 6 }}>
                    Comment <span style={{ color: T.inkFaint, fontWeight: 400 }}>(required for Sent Back)</span>
                  </label>
                  <textarea
                    placeholder="Add a comment or reason…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{
                      border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 10, fontSize: 13,
                      width: "100%", minHeight: 80, resize: "vertical", outline: "none",
                      boxSizing: "border-box", color: T.ink, background: T.canvas,
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  background: sel.status === "Approved" ? T.greenLight : sel.status === "Rejected" ? T.redLight : T.amberLight,
                  borderRadius: 10, padding: "12px 16px",
                  border: `1px solid ${sel.status === "Approved" ? "#A7F3D0" : sel.status === "Rejected" ? "#FECACA" : "#FDE68A"}`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: sel.status === "Approved" ? T.green : sel.status === "Rejected" ? T.red : T.amber }}>
                    {sel.status === "Approved" ? "✓ Approved" : sel.status === "Rejected" ? "✕ Rejected" : "↺ Sent Back"}
                  </div>
                  {sel.comment && <div style={{ fontSize: 12, color: T.inkMid, marginTop: 4 }}>{sel.comment}</div>}
                </div>
              )}
            </div>

            {/* Modal footer */}
            {isPending && (
              <div style={{
                padding: "16px 24px",
                borderTop: `1px solid ${T.border}`,
                display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap",
                background: T.canvas, borderRadius: "0 0 16px 16px",
              }}>
                {/* Sent Back button first */}
                <Btn
                  label="Sendback"
                  variant="amber"
                  small
                  onClick={() => {
                    if (!comment.trim()) { alert("Please add a comment before sending back."); return; }
                    takeAction("Sent Back");
                  }}
                />
                {/* Reject button second */}
                <Btn
                  label="Reject"
                  variant="danger"
                  small
                  onClick={() => {
                    if (!sel) return;
                    if (confirm("Are you sure you want to reject this request?")) {
                      takeAction("Rejected");
                    }
                  }}
                />
                {/* Accept button third */}
                <Btn
                  label="Accept"
                  variant="success"
                  small
                  onClick={() => {
                    if (confirm("Are you sure you want to accept this request?")) {
                      takeAction("Approved");
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Card>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10, alignItems: isMobile ? "stretch" : "center" }}>
          <Input
            placeholder="Search id, dept, role, user, date…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={isMobile ? { width: "100%" } : { flex: 1, minWidth: 200, maxWidth: 300 }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", width: isMobile ? "100%" : "auto", marginLeft: isMobile ? 0 : "auto" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: T.inkMid, background: "#fff", cursor: "pointer", flex: isMobile ? 1 : "none" }}
            >
              {["All", "Pending", "Approved", "Rejected", "Sent Back"].map((s) => <option key={s}>{s}</option>)}
            </select>
            {pendingCount > 0 && (
              <span style={{ background: T.amberLight, border: `1px solid #FDE68A`, borderRadius: 99, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: T.amber, whiteSpace: "nowrap" }}>
                {pendingCount} pending
              </span>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 4 }}>No requests yet</div>
            <div style={{ fontSize: 13, color: T.inkLight }}>Submit a Role or Job Request to see it here for approval.</div>
          </div>
        ) : isMobile ? (
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
              {filtered.length} request{filtered.length !== 1 ? "s" : ""}
            </div>

            <div
              ref={scrollRef}
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const cardWidth = e.currentTarget.clientWidth;
                if (cardWidth > 0) {
                  const newIndex = Math.round(scrollLeft / cardWidth);
                  setCurrentCardIndex(newIndex);
                }
              }}
              className="carousel-scroll"
              style={{
                display: "flex",
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                gap: 12,
                paddingBottom: 20,
                margin: "0 -12px",
                paddingLeft: 12,
                paddingRight: 12,
              }}
            >
              {filtered.map((r, idx) => (
                <div
                  key={r.id}
                  onClick={() => openModal(r)}
                  style={{
                    flexShrink: 0,
                    width: "calc(100% - 24px)",
                    scrollSnapAlign: "center",
                    borderRadius: 20,
                    background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 24,
                    position: "relative",
                    boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
                    minHeight: 380,
                    cursor: "pointer",
                  }}
                >
                  {/* Pagination counter */}
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      padding: "4px 12px",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {idx + 1} of {filtered.length}
                  </div>

                  <div>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 40 }}>
                      {avatar(r.role || r.type || "Request")}
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{r.role}</h3>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                          {r.dept && r.dept !== "N/A" ? `${r.dept} · ` : ""}{r.requestedBy}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details (Glassmorphic) */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 14,
                      padding: 16,
                      border: "1px solid rgba(255,255,255,0.12)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      marginTop: 16,
                      flex: 1,
                    }}
                  >
                    {[
                      { icon: "🆔", label: "Request ID", value: String(r.sourceId).substring(0, 16) },
                      { icon: "📋", label: "Type", value: r.type || "Request" },
                      { icon: "📅", label: "Date", value: r.date },
                      ...(r.salary ? [{ icon: "💰", label: "Salary", value: r.salary }] : []),
                      ...(r.experience ? [{ icon: "⏳", label: "Experience", value: `${r.experience} yrs` }] : []),
                      ...(r.vacancies ? [{ icon: "👥", label: "Vacancies", value: String(r.vacancies) }] : []),
                      ...(r.empType ? [{ icon: "💼", label: "Emp Type", value: r.empType }] : []),
                    ].map((item, index) => (
                      <div key={index} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                            {item.label}
                          </div>
                          <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.value}
                          </div>
                        </div>
                      </div>
                    ))}

                    {r.comment && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10, marginTop: 2 }}>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                          Comment
                        </div>
                        <div style={{ fontSize: 12, color: "#FBBF24", background: "rgba(245, 158, 11, 0.15)", padding: "6px 10px", borderRadius: 8, border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                          {r.comment}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action row */}
                  <div
                    style={{
                      padding: "12px 0 0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      marginTop: 12,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Status</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {r.status === "Pending" ? (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to accept this request?")) {
                                performAction(r, "Approved");
                              }
                            }}
                            style={{
                              background: "rgba(16, 185, 129, 0.25)",
                              color: "#34D399",
                              border: `1px solid rgba(16, 185, 129, 0.4)`,
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to reject this request?")) {
                                performAction(r, "Rejected");
                              }
                            }}
                            style={{
                              background: "rgba(239, 68, 68, 0.25)",
                              color: "#FCA5A5",
                              border: `1px solid rgba(239, 68, 68, 0.4)`,
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: r.status === "Approved" ? "rgba(16, 185, 129, 0.25)" : r.status === "Rejected" ? "rgba(239, 68, 68, 0.25)" : "rgba(245, 158, 11, 0.25)",
                            color: r.status === "Approved" ? "#34D399" : r.status === "Rejected" ? "#FCA5A5" : "#FBBF24",
                            padding: "3px 10px",
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 700,
                            border: `1px solid ${r.status === "Approved" ? "rgba(16, 185, 129, 0.4)" : r.status === "Rejected" ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.4)"}`,
                          }}
                        >
                          {r.status === "Approved" ? "✓ Approved" : r.status === "Rejected" ? "✕ Rejected" : "↺ Sent Back"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Indicator dots */}
            {filtered.length > 0 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
                {filtered.map((_, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (scrollRef.current) {
                        scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: "smooth" });
                      }
                    }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: currentCardIndex === i ? T.primary : T.border,
                      cursor: "pointer",
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {filtered.map((r) => (
              <div
                key={r.id}
                onClick={() => openModal(r)}
                style={{
                  padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = T.primaryPale; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <Mono v={String(r.sourceId).substring(0, 16)} />
                    <Badge label={r.type || "Request"} variant="blue" />
                    <Badge label={r.status} variant={statusVariant(r.status)} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{r.role}</div>
                  <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
                    {r.dept && r.dept !== "N/A" ? `${r.dept} · ` : ""}{r.requestedBy} · {r.date}
                  </div>
                  {r.comment && (
                    <div style={{ marginTop: 6, fontSize: 12, color: T.amber, background: T.amberLight, padding: "3px 8px", borderRadius: 6, display: "inline-block", border: `1px solid #FDE68A` }}>
                      {r.comment}
                    </div>
                  )}
                </div>
                {r.status === "Pending" ? (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to accept this request?")) {
                          performAction(r, "Approved");
                        }
                      }}
                      style={{
                        background: T.greenLight, color: T.green, border: `1.5px solid #A7F3D0`,
                        borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = T.green; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = T.greenLight; e.currentTarget.style.color = T.green; }}
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to reject this request?")) {
                          performAction(r, "Rejected");
                        }
                      }}
                      style={{
                        background: T.redLight, color: T.red, border: `1.5px solid #FECACA`,
                        borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = T.red; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = T.redLight; e.currentTarget.style.color = T.red; }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
