import React, { useState } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Table, Mono, Btn, Input, Badge, Modal, ModalHeader, FormField } from "../components/ui";

interface RoleRequestsProps {
  roleRequests: any[];
  setRoleRequests: React.Dispatch<React.SetStateAction<any[]>>;
  setApprovalRequests: React.Dispatch<React.SetStateAction<any[]>>;
  existingRoles?: any[];
  setExistingRoles?: React.Dispatch<React.SetStateAction<any[]>>;
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
  dept: "",
  role: "",
  minExperience: "",
  maxExperience: "",
  minSalary: "",
  maxSalary: "",
  just: "",
  date: new Date().toLocaleDateString(),
  status: "Pending",
  comment: "",
});

export default function RoleRequests({ roleRequests, setRoleRequests, setApprovalRequests }: RoleRequestsProps) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [showForm, setShowForm] = useState(false);
  const [roleForms, setRoleForms] = useState([emptyForm()]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<Record<number, Record<string, string>>>({});

  const updateForm = (index: number, key: string, value: string) => {
    setRoleForms((prev) => prev.map((f, i) => i === index ? { ...f, [key]: value } : f));
    // Clear the error for this field when the user edits it
    setFormErrors((prev) => {
      const updated = { ...prev };
      if (updated[index]) {
        const fieldErrors = { ...updated[index] };
        delete fieldErrors[key];
        updated[index] = fieldErrors;
      }
      return updated;
    });
  };

  const parseSalary = (val: string) => parseFloat(val.replace(/,/g, "")) || 0;

  const validateForms = (): boolean => {
    const errors: Record<number, Record<string, string>> = {};
    let valid = true;
    roleForms.forEach((f, i) => {
      const errs: Record<string, string> = {};
      const minExp = parseFloat(f.minExperience);
      const maxExp = parseFloat(f.maxExperience);
      if (f.minExperience && f.maxExperience && !isNaN(minExp) && !isNaN(maxExp) && minExp >= maxExp) {
        errs.minExperience = "Min experience must be less than max experience";
        valid = false;
      }
      const minSal = parseSalary(f.minSalary);
      const maxSal = parseSalary(f.maxSalary);
      if (f.minSalary && f.maxSalary && minSal > 0 && maxSal > 0 && minSal >= maxSal) {
        errs.minSalary = "Min salary must be less than max salary";
        valid = false;
      }
      if (Object.keys(errs).length > 0) errors[i] = errs;
    });
    setFormErrors(errors);
    return valid;
  };

  const removeForm = (index: number) => {
    setRoleForms((prev) => prev.filter((_, i) => i !== index));
  };

  const openNew = () => {
    setEditingId(null);
    setRoleForms([emptyForm()]);
    setShowForm(true);
  };

  const openEdit = (r: any) => {
    setEditingId(r.id);
    let minSalary = "";
    let maxSalary = "";
    let minExperience = "";
    let maxExperience = "";
    if (r.salaryRange) {
      const parts = r.salaryRange.split("-");
      minSalary = parts[0] || "";
      maxSalary = parts[1] || "";
    }
    if (r.experience) {
      const parts = String(r.experience).split("-");
      minExperience = parts[0] || "";
      maxExperience = parts[1] || "";
    }
    setRoleForms([{ ...r, minSalary, maxSalary, minExperience, maxExperience }]);
    setShowForm(true);
  };

  const submitRequests = () => {
    if (!validateForms()) return;
    const updatedForms = roleForms.map((f) => {
      const combinedSalary = f.minSalary && f.maxSalary ? `${f.minSalary}-${f.maxSalary}` : (f.minSalary || f.maxSalary || "");
      const combinedExperience = f.minExperience && f.maxExperience ? `${f.minExperience}-${f.maxExperience}` : (f.minExperience || f.maxExperience || "");
      return {
        ...f,
        salaryRange: combinedSalary,
        experience: combinedExperience,
      };
    });

    if (editingId !== null) {
      setRoleRequests((prev) => prev.map((r) => r.id === editingId ? { ...r, ...updatedForms[0] } : r));
      setApprovalRequests((prev) =>
        prev.map((apr) =>
          String(apr.sourceId) === String(editingId)
            ? {
                ...apr,
                dept: updatedForms[0].dept,
                role: updatedForms[0].role,
                experience: updatedForms[0].experience,
                salary: updatedForms[0].salaryRange ? `₹${updatedForms[0].salaryRange}` : "",
                just: updatedForms[0].just,
              }
            : apr
        )
      );
    } else {
      const newRequests = updatedForms.map((f, i) => ({
        ...f,
        id: `RR-${Date.now()}-${i}`,
        requestType: "Role",
      }));
      setRoleRequests((prev) => [...prev, ...newRequests]);
      setApprovalRequests((prev) => [
        ...prev,
        ...newRequests.map((r) => ({
          id: `APR-${Date.now()}-${Math.random()}`,
          dept: r.dept,
          role: r.role,
          experience: r.experience,
          requestedBy: "Current User",
          date: r.date,
          salary: r.salaryRange ? `₹${r.salaryRange}` : "",
          just: r.just,
          status: "Pending",
          comment: "",
          history: [{ act: "Submitted", by: "Current User", date: r.date, note: "" }],
          sourceId: r.id,
          type: "Role Request",
        })),
      ]);
    }
    setRoleForms([emptyForm()]);
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div>
      <SectionTitle
        title="Role Requests"
        sub="Raise role requests before creating job requests"
        action={<Btn label="+ New Role Request" onClick={openNew} />}
      />

      {roleRequests.filter((r) => r.status === "Send Back").map((r) => (
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
              Request for <strong>{r.role}</strong> was returned with comment: <em>"{r.comment}"</em>
            </span>
          </div>
          <Btn label="Edit Request" small variant="amber" onClick={() => openEdit(r)} />
        </div>
      ))}

      {showForm && (
        <div style={{ marginBottom: 20 }}>
          {roleForms.map((form, index) => (
            <Card key={form.id} style={{ padding: 20, marginBottom: 16, borderTop: `3px solid ${T.blue}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>
                  {editingId ? "Edit Role Request" : `Role Request #${index + 1}`}
                </div>
                {roleForms.length > 1 && (
                  <button onClick={() => removeForm(index)} style={{ border: "none", background: "#FEE2E2", color: "#DC2626", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
                    Remove
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <FormField label="Department" required>
                  <Input placeholder="Enter department" value={form.dept} onChange={(e) => updateForm(index, "dept", e.target.value)} />
                </FormField>
                <FormField label="Role Name" required>
                  <Input placeholder="Enter role" value={form.role} onChange={(e) => updateForm(index, "role", e.target.value)} />
                </FormField>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <FormField label="Min Experience (Yrs)" required>
                    <Input
                      placeholder="e.g. 2"
                      value={form.minExperience}
                      onChange={(e) => updateForm(index, "minExperience", e.target.value)}
                      style={formErrors[index]?.minExperience ? { borderColor: T.red } : {}}
                    />
                    {formErrors[index]?.minExperience && (
                      <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                        {formErrors[index].minExperience}
                      </div>
                    )}
                  </FormField>
                  <FormField label="Max Experience (Yrs)" required>
                    <Input placeholder="e.g. 5" value={form.maxExperience} onChange={(e) => updateForm(index, "maxExperience", e.target.value)} />
                  </FormField>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <FormField label="Min Salary (₹)" required>
                    <Input
                      placeholder="e.g. 40,000"
                      value={form.minSalary}
                      onChange={(e) => updateForm(index, "minSalary", e.target.value)}
                      style={formErrors[index]?.minSalary ? { borderColor: T.red } : {}}
                    />
                    {formErrors[index]?.minSalary && (
                      <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>
                        {formErrors[index].minSalary}
                      </div>
                    )}
                  </FormField>
                  <FormField label="Max Salary (₹)" required>
                    <Input placeholder="e.g. 60,000" value={form.maxSalary} onChange={(e) => updateForm(index, "maxSalary", e.target.value)} />
                  </FormField>
                </div>
              </div>
              <FormField label="Justification" required>
                <textarea
                  value={form.just}
                  onChange={(e) => updateForm(index, "just", e.target.value)}
                  placeholder="Why is this role needed?"
                  style={{ width: "100%", minHeight: 90, border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 12, resize: "vertical", outline: "none", fontSize: 13, boxSizing: "border-box" }}
                />
              </FormField>
            </Card>
          ))}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <Btn label="Submit Request" onClick={submitRequests} />
            {!editingId && <Btn label="+ Add More" variant="outline" onClick={() => setRoleForms((p) => [...p, emptyForm()])} />}
            <Btn label="Cancel" variant="ghost" onClick={() => { setShowForm(false); setEditingId(null); setRoleForms([emptyForm()]); }} />
          </div>
        </div>
      )}

      <Card>
        <Table
          cols={["Request ID", "Department", "Role", "Experience", "Salary Range", "Justification", "Date", "Status", "Admin Comment", "Actions"]}
          rows={roleRequests.map((r) => {
            const ss = getStatusStyle(r.status);
            return [
              <Mono v={typeof r.id === "string" ? r.id.substring(0, 18) : String(r.id)} />,
              r.dept || "—",
              <strong>{r.role || "—"}</strong>,
              r.experience ? `${r.experience} yrs` : "—",
              r.salaryRange ? `₹${r.salaryRange}` : "—",
              <span style={{ fontSize: 12, color: T.inkLight, maxWidth: 180, display: "inline-block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.just || "—"}</span>,
              r.date || "—",
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

      <Modal open={showViewModal && !!selectedRequest} onClose={() => setShowViewModal(false)} maxWidth={560}>
        {selectedRequest && (
          <>
            <ModalHeader title="Role Request Details" onClose={() => setShowViewModal(false)} />
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <Badge label={selectedRequest.status} variant={statusVariant(selectedRequest.status)} />
            </div>
            {[
              ["Department", selectedRequest.dept],
              ["Role", selectedRequest.role],
              ["Experience", selectedRequest.experience ? `${selectedRequest.experience} years` : "—"],
              ["Salary Range", selectedRequest.salaryRange ? `₹${selectedRequest.salaryRange}` : "—"],
              ["Date", selectedRequest.date],
            ].map(([label, value]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 14, color: T.ink }}>{value}</div>
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Justification</div>
              <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.just}</div>
            </div>
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
