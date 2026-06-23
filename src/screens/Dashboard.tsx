import { T } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Btn } from "../components/ui";

interface DashboardProps {
  approvalRequests: any[];
}

export default function Dashboard({ approvalRequests }: DashboardProps) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const pendingCount = approvalRequests.filter((r) => r.status === "Pending").length;

  const kpis = [
    { label: "Open Positions", value: 6, icon: "📋", color: T.primary, bg: T.primaryLight, sub: "+2 this month" },
    { label: "Pending Approvals", value: pendingCount, icon: "⏳", color: T.accentDark, bg: T.accentLight, sub: "Needs attention" },
    { label: "Total Applicants", value: 47, icon: "👥", color: T.teal, bg: T.tealLight, sub: "Across all roles" },
    { label: "Interviews Scheduled", value: 5, icon: "🗓", color: T.violet, bg: T.violetLight, sub: "Next 7 days" },
    { label: "Offers Released", value: 3, icon: "📨", color: T.green, bg: T.greenLight, sub: "This month" },
    { label: "New Joiners", value: 2, icon: "🎉", color: T.primary, bg: T.primaryLight, sub: "June 2026" },
  ];

  const analyticsKpis = [
    { label: "Offer Acceptance Rate", value: "66.7%", sub: "2 of 3 accepted", color: T.green, bg: T.greenLight },
    { label: "Interview Conversion", value: "44.4%", sub: "4 of 9 selected", color: T.primary, bg: T.primaryLight },
    { label: "Avg. Time to Fill", value: "32 days", sub: "Across all roles", color: T.accentDark, bg: T.accentLight },
    { label: "Sourcing Efficiency", value: "8.5%", sub: "Apps to Hires", color: T.teal, bg: T.tealLight },
  ];

  const pipeline = [
    { stage: "Applied", n: 47, prev: 30, color: T.sky },
    { stage: "Shortlisted", n: 18, prev: 12, color: T.violet },
    { stage: "Selected", n: 4, prev: 3, color: T.teal },
    { stage: "Offered", n: 3, prev: 2, color: T.green },
  ];

  const monthly = [
    { m: "Jan", apps: 12, hires: 1 },
    { m: "Feb", apps: 8, hires: 0 },
    { m: "Mar", apps: 22, hires: 3 },
    { m: "Apr", apps: 15, hires: 2 },
    { m: "May", apps: 30, hires: 4 },
    { m: "Jun", apps: 47, hires: 2 },
  ];
  const maxA = Math.max(...monthly.map((x) => x.apps));

  const deptProgress = [
    { dept: "Science", filled: 1, total: 5 },
    { dept: "Commerce", filled: 0, total: 3 },
    { dept: "Admin", filled: 1, total: 2 },
    { dept: "Arts", filled: 2, total: 4 },
    { dept: "Sports", filled: 0, total: 2 },
  ];

  const activity = [
    { dot: T.teal, text: "APP-2026-0006 — Deepak Nair rejected for Mathematics Teacher", time: "2h ago" },
    { dot: T.green, text: "OFR-2026-0002 accepted by Sonal Verma · Onboarding initiated", time: "4h ago" },
    { dot: T.accent, text: "JR-2026-0003 (Lab Assistant x3) submitted for approval", time: "Yesterday" },
  ];

  const upcoming: any[] = [];

  const kpiCols = isMobile ? "repeat(2,1fr)" : isTablet ? "repeat(3,1fr)" : "repeat(6,1fr)";
  const analyticsCols = isMobile ? "1fr 1fr" : "repeat(4,1fr)";
  const twoCol = isMobile ? "1fr" : "1fr 1fr";

  return (
    <div>
      <SectionTitle
        title="Recruitment Dashboard"
        sub="South Point School — June 2026"
        action={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn label="Export PDF" variant="outline" small onClick={() => alert("PDF export would be implemented here.")} />
            <Btn label="Export Excel" variant="outline" small onClick={() => alert("Excel export would be implemented here.")} />
          </div>
        }
      />

      {/* Primary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: kpiCols, gap: 12, marginBottom: 18 }}>
        {kpis.map((k) => (
          <Card key={k.label} style={{ padding: isMobile ? 14 : 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: 10, background: k.bg,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}
              >
                {k.icon}
              </div>
              <span style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: k.color, lineHeight: 1 }}>
                {k.value}
              </span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.ink }}>{k.label}</div>
            <div style={{ fontSize: 10, color: T.inkFaint, marginTop: 2 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Analytics KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: analyticsCols, gap: 12, marginBottom: 18 }}>
        {analyticsKpis.map((m) => (
          <Card key={m.label} style={{ padding: isMobile ? 14 : 18, borderLeft: `4px solid ${m.color}` }}>
            <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: 900, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.ink, marginTop: 5 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 3 }}>{m.sub}</div>
          </Card>
        ))}
      </div>

      {/* Dept Progress + Monthly Trends */}
      <div style={{ display: "grid", gridTemplateColumns: twoCol, gap: 14, marginBottom: 14 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Hiring Progress by Dept
          </div>
          {deptProgress.map((d) => {
            const pct = d.total ? Math.round((d.filled / d.total) * 100) : 0;
            return (
              <div key={d.dept} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{d.dept}</span>
                  <span style={{ fontSize: 12, color: pct >= 100 ? T.green : T.inkFaint }}>{d.filled}/{d.total}</span>
                </div>
                <div style={{ background: T.canvas, borderRadius: 99, height: 7, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${pct}%`, height: "100%",
                      background: pct === 100 ? T.green : `linear-gradient(90deg,${T.primary},${T.teal})`,
                      borderRadius: 99, transition: "width 0.6s",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Monthly Hiring Trends
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 110, marginBottom: 8 }}>
            {monthly.map((m) => (
              <div key={m.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%", justifyContent: "flex-end" }}>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 2, height: "100%" }}>
                  {m.hires > 0 && (
                    <div style={{ width: "50%", height: `${(m.hires / 4) * 40}px`, background: T.teal, borderRadius: "3px 3px 0 0", minHeight: 4 }} />
                  )}
                  <div
                    style={{
                      width: "100%", height: `${(m.apps / maxA) * 90}px`,
                      background: `${T.primary}22`, borderRadius: "4px 4px 0 0",
                      border: `1.5px solid ${T.primary}44`, borderBottom: "none",
                    }}
                  />
                </div>
                <div style={{ fontSize: 10, color: T.inkFaint, fontWeight: 600 }}>{m.m}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {[["Applications", `${T.primary}22`, `${T.primary}44`], ["Hires", T.teal, T.teal]].map(([l, bg, border]) => (
              <div key={l} style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <div style={{ width: 10, height: 10, background: bg, border: `1.5px solid ${border}`, borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: T.inkLight }}>{l}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Pipeline + Upcoming */}
      <div style={{ display: "grid", gridTemplateColumns: twoCol, gap: 14, marginBottom: 14 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Recruitment Funnel
          </div>
          {pipeline.map((p, i) => {
            const w = isMobile ? 100 : 100 - i * 11;
            const pct = Math.round((p.n / 47) * 100);
            const change = p.n - p.prev;
            return (
              <div key={p.stage} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div
                  style={{
                    width: `${w}%`, background: `${p.color}15`, border: `1.5px solid ${p.color}40`,
                    borderRadius: 8, padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.stage}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: T.ink }}>{p.n}</span>
                    <span style={{ fontSize: 10, color: change > 0 ? T.green : T.red, fontWeight: 700 }}>
                      {change > 0 ? "+" : ""}{change}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: T.inkFaint, width: 30 }}>{pct}%</span>
              </div>
            );
          })}
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            Upcoming Interviews
          </div>
          {upcoming.map((u, i) => (
            <div key={i} style={{ background: T.canvas, borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{u.name}</div>
              <div style={{ fontSize: 12, color: T.inkLight, marginTop: 2 }}>{u.role}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: T.primary, fontWeight: 600 }}>{u.date} · {u.time}</span>
                <span style={{ fontSize: 11, color: T.inkFaint }}>Panel: {u.panel}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card style={{ padding: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
          Recent Activity
        </div>
        {activity.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.dot, marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: 13, color: T.inkMid }}>{a.text}</div>
            <div style={{ fontSize: 11, color: T.inkFaint, whiteSpace: "nowrap" }}>{a.time}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}
