import React, { useState, useRef } from "react";
import { T, font } from "../theme";
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    setDeleteConfirmId(roleId);
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
        ].map((card, idx) => (
          <div key={card.label} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.06}s` }}>
            <Card style={{ padding: isMobile ? 14 : 18 }}>
              <div className="animate-count-up" style={{ fontSize: isMobile ? font['2xl'] : font['3xl'], fontWeight: font.black, fontFamily: font.heading, color: card.color, animationDelay: `${idx * 0.06 + 0.1}s` }}>{card.value}</div>
              <div style={{ fontSize: font.sm + 1, fontWeight: font.bold, fontFamily: font.body, color: T.ink, marginTop: 4 }}>{card.label}</div>
            </Card>
          </div>
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

      {/* Delete Confirmation Modal */}
      <Modal open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth={400}>
        <ModalHeader title="Confirm Deletion" onClose={() => setDeleteConfirmId(null)} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "10px 0" }}>
          <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.5 }}>
            Are you sure you want to delete this existing role? This action cannot be undone.
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <Btn label="Cancel" onClick={() => setDeleteConfirmId(null)} />
            <Btn
              label="Delete"
              variant="danger"
              onClick={() => {
                if (deleteConfirmId) {
                  setRoles((prev) => prev.filter((r) => r.id !== deleteConfirmId));
                  setDeleteConfirmId(null);
                }
              }}
            />
          </div>
        </div>
      </Modal>
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
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const avatar = (name: string, size = 48, fs = 16) => {
    const val = name || "RL";
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

  const open = (r: any) => setSel(r);
  const close = () => setSel(null);

  const renderRoleDetailsModal = () => {
    if (!sel) return null;
    return (
      <Modal open={!!sel} onClose={close} maxWidth={520}>
        <div>
          <ModalHeader title="" onClose={close} />

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, borderBottom: `1px solid ${T.border}`, paddingBottom: 16 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 12,
              background: sel.currentStatus === "Active" ? T.greenLight : T.inkFaint + "15",
              color: sel.currentStatus === "Active" ? T.green : T.inkLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, flexShrink: 0
            }}>
              💼
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: font.xs, fontWeight: font.bold, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {sel.dept} · {sel.type}
              </div>
              <h3 style={{ margin: "4px 0 0", fontSize: font.lg, fontWeight: font.bold, fontFamily: font.heading, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {sel.role}
              </h3>
            </div>
            <div style={{ flexShrink: 0 }}>
              <span style={{
                fontSize: 10.5, fontWeight: 700, borderRadius: 99, padding: "3px 10px",
                background: sel.currentStatus === "Active" ? T.greenLight : T.inkFaint + "1a",
                color: sel.currentStatus === "Active" ? T.green : T.inkFaint,
                border: `1px solid ${sel.currentStatus === "Active" ? "#A7F3D0" : T.border}`
              }}>
                {sel.currentStatus}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: bp === "mobile" ? "1fr" : "1fr 1fr", gap: 12 }}>
            {[
              { label: "Role ID", value: <span style={{ fontFamily: font.mono, fontWeight: 700 }}>{sel.id}</span> },
              { label: "Department", value: sel.dept },
              { label: "Employment Type", value: sel.type },
              { label: "Work Experience Required", value: sel.experience ? `${sel.experience} years` : "No experience required" },
              { label: "Salary Budget (Annual)", value: <strong style={{ color: T.tealDark }}>{sel.salaryRange || "—"}</strong> },
              {
                label: "Status",
                value: (
                  <select
                    value={sel.currentStatus}
                    onChange={(e) => {
                      const val = e.target.value;
                      onStatusChange(sel.id, val);
                      setSel((prev: any) => prev ? { ...prev, currentStatus: val } : null);
                    }}
                    style={{
                      background: sel.currentStatus === "Active" ? T.greenLight : T.canvas,
                      color: sel.currentStatus === "Active" ? T.green : T.inkLight,
                      border: `1.5px solid ${sel.currentStatus === "Active" ? "#34D399" : T.border}`,
                      borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700,
                      cursor: "pointer", outline: "none", width: "100%"
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                )
              }
            ].map((item, idx) => (
              <div key={idx} style={{
                padding: 10, background: T.canvas, border: `1px solid ${T.border}`,
                borderRadius: 8, display: "flex", flexDirection: "column", gap: 3
              }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.label}
                </span>
                <div style={{ fontSize: 12.5, color: T.ink, fontWeight: 600 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
            <Btn
              label="Delete Role"
              variant="danger"
              onClick={() => {
                onDelete(sel.id);
                close();
              }}
            />
            <Btn label="Close Details" onClick={close} />
          </div>
        </div>
      </Modal>
    );
  };

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
          {rows.map((r: any, idx: number) => {
            const sc = STATUS_COLORS[r.currentStatus] || STATUS_COLORS.Active;
            return (
              <div
                key={r.id}
                onClick={() => open(r)}
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
                  minHeight: 350,
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
                  {idx + 1} of {rows.length}
                </div>

                <div>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 40 }}>
                    {avatar(r.role)}
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{r.role}</h3>
                      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                        {r.dept}
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
                    { icon: "🆔", label: "Role ID", value: r.id },
                    { icon: "⏳", label: "Experience", value: r.experience ? `${r.experience} yrs` : "—" },
                    { icon: "💰", label: "Salary Range", value: r.salaryRange ? `₹${r.salaryRange}` : "—" },
                    { icon: "💼", label: "Type", value: r.type },
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
                </div>

                {/* Status action row */}
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>Status</span>
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

        {/* Indicator dots */}
        {rows.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
            {rows.map((_, i) => (
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

        {renderRoleDetailsModal()}
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
      {renderRoleDetailsModal()}
    </>
  );
}

function RoleDetailsModal() { return null; }
