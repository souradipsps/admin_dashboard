import React, { useState } from "react";
import { T } from "../theme";
import { STATUS_COLORS } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Table, Badge, Mono, Input, Modal, ModalHeader, Select, Btn } from "../components/ui";

interface ExistingRolesProps {
  roles: any[];
  setRoles: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ExistingRoles({ roles, setRoles }: ExistingRolesProps) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const depts = ["All", ...new Set(roles.map((r) => r.dept))];
  const statuses = ["All", "Active", "Inactive"];

  const handleStatusChange = (roleId: string, newStatus: string) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.id === roleId ? { ...role, currentStatus: newStatus } : role,
      ),
    );
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    }
  };

  const filtered = roles
    .filter((r) => deptFilter === "All" || r.dept === deptFilter)
    .filter((r) => statusFilter === "All" || r.currentStatus === statusFilter)
    .filter((r) => r.role.toLowerCase().includes(search.toLowerCase()) || r.dept.toLowerCase().includes(search.toLowerCase()) || String(r.id).toLowerCase().includes(search.toLowerCase()));

  const totalRoles = roles.length;
  const activeRoles = roles.filter((r) => r.currentStatus === "Active").length;
  const inactiveRoles = roles.filter((r) => r.currentStatus !== "Active").length;

  return (
    <div>
      <SectionTitle title="Existing Roles" sub="All sanctioned positions across departments" />

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Roles", value: totalRoles, color: T.blue },
          { label: "Active Roles", value: activeRoles, color: T.green },
          { label: "Inactive", value: inactiveRoles, color: T.amber },
        ].map((card) => (
          <Card key={card.label} style={{ padding: isMobile ? 14 : 18 }}>
            <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.ink, marginTop: 4 }}>{card.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Input
            placeholder="Search roles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: isMobile ? "100%" : 240 }}
          />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", width: isMobile ? "100%" : "auto" }}>
            <div style={{ minWidth: isMobile ? "100%" : 220 }}>
              <Select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                options={depts.map((d) => ({ value: d, label: d }))}
                placeholder="All departments"
              />
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    border: `1px solid ${statusFilter === s ? T.primary : T.border}`,
                    background: statusFilter === s ? T.primary : T.surface,
                    color: statusFilter === s ? "#fff" : T.ink,
                    borderRadius: 99,
                    padding: "6px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <span style={{ fontSize: 12, color: T.inkFaint, marginLeft: "auto" }}>{filtered.length} roles</span>
        </div>

        <RolesTable
          cols={["Role ID", "Department", "Role Name", "Experience", "Salary Range", "Type", "Status", "Action"]}
          rows={filtered}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteRole}
        />
      </Card>

      {/* Details modal for role */}
      <RoleDetailsModal />
    </div>
  );
}

// Extracted small table wrapper to handle row clicks and open modal
function RolesTable({
  cols,
  rows,
  onStatusChange,
  onDelete,
}: {
  cols: string[];
  rows: any[];
  onStatusChange: (id: string, s: string) => void;
  onDelete: (id: string) => void;
}) {
  const [sel, setSel] = useState<any>(null);
  const bp = useBreakpoint();

  const open = (r: any) => setSel(r);
  const close = () => setSel(null);

  const renderRows = () => rows.map((r: any) => {
    const sc = STATUS_COLORS[r.currentStatus] || STATUS_COLORS.Active;
    return [
      <Mono v={r.id} />,
      <span style={{ fontSize: 12, color: T.inkMid }}>{r.dept}</span>,
      <strong style={{ color: T.ink }}>{r.role}</strong>,
      <span style={{ fontSize: 13, color: T.ink }}>{r.experience ? `${r.experience} yrs` : "—"}</span>,
      <span style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{r.salaryRange ? `₹${r.salaryRange}` : "—"}</span>,
      <Badge label={r.type} variant={r.type === "Full-time" ? "blue" : "teal"} />,
      <select
        value={r.currentStatus}
        onChange={(e) => onStatusChange(r.id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`,
          borderRadius: 99, padding: "3px 24px 3px 10px", fontSize: 11, fontWeight: 700,
          cursor: "pointer", outline: "none", appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='${encodeURIComponent(sc.color)}' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
        }}
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>,
      <Btn
        label="Delete"
        variant="danger"
        small
        onClick={(e) => {
          e.stopPropagation();
          onDelete(r.id);
        }}
      />,
    ];
  });

  if (bp === "mobile") {
    return (
      <>
        <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
          {rows.length} role{rows.length !== 1 ? "s" : ""}
        </div>

        <div
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            gap: 12,
            paddingBottom: 4,
          }}
        >
          {rows.map((r: any, idx: number) => {
            const sc = STATUS_COLORS[r.currentStatus] || STATUS_COLORS.Active;
            return (
              <div
                key={r.id}
                onClick={() => open(r)}
                style={{
                  flexShrink: 0,
                  width: "100%",
                  scrollSnapAlign: "center",
                  background: T.surface,
                  borderRadius: 18,
                  border: `1.5px solid ${T.border}`,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${T.primaryPale} 0%, ${T.canvas} 100%)`,
                    padding: "16px 18px 14px",
                    borderBottom: `1px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.role}</div>
                    <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 4 }}>{r.dept}</div>
                  </div>
                  <div style={{ fontSize: 11, color: T.inkFaint, flexShrink: 0 }}>
                    {idx + 1}/{rows.length}
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8, borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Role ID</span>
                    <Mono v={r.id} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Experience</span>
                    <span style={{ fontSize: 13, color: T.ink }}>{r.experience ? `${r.experience} yrs` : "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Salary Range</span>
                    <span style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{r.salaryRange ? `₹${r.salaryRange}` : "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</span>
                    <Badge label={r.type} variant={r.type === "Full-time" ? "blue" : "teal"} />
                  </div>
                </div>

                {/* Status action row */}
                <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</span>
                    <select
                      value={r.currentStatus}
                      onChange={(e) => onStatusChange(r.id, e.target.value)}
                      style={{
                        background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}`,
                        borderRadius: 99, padding: "3px 24px 3px 10px", fontSize: 11, fontWeight: 700,
                        cursor: "pointer", outline: "none", appearance: "none",
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='${encodeURIComponent(sc.color)}' d='M5 7L1 3h8z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <Btn
                    label="Delete"
                    variant="danger"
                    small
                    onClick={() => onDelete(r.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Modal open={!!sel} onClose={close} maxWidth={720}>
          {sel && (
            <div>
              <ModalHeader title="Role details" onClose={close} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                <div style={{ padding: 12, border: `1px solid ${T.border}`, borderRadius: 10, background: T.canvas }}>
                  <div style={{ fontSize: 12, color: T.inkFaint }}>Role ID</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginTop: 6 }}>{sel.id}</div>
                  <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 10 }}>Department</div>
                  <div style={{ fontSize: 13, color: T.ink, marginTop: 6 }}>{sel.dept}</div>
                  <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 10 }}>Type</div>
                  <div style={{ fontSize: 13, color: T.ink, marginTop: 6 }}>{sel.type}</div>
                </div>
                <div style={{ padding: 12, border: `1px solid ${T.border}`, borderRadius: 10, background: T.canvas }}>
                  <div style={{ fontSize: 12, color: T.inkFaint }}>Role Name</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginTop: 6 }}>{sel.role}</div>
                  <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 10 }}>Experience</div>
                  <div style={{ fontSize: 13, color: T.ink, marginTop: 6 }}>{sel.experience ? `${sel.experience} yrs` : "—"}</div>
                  <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 10 }}>Salary Range</div>
                  <div style={{ fontSize: 13, color: T.ink, fontWeight: 700, marginTop: 6 }}>{sel.salaryRange || "—"}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                <Btn
                  label="Delete Role"
                  variant="danger"
                  onClick={() => {
                    onDelete(sel.id);
                    close();
                  }}
                />
                <Btn label="Close" onClick={close} />
              </div>
            </div>
          )}
        </Modal>
      </>
    );
  }

  return (
    <>
      <Table
        cols={cols}
        rows={renderRows()}
        onRowClick={(i) => open(rows[i])}
      />
      <Modal open={!!sel} onClose={close} maxWidth={720}>
        {sel && (
          <div>
            <ModalHeader title="Role details" onClose={close} />
            <div style={{ display: "grid", gridTemplateColumns: bp === "mobile" ? "1fr" : "1fr 1fr", gap: 12 }}>
              <div style={{ padding: 12, border: `1px solid ${T.border}`, borderRadius: 10, background: T.canvas }}>
                <div style={{ fontSize: 12, color: T.inkFaint }}>Role ID</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginTop: 6 }}>{sel.id}</div>
                <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 10 }}>Department</div>
                <div style={{ fontSize: 13, color: T.ink, marginTop: 6 }}>{sel.dept}</div>
                <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 10 }}>Type</div>
                <div style={{ fontSize: 13, color: T.ink, marginTop: 6 }}>{sel.type}</div>
              </div>
              <div style={{ padding: 12, border: `1px solid ${T.border}`, borderRadius: 10, background: T.canvas }}>
                <div style={{ fontSize: 12, color: T.inkFaint }}>Role Name</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, marginTop: 6 }}>{sel.role}</div>
                <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 10 }}>Experience</div>
                <div style={{ fontSize: 13, color: T.ink, marginTop: 6 }}>{sel.experience ? `${sel.experience} yrs` : "—"}</div>
                <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 10 }}>Salary Range</div>
                <div style={{ fontSize: 13, color: T.ink, fontWeight: 700, marginTop: 6 }}>{sel.salaryRange || "—"}</div>
              </div>
            </div>
            {/* Summary removed as requested */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <Btn
                label="Delete Role"
                variant="danger"
                onClick={() => {
                  onDelete(sel.id);
                  close();
                }}
              />
              <Btn label="Close" onClick={close} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function RoleDetailsModal() { return null; }
