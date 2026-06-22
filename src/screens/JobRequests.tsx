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
    case "Send Back": return { border: `1.5px solid ${T.amber}`, background: T.amberLight, color: T.amber };
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

      {jobRequests.filter((r) => r.status === "Send Back").map((r) => (
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
              Job Request for <strong>{r.role}</strong> was returned with comment: <em>"{r.comment}"</em>
            </span>
          </div>
          <Btn label="Edit Request" small variant="amber" onClick={() => openEdit(r)} />
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
          cols={["Request ID", "Role", "Location", "Vacancies", "Experience", "Qualification", "Type", "Salary", "Status", "Admin Comment", "Actions"]}
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
                ? <div style={{ background: T.amberLight, border: `1px solid #FDE68A`, borderRadius: 7, padding: "4px 10px", fontSize: 12, color: T.amber, fontWeight: 600, maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.comment}
                  </div>
                : <span style={{ color: T.inkFaint, fontSize: 12 }}>—</span>,
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => { setSelectedRequest(r); setShowViewModal(true); }}
                  style={{ border: "none", background: T.blueLight, color: T.blue, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                >
                  View
                </button>
                {(r.status === "Pending" || r.status === "Send Back") && (
                  <button
                    onClick={() => openEdit(r)}
                    style={{ border: "none", background: T.greenLight, color: T.green, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                  >
                    Edit
                  </button>
                )}
              </div>,
            ];
          })}
        />
      </Card>

      <Modal open={showViewModal && !!selectedRequest} onClose={() => setShowViewModal(false)} maxWidth={600}>
        {selectedRequest && (
          <>
            <ModalHeader title="Job Request Details" onClose={() => setShowViewModal(false)} />
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <Badge label={selectedRequest.status} variant={statusVariant(selectedRequest.status)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[
                ["Role", selectedRequest.role],
                ["Vacancies", selectedRequest.vacancies],
                ["Experience", selectedRequest.exp],
                ["Qualification", selectedRequest.qual],
                ["Employment Type", selectedRequest.type],
                ["Salary Range", selectedRequest.salary],
                ["Location", selectedRequest.location],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, color: T.ink }}>{value || "—"}</div>
                </div>
              ))}
            </div>
            {selectedRequest.description && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Description</div>
                <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.description}</div>
              </div>
            )}
            {selectedRequest.justification && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Justification</div>
                <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.justification}</div>
              </div>
            )}
            {selectedRequest.comment && (
              <div style={{ background: T.amberLight, border: `1px solid #FDE68A`, borderRadius: 8, padding: "10px 14px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.amber, marginBottom: 4 }}>Admin Comment</div>
                <div style={{ fontSize: 13, color: T.inkMid }}>{selectedRequest.comment}</div>
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              <Btn label="Close" onClick={() => setShowViewModal(false)} />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
