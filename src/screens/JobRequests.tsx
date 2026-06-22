import React, { useState } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Table, Mono, Btn, Input, Select, Badge, Modal, ModalHeader, FormField } from "../components/ui";
import { ROLE_OPTIONS, VACANCY_OPTIONS, EXP_OPTIONS, QUAL_OPTIONS, TYPE_OPTIONS, SALARY_OPTIONS } from "../data";

interface JobRequestsProps {
  jobRequests: any[];
  setJobRequests: React.Dispatch<React.SetStateAction<any[]>>;
  approvalRequests: any[];
  setApprovalRequests: React.Dispatch<React.SetStateAction<any[]>>;
  jobPostings: any[];
  setJobPostings: React.Dispatch<React.SetStateAction<any[]>>;
  existingRoles: any[];
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Approved": return { border: `1.5px solid ${T.green}`, background: T.greenLight, color: T.green };
    case "Rejected": return { border: "1.5px solid #DC2626", background: "#FEE2E2", color: "#DC2626" };
    case "Cancelled": return { border: "1.5px solid #6B7280", background: "#F3F4F6", color: "#6B7280" };
    case "Sent Back": return { border: `1.5px solid ${T.amber}`, background: T.amberLight, color: T.amber };
    default: return { border: `1.5px solid ${T.blue}`, background: T.blueLight, color: T.blue };
  }
};

const emptyForm = () => ({
  id: Date.now() + Math.random(),
  role: "",
  vacancies: "",
  exp: "",
  qual: "",
  type: "",
  salary: "",
  location: "",
  description: "",
  justification: "",
  status: "Pending",
  comment: "",
});

export default function JobRequests({ jobRequests, setJobRequests, approvalRequests, setApprovalRequests, existingRoles }: JobRequestsProps) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [showForm, setShowForm] = useState(false);
  const [jobForms, setJobForms] = useState([emptyForm()]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);

  const roleOptions = (existingRoles || []).map((r) => ({ value: r.role, label: r.role }));

  const updateForm = (index: number, key: string, value: string) => {
    setJobForms((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const handleRoleChange = (index: number, selectedRole: string) => {
    updateForm(index, "role", selectedRole);
    const matchingRole = (existingRoles || []).find((r) => r.role === selectedRole);
    if (matchingRole) {
      updateForm(index, "exp", matchingRole.experience || "");
      updateForm(index, "salary", matchingRole.salaryRange || "");
    }
  };

  const handleRoleChangeInModal = (selectedRole: string) => {
    if (!selectedRequest) return;
    const matchingRole = (existingRoles || []).find((r) => r.role === selectedRole);
    setSelectedRequest({
      ...selectedRequest,
      role: selectedRole,
      exp: matchingRole ? (matchingRole.experience || "") : selectedRequest.exp,
      salary: matchingRole ? (matchingRole.salaryRange || "") : selectedRequest.salary,
    });
  };

  const saveJobRequestEdits = (submitAsPending: boolean) => {
    if (!selectedRequest) return;
    const updated = {
      ...selectedRequest,
      status: submitAsPending ? "Pending" : selectedRequest.status,
    };

    // Update job requests
    setJobRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));

    // Update approval requests
    setApprovalRequests((prev) =>
      prev.map((apr) =>
        String(apr.sourceId) === String(selectedRequest.id)
          ? {
              ...apr,
              role: updated.role,
              salary: updated.salary,
              vacancies: updated.vacancies,
              exp: updated.exp,
              qual: updated.qual,
              empType: updated.type,
              just: updated.justification,
              description: updated.description,
              status: updated.status,
            }
          : apr
      )
    );

    setShowViewModal(false);
    setSelectedRequest(null);
  };

  const cancelJobRequest = (reqId: any) => {
    setJobRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: "Cancelled" } : r))
    );
    setApprovalRequests((prev) =>
      prev.map((apr) =>
        String(apr.sourceId) === String(reqId) ? { ...apr, status: "Cancelled" } : apr
      )
    );
    setShowViewModal(false);
    setSelectedRequest(null);
  };

  const openNew = () => {
    setEditingId(null);
    setJobForms([emptyForm()]);
    setShowForm(true);
  };

  const openEdit = (r: any) => {
    setEditingId(r.id);
    setJobForms([{ ...r }]);
    setShowForm(true);
  };

  const submitRequests = () => {
    if (editingId !== null) {
      setJobRequests((prev) => prev.map((r) => r.id === editingId ? { ...r, ...jobForms[0] } : r));
      setApprovalRequests((prev) =>
        prev.map((apr) =>
          String(apr.sourceId) === String(editingId)
            ? {
                ...apr,
                role: jobForms[0].role,
                salary: jobForms[0].salary,
                vacancies: jobForms[0].vacancies,
                exp: jobForms[0].exp,
                qual: jobForms[0].qual,
                empType: jobForms[0].type,
                just: jobForms[0].justification,
                description: jobForms[0].description,
              }
            : apr
        )
      );
    } else {
      const now = new Date().toLocaleDateString();
      const newRequests = jobForms.map((f, i) => ({
        ...f,
        id: `JR-${Date.now()}-${i}`,
        status: "Pending",
        comment: "",
        date: now,
      }));
      setJobRequests((prev) => [...prev, ...newRequests]);
      setApprovalRequests((prev) => [
        ...prev,
        ...newRequests.map((r) => ({
          id: `APR-${Date.now()}-${Math.random()}`,
          dept: "N/A",
          role: r.role,
          requestedBy: "Current User",
          date: now,
          salary: r.salary,
          vacancies: r.vacancies,
          exp: r.exp,
          qual: r.qual,
          empType: r.type,
          just: r.justification,
          description: r.description,
          status: "Pending",
          comment: "",
          history: [{ act: "Submitted", by: "Current User", date: now, note: "" }],
          sourceId: r.id,
          type: "Job Request",
        })),
      ]);
    }
    setJobForms([emptyForm()]);
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div>
      <SectionTitle
        title="Job Requests"
        sub="Define vacancies, qualifications, and compensation details"
        action={<Btn label="+ New Job Request" onClick={openNew} />}
      />

      {jobRequests.filter((r) => r.status === "Sent Back").map((r) => (
        <div
          key={r.id}
          style={{
            background: T.amberLight,
            border: `1px solid #FDE68A`,
            borderRadius: 10,
            padding: "12px 16px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1 }}>
            <strong style={{ color: T.amber, fontSize: 13 }}>Action Required (Sent Back): </strong>
            <span style={{ fontSize: 13, color: T.ink }}>
              Job Request for <strong>{r.role}</strong> was returned with comment: <em>...</em>
            </span>
          </div>
          <Btn label="View Request" small variant="amber" onClick={() => { setSelectedRequest(r); setShowViewModal(true); }} />
        </div>
      ))}

      {showForm && (
        <div style={{ marginBottom: 20 }}>
          {jobForms.map((form, index) => (
            <Card key={form.id} style={{ padding: 20, marginBottom: 16, borderTop: `3px solid ${T.blue}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>
                  {editingId ? "Edit Job Request" : `Job Request #${index + 1}`}
                </div>
                {jobForms.length > 1 && (
                  <button onClick={() => setJobForms((p) => p.filter((_, i) => i !== index))}
                    style={{ border: "none", background: "#FEE2E2", color: "#DC2626", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
                    Remove
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                <FormField label="Role" required>
                  <Select value={form.role} onChange={(e) => handleRoleChange(index, e.target.value)} options={roleOptions} placeholder="Select role…" />
                </FormField>
                <FormField label="Experience" required>
                  <Input placeholder="Enter experience" value={form.exp} onChange={(e) => updateForm(index, "exp", e.target.value)} />
                </FormField>
                <FormField label="Salary Range" required>
                  <Input placeholder="Enter salary range" value={form.salary} onChange={(e) => updateForm(index, "salary", e.target.value)} />
                </FormField>
                <FormField label="Qualification" required>
                  <Select value={form.qual} onChange={(e) => updateForm(index, "qual", e.target.value)} options={QUAL_OPTIONS} placeholder="Select qualification…" />
                </FormField>
                <FormField label="Vacancies" required>
                  <Select value={form.vacancies} onChange={(e) => updateForm(index, "vacancies", e.target.value)} options={VACANCY_OPTIONS} placeholder="Select count…" />
                </FormField>
                <FormField label="Employment Type" required>
                  <Select value={form.type} onChange={(e) => updateForm(index, "type", e.target.value)} options={TYPE_OPTIONS} placeholder="Select type…" />
                </FormField>
                <FormField label="Location" required>
                  <Input placeholder="Enter job location" value={form.location} onChange={(e) => updateForm(index, "location", e.target.value)} />
                </FormField>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                <FormField label="Job Description" required>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm(index, "description", e.target.value)}
                    placeholder="Enter job description"
                    style={{ width: "100%", minHeight: 100, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 12, resize: "vertical", outline: "none", fontSize: 13, boxSizing: "border-box" }}
                  />
                </FormField>
                <FormField label="Justification" required>
                  <textarea
                    value={form.justification}
                    onChange={(e) => updateForm(index, "justification", e.target.value)}
                    placeholder="Why is this job needed?"
                    style={{ width: "100%", minHeight: 100, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 12, resize: "vertical", outline: "none", fontSize: 13, boxSizing: "border-box" }}
                  />
                </FormField>
              </div>
            </Card>
          ))}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <Btn label="Submit Request" onClick={submitRequests} />
            {!editingId && <Btn label="+ Add More" variant="outline" onClick={() => setJobForms((p) => [...p, emptyForm()])} />}
            <Btn label="Cancel" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); setJobForms([emptyForm()]); }} />
          </div>
        </div>
      )}

      <Card>
        <Table
          onRowClick={(index) => {
            setSelectedRequest(jobRequests[index]);
            setShowViewModal(true);
          }}
          cols={["Request ID", "Role", "Location", "Vacancies", "Experience", "Qualification", "Type", "Salary", "Status", "Admin Comment"]}
          rows={jobRequests.map((r) => {
            const ss = getStatusStyle(r.status);
            return [
              <Mono v={typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)} />,
              <strong>{r.role}</strong>,
              r.location || "—",
              r.vacancies || "—",
              r.exp || "—",
              r.qual || "—",
              r.type || "—",
              r.salary || "—",
              <span style={{ ...ss, borderRadius: 99, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-block" }}>{r.status}</span>,
              r.comment
                ? <div style={{ background: T.amberLight, border: `1px solid #FDE68A`, borderRadius: 7, padding: "4px 10px", fontSize: 12, color: T.amber, fontWeight: 600, display: "inline-block" }}>
                    ...
                  </div>
                : <span style={{ color: T.inkFaint, fontSize: 12 }}>—</span>,
            ];
          })}
        />
      </Card>

      {showViewModal && selectedRequest && (
        <div
          onClick={() => { setShowViewModal(false); setSelectedRequest(null); }}
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
              background: T.surface, borderRadius: 16, width: "100%", maxWidth: 580,
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
                  <Badge label="Job Request" variant="blue" />
                  <Badge label={selectedRequest.status} variant={statusVariant(selectedRequest.status)} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>
                  {selectedRequest.role || "Job Request Details"}
                </div>
                <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
                  {selectedRequest.location ? `${selectedRequest.location}` : ""}
                  {selectedRequest.date ? ` · ${selectedRequest.date}` : ""}
                </div>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setSelectedRequest(null); }}
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
                {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                      {/* Role */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Role</div>
                        <Select
                          value={selectedRequest.role || ""}
                          onChange={(e) => handleRoleChangeInModal(e.target.value)}
                          options={roleOptions}
                          placeholder="Select role…"
                        />
                      </div>

                      {/* Location */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Location</div>
                        <Input
                          placeholder="Enter job location"
                          value={selectedRequest.location || ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, location: e.target.value })}
                        />
                      </div>

                      {/* Vacancies */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Vacancies</div>
                        <Select
                          value={selectedRequest.vacancies || ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, vacancies: e.target.value })}
                          options={VACANCY_OPTIONS}
                          placeholder="Select count…"
                        />
                      </div>

                      {/* Experience */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Experience</div>
                        <Input
                          placeholder="Enter experience"
                          value={selectedRequest.exp || ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, exp: e.target.value })}
                        />
                      </div>

                      {/* Qualification */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Qualification</div>
                        <Select
                          value={selectedRequest.qual || ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, qual: e.target.value })}
                          options={QUAL_OPTIONS}
                          placeholder="Select qualification…"
                        />
                      </div>

                      {/* Employment Type */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Employment Type</div>
                        <Select
                          value={selectedRequest.type || ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, type: e.target.value })}
                          options={TYPE_OPTIONS}
                          placeholder="Select type…"
                        />
                      </div>

                      {/* Salary Range */}
                      <div style={{ gridColumn: isMobile ? "auto" : "span 2" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Salary Range</div>
                        <Input
                          placeholder="Enter salary range"
                          value={selectedRequest.salary || ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, salary: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Job Description */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Job Description</div>
                      <textarea
                        value={selectedRequest.description || ""}
                        onChange={(e) => setSelectedRequest({ ...selectedRequest, description: e.target.value })}
                        placeholder="Enter job description"
                        style={{ width: "100%", minHeight: 80, padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", background: T.surface, color: T.ink }}
                      />
                    </div>

                    {/* Justification */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Justification</div>
                      <textarea
                        value={selectedRequest.justification || ""}
                        onChange={(e) => setSelectedRequest({ ...selectedRequest, justification: e.target.value })}
                        placeholder="Why is this job needed?"
                        style={{ width: "100%", minHeight: 80, padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", background: T.surface, color: T.ink }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Role</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{selectedRequest.role || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Location</div>
                        <div style={{ fontSize: 13, color: T.ink }}>{selectedRequest.location || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Vacancies</div>
                        <div style={{ fontSize: 13, color: T.ink }}>{selectedRequest.vacancies || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Experience</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{selectedRequest.exp || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Qualification</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{selectedRequest.qual || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Employment Type</div>
                        <div style={{ fontSize: 13, color: T.ink }}>{selectedRequest.type || "—"}</div>
                      </div>
                      <div style={{ gridColumn: isMobile ? "auto" : "span 2" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Salary Range</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{selectedRequest.salary || "—"}</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Job Description</div>
                      <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.description || "—"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Justification</div>
                      <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.justification || "—"}</div>
                    </div>
                  </>
                )}
              </div>

              {selectedRequest.comment && (
                <div style={{ background: T.amberLight, border: `1px solid #FDE68A`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.amber, marginBottom: 4 }}>Admin Comment</div>
                  <div style={{ fontSize: 13, color: T.inkMid }}>{selectedRequest.comment}</div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            {(selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back") && (
              <div style={{
                padding: "16px 24px",
                borderTop: `1px solid ${T.border}`,
                display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap",
                background: T.canvas, borderRadius: "0 0 16px 16px",
              }}>
                <Btn label="Cancel Request" variant="danger" small onClick={() => cancelJobRequest(selectedRequest.id)} />
                <Btn label="Accept" variant="success" small onClick={() => saveJobRequestEdits(true)} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
