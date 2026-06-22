import React, { useState } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
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
  onNavigateToJobPostings?: () => void;
}

const labelCss: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase",
  letterSpacing: "0.06em", marginBottom: 4,
};

export default function ApprovalRequests({ requests, setRequests, setExistingRoles, setJobPostings, setRoleRequests, setJobRequests, onNavigateToJobPostings }: ApprovalRequestsProps) {
  const [sel, setSel] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const parseSal = (v: string) => parseFloat((v || "").replace(/,/g, "")) || 0;

  const filtered = requests
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter((r) =>
      (r.role || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.dept || "").toLowerCase().includes(search.toLowerCase()),
    );

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  const openModal = (r: any) => { setSel(r); setComment(""); setFieldErrors({}); };
  const closeModal = () => { setSel(null); setComment(""); setFieldErrors({}); };

  const performAction = (r: any, action: "Approved" | "Rejected" | "Send Back", customComment?: string) => {
    const now = new Date().toLocaleDateString();
    const entry = { act: action, by: "HR Admin", date: now, note: customComment || "" };
    const updated = { ...r, status: action, comment: customComment || "", history: [...(r.history || []), entry] };

    setRequests((prev) => prev.map((item) => (item.id === r.id ? updated : item)));

    if (r.type === "Role Request") {
      setRoleRequests((prev) =>
        prev.map((item) => String(item.id) === String(r.sourceId) ? { ...item, status: action, comment: customComment || "" } : item),
      );
    }
    if (r.type === "Job Request") {
      setJobRequests((prev) =>
        prev.map((item) =>
          String(item.id) === String(r.sourceId)
            ? {
                ...item,
                status: action,
                comment: customComment || "",
                vacancies: r.vacancies,
                qual: r.qual,
                type: r.empType,
                description: r.description,
              }
            : item
        ),
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
    }

    if (action === "Approved" && r.type === "Job Request") {
      setJobPostings((prev: any[]) => {
        const exists = prev.some((p) => p.role === r.role);
        if (exists) return prev;
        return [...prev, {
          id: `POST-${Date.now()}`, role: r.role, channel: "Career Page",
          status: "Unpublished", posted: now, expiry: "30 Days", apps: 0,
        }];
      });
      if (onNavigateToJobPostings) {
        setTimeout(() => { onNavigateToJobPostings(); }, 300);
      }
    }

    if (sel && sel.id === r.id) {
      setSel(updated);
    }
  };

  const takeAction = (action: "Approved" | "Rejected" | "Send Back") => {
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
    closeModal();
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
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>{sel.role}</div>
                <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
                  {sel.dept && sel.dept !== "N/A" ? `${sel.dept} · ` : ""}{sel.requestedBy} · {sel.date}
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
                      <div style={labelCss}>Employment Type</div>
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
                    Comment <span style={{ color: T.inkFaint, fontWeight: 400 }}>(required for Send Back)</span>
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
                <Btn label="✕ Reject" variant="danger" small onClick={() => takeAction("Rejected")} />
                <Btn
                  label="↺ Send Back"
                  variant="amber"
                  small
                  onClick={() => {
                    if (!comment.trim()) { alert("Please add a comment before sending back."); return; }
                    takeAction("Send Back");
                  }}
                />
                <Btn label="✓ Approve" variant="success" small onClick={() => takeAction("Approved")} />
              </div>
            )}
          </div>
        </div>
      )}

      <Card>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Input
            placeholder="Search requests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 280 }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: T.inkMid, background: "#fff", cursor: "pointer" }}
          >
            {["All", "Pending", "Approved", "Rejected", "Send Back"].map((s) => <option key={s}>{s}</option>)}
          </select>
          {pendingCount > 0 && (
            <span style={{ marginLeft: "auto", background: T.amberLight, border: `1px solid #FDE68A`, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: T.amber }}>
              {pendingCount} pending
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink, marginBottom: 4 }}>No requests yet</div>
            <div style={{ fontSize: 13, color: T.inkLight }}>Submit a Role or Job Request to see it here for approval.</div>
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
                    <Mono v={String(r.id).substring(0, 16)} />
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
                        performAction(r, "Approved");
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
