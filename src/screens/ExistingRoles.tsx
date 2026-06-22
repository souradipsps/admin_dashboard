import React, { useState } from "react";
import { T } from "../theme";
import { STATUS_COLORS } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Table, Badge, Mono, Input } from "../components/ui";

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

  const filtered = roles
    .filter((r) => deptFilter === "All" || r.dept === deptFilter)
    .filter((r) => statusFilter === "All" || r.currentStatus === statusFilter)
    .filter((r) => r.role.toLowerCase().includes(search.toLowerCase()) || r.dept.toLowerCase().includes(search.toLowerCase()));

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
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: T.inkMid, background: "#fff", cursor: "pointer" }}
          >
            {depts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ border: `1.5px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: T.inkMid, background: "#fff", cursor: "pointer" }}
          >
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: 12, color: T.inkFaint, marginLeft: "auto" }}>{filtered.length} roles</span>
        </div>

        <Table
          cols={["Role ID", "Department", "Role Name", "Experience", "Salary Range", "Type", "Status"]}
          rows={filtered.map((r) => {
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
                onChange={(e) => handleStatusChange(r.id, e.target.value)}
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
            ];
          })}
        />
      </Card>
    </div>
  );
}
