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
    case "Cancelled": return { border: "1.5px solid #6B7280", background: "#F3F4F6", color: "#6B7280" };
    case "Sent Back": return { border: `1.5px solid ${T.amber}`, background: T.amberLight, color: T.amber };
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

  const saveRoleRequestEdits = (submitAsPending: boolean) => {
    if (!selectedRequest) return;
    const minS = selectedRequest.minSalary ?? selectedRequest.salaryRange?.split("-")[0]?.trim() ?? "";
    const maxS = selectedRequest.maxSalary ?? selectedRequest.salaryRange?.split("-")[1]?.trim() ?? "";
    const minE = selectedRequest.minExperience ?? selectedRequest.experience?.split("-")[0]?.trim() ?? "";
    const maxE = selectedRequest.maxExperience ?? selectedRequest.experience?.split("-")[1]?.trim() ?? "";

    const combinedSalary = minS && maxS ? `${minS}-${maxS}` : (minS || maxS || "");
    const combinedExperience = minE && maxE ? `${minE}-${maxE}` : (minE || maxE || "");

    const updated = {
      ...selectedRequest,
      salaryRange: combinedSalary,
      experience: combinedExperience,
      status: submitAsPending ? "Pending" : selectedRequest.status,
    };

    // Remove temp fields
    delete updated.minSalary;
    delete updated.maxSalary;
    delete updated.minExperience;
    delete updated.maxExperience;

    // Update role requests
    setRoleRequests((prev) => prev.map((r) => r.id === selectedRequest.id ? updated : r));

    // Update approval requests
    setApprovalRequests((prev) =>
      prev.map((apr) =>
        String(apr.sourceId) === String(selectedRequest.id)
          ? {
              ...apr,
              dept: updated.dept,
              role: updated.role,
              experience: updated.experience,
              salary: updated.salaryRange ? `₹${updated.salaryRange}` : "",
              just: updated.just,
              status: updated.status,
            }
          : apr
      )
    );

    setShowViewModal(false);
    setSelectedRequest(null);
  };

  const cancelRoleRequest = (reqId: any) => {
    setRoleRequests((prev) =>
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

  return (
    <div>
      <SectionTitle
        title="Role Requests"
        sub="Raise role requests before creating job requests"
        action={<Btn label="+ New Role Request" onClick={openNew} />}
      />

      {roleRequests.filter((r) => r.status === "Sent Back").map((r) => (
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
              Request for <strong>{r.role}</strong> was returned with comment: <em>...</em>
            </span>
          </div>
          <Btn label="View Request" small variant="amber" onClick={() => { setSelectedRequest(r); setShowViewModal(true); }} />
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
          onRowClick={(index) => {
            setSelectedRequest(roleRequests[index]);
            setShowViewModal(true);
          }}
          cols={["Request ID", "Department", "Role", "Experience", "Salary Range", "Justification", "Date", "Status", "Admin Comment"]}
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
                  <Badge label="Role Request" variant="blue" />
                  <Badge label={selectedRequest.status} variant={statusVariant(selectedRequest.status)} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>
                  {selectedRequest.role || "Role Request Details"}
                </div>
                <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
                  {selectedRequest.dept && selectedRequest.dept !== "N/A" ? `${selectedRequest.dept} · ` : ""}{selectedRequest.date}
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
                {/* Department */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Department</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <input
                      value={selectedRequest.dept || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, dept: e.target.value })}
                      placeholder="Department"
                      style={{ width: "100%", padding: 9, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{selectedRequest.dept || "—"}</div>
                  )}
                </div>

                {/* Role Name */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Role Name</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <input
                      value={selectedRequest.role || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, role: e.target.value })}
                      placeholder="Role Name"
                      style={{ width: "100%", padding: 9, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{selectedRequest.role || "—"}</div>
                  )}
                </div>

                {/* Salary Range */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Salary Range</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 3 }}>Min (₹)</div>
                        <input
                          value={selectedRequest.minSalary ?? selectedRequest.salaryRange?.split("-")[0] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, minSalary: e.target.value })}
                          placeholder="e.g. 40,000"
                          style={{ width: "100%", padding: 9, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 3 }}>Max (₹)</div>
                        <input
                          value={selectedRequest.maxSalary ?? selectedRequest.salaryRange?.split("-")[1] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, maxSalary: e.target.value })}
                          placeholder="e.g. 60,000"
                          style={{ width: "100%", padding: 9, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>₹{selectedRequest.salaryRange || "—"}</div>
                  )}
                </div>

                {/* Experience */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Experience</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 3 }}>Min (yrs)</div>
                        <input
                          value={selectedRequest.minExperience ?? selectedRequest.experience?.split("-")[0] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, minExperience: e.target.value })}
                          placeholder="e.g. 2"
                          style={{ width: "100%", padding: 9, border: `1.5px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: T.inkFaint, marginBottom: 3 }}>Max (yrs)</div>
                        <input
                          value={selectedRequest.maxExperience ?? selectedRequest.experience?.split("-")[1] ?? ""}
                          onChange={(e) => setSelectedRequest({ ...selectedRequest, maxExperience: e.target.value })}
                          placeholder="e.g. 5"
                          style={{ width: "100%", padding: 9, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: T.surface, color: T.ink }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{selectedRequest.experience ? `${selectedRequest.experience} yrs` : "—"}</div>
                  )}
                </div>

                {/* Justification */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Justification</div>
                  {selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back" ? (
                    <textarea
                      value={selectedRequest.just || ""}
                      onChange={(e) => setSelectedRequest({ ...selectedRequest, just: e.target.value })}
                      placeholder="Why is this role needed?"
                      style={{ width: "100%", minHeight: 80, padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", background: T.surface, color: T.ink }}
                    />
                  ) : (
                    <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{selectedRequest.just}</div>
                  )}
                </div>
              </div>

              {selectedRequest.comment && (
                <div style={{ background: T.amberLight, border: `1px solid #FDE68A`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.amber, marginBottom: 4 }}>Admin Comment</div>
                  <div style={{ fontSize: 13, color: T.inkMid }}>{selectedRequest.comment}</div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            {(selectedRequest.status === "Pending" || selectedRequest.status === "Sent Back") ? (
              <div style={{
                padding: "16px 24px",
                borderTop: `1px solid ${T.border}`,
                display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap",
                background: T.canvas, borderRadius: "0 0 16px 16px",
              }}>
                <Btn label="Cancel Request" variant="danger" small onClick={() => cancelRoleRequest(selectedRequest.id)} />
                <Btn label="Accept" variant="success" small onClick={() => saveRoleRequestEdits(true)} />
              </div>
            ) : (
              <div style={{
                padding: "16px 24px",
                borderTop: `1px solid ${T.border}`,
                display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap",
                background: T.canvas, borderRadius: "0 0 16px 16px",
              }}>
                <Btn label="Close" variant="ghost" small onClick={() => { setShowViewModal(false); setSelectedRequest(null); }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
