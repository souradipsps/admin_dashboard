import { T, font, radius, transition } from "../theme";
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

      {/* Primary KPIs — staggered entrance */}
      <div style={{ display: "grid", gridTemplateColumns: kpiCols, gap: 14, marginBottom: 20 }}>
        {kpis.map((k, idx) => (
          <div
            key={k.label}
            className="animate-fade-in-up"
            style={{ animationDelay: `${idx * 0.06}s` }}
          >
            <Card style={{ padding: isMobile ? 16 : 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div
                  style={{
                    width: 38, height: 38, borderRadius: radius.lg, background: k.bg,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                    transition: transition.medium,
                  }}
                >
                  {k.icon}
                </div>
                <span
                  className="animate-count-up"
                  style={{ 
                    fontSize: isMobile ? font['2xl'] : font['3xl'], 
                    fontWeight: font.black, 
                    fontFamily: font.heading,
                    color: k.color, 
                    lineHeight: 1,
                    animationDelay: `${idx * 0.06 + 0.15}s`,
                  }}
                >
                  {k.value}
                </span>
              </div>
              <div style={{ fontSize: font.sm + 1, fontWeight: font.bold, fontFamily: font.body, color: T.ink, letterSpacing: "-0.01em" }}>{k.label}</div>
              <div style={{ fontSize: font.xs, fontFamily: font.body, color: T.inkFaint, marginTop: 3 }}>{k.sub}</div>
            </Card>
          </div>
        ))}
      </div>

      {/* Analytics KPIs — staggered entrance */}
      <div style={{ display: "grid", gridTemplateColumns: analyticsCols, gap: 14, marginBottom: 20 }}>
        {analyticsKpis.map((m, idx) => (
          <div
            key={m.label}
            className="animate-fade-in-up"
            style={{ animationDelay: `${0.3 + idx * 0.06}s` }}
          >
            <Card style={{ padding: isMobile ? 16 : 20, borderLeft: `4px solid ${m.color}` }}>
              <div style={{ 
                fontSize: isMobile ? font['2xl'] : font['3xl'], 
                fontWeight: font.black, 
                fontFamily: font.heading,
                color: m.color,
                letterSpacing: "-0.02em",
              }}>
                {m.value}
              </div>
              <div style={{ fontSize: font.sm + 1, fontWeight: font.bold, fontFamily: font.body, color: T.ink, marginTop: 6 }}>{m.label}</div>
              <div style={{ fontSize: font.sm, fontFamily: font.body, color: T.inkFaint, marginTop: 3 }}>{m.sub}</div>
            </Card>
          </div>
        ))}
      </div>

      {/* Dept Progress + Monthly Trends */}
      <div style={{ display: "grid", gridTemplateColumns: twoCol, gap: 14, marginBottom: 14 }}>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Card style={{ padding: 20 }}>
            <div style={{ 
              fontSize: font.sm, fontWeight: font.bold, fontFamily: font.body,
              color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 
            }}>
              Hiring Progress by Dept
            </div>
            {deptProgress.map((d, i) => {
              const pct = d.total ? Math.round((d.filled / d.total) * 100) : 0;
              return (
                <div key={d.dept} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: font.base, fontFamily: font.body, color: T.ink, fontWeight: font.semibold }}>{d.dept}</span>
                    <span style={{ fontSize: font.sm + 1, fontFamily: font.body, color: pct >= 100 ? T.green : T.inkFaint, fontWeight: font.semibold }}>{d.filled}/{d.total}</span>
                  </div>
                  <div style={{ background: T.canvas, borderRadius: radius.full, height: 8, overflow: "hidden" }}>
                    <div
                      className="progress-animate"
                      style={{
                        width: `${pct}%`, height: "100%",
                        background: pct === 100 ? T.green : `linear-gradient(90deg, ${T.primary}, ${T.accent})`,
                        borderRadius: radius.full,
                        animationDelay: `${0.5 + i * 0.1}s`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
          <Card style={{ padding: 20 }}>
            <div style={{ 
              fontSize: font.sm, fontWeight: font.bold, fontFamily: font.body,
              color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 
            }}>
              Monthly Hiring Trends
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 120, marginBottom: 10 }}>
              {monthly.map((m, idx) => (
                <div key={m.m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: "100%", justifyContent: "flex-end" }}>
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 2, height: "100%" }}>
                    {m.hires > 0 && (
                      <div 
                        className="animate-fade-in-up"
                        style={{ 
                          width: "50%", height: `${(m.hires / 4) * 40}px`, 
                          background: `linear-gradient(180deg, ${T.teal}, ${T.tealDark})`, 
                          borderRadius: "4px 4px 0 0", minHeight: 4,
                          animationDelay: `${0.6 + idx * 0.08}s`,
                        }} 
                      />
                    )}
                    <div
                      className="animate-fade-in-up"
                      style={{
                        width: "100%", height: `${(m.apps / maxA) * 90}px`,
                        background: `${T.primary}18`, borderRadius: "5px 5px 0 0",
                        border: `1.5px solid ${T.primary}35`, borderBottom: "none",
                        animationDelay: `${0.55 + idx * 0.08}s`,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: font.xs, fontFamily: font.body, color: T.inkFaint, fontWeight: font.semibold }}>{m.m}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              {[["Applications", `${T.primary}18`, `${T.primary}35`], ["Hires", T.teal, T.teal]].map(([l, bg, border]) => (
                <div key={l} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, background: bg, border: `1.5px solid ${border}`, borderRadius: 2 }} />
                  <span style={{ fontSize: font.sm, fontFamily: font.body, color: T.inkLight }}>{l}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Pipeline + Upcoming */}
      <div style={{ display: "grid", gridTemplateColumns: twoCol, gap: 14, marginBottom: 14 }}>
        <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <Card style={{ padding: 20 }}>
            <div style={{ 
              fontSize: font.sm, fontWeight: font.bold, fontFamily: font.body,
              color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 
            }}>
              Recruitment Funnel
            </div>
            {pipeline.map((p, i) => {
              const w = isMobile ? 100 : 100 - i * 11;
              const pct = Math.round((p.n / 47) * 100);
              const change = p.n - p.prev;
              return (
                <div 
                  key={p.stage}
                  className="animate-fade-in-up"
                  style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, animationDelay: `${0.6 + i * 0.08}s` }}
                >
                  <div
                    className="card-hover"
                    style={{
                      width: `${w}%`, background: `${p.color}12`, border: `1.5px solid ${p.color}35`,
                      borderRadius: radius.md + 2, padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: transition.medium,
                    }}
                  >
                    <span style={{ fontSize: font.sm + 1, fontWeight: font.bold, fontFamily: font.body, color: p.color }}>{p.stage}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: font.md + 1, fontWeight: font.black, fontFamily: font.heading, color: T.ink }}>{p.n}</span>
                      <span style={{ fontSize: font.xs, color: change > 0 ? T.green : T.red, fontWeight: font.bold, fontFamily: font.body }}>
                        {change > 0 ? "+" : ""}{change}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: font.sm, fontFamily: font.body, color: T.inkFaint, width: 30 }}>{pct}%</span>
                </div>
              );
            })}
          </Card>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
          <Card style={{ padding: 20 }}>
            <div style={{ 
              fontSize: font.sm, fontWeight: font.bold, fontFamily: font.body,
              color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 
            }}>
              Upcoming Interviews
            </div>
            {upcoming.length === 0 && (
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>📅</div>
                <div style={{ fontSize: font.base, fontFamily: font.body, color: T.inkFaint }}>No upcoming interviews</div>
              </div>
            )}
            {upcoming.map((u, i) => (
              <div key={i} style={{ background: T.canvas, borderRadius: radius.lg, padding: "14px 16px", marginBottom: 10, border: `1px solid ${T.border}`, transition: transition.fast }}>
                <div style={{ fontSize: font.base, fontWeight: font.bold, fontFamily: font.body, color: T.ink }}>{u.name}</div>
                <div style={{ fontSize: font.sm + 1, fontFamily: font.body, color: T.inkLight, marginTop: 2 }}>{u.role}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: font.sm, fontFamily: font.body, color: T.primary, fontWeight: font.semibold }}>{u.date} · {u.time}</span>
                  <span style={{ fontSize: font.sm, fontFamily: font.body, color: T.inkFaint }}>Panel: {u.panel}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Recent Activity — staggered items */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
        <Card style={{ padding: 20 }}>
          <div style={{ 
            fontSize: font.sm, fontWeight: font.bold, fontFamily: font.body,
            color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 
          }}>
            Recent Activity
          </div>
          {activity.map((a, i) => (
            <div 
              key={i} 
              className="animate-fade-in-up"
              style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14, animationDelay: `${0.65 + i * 0.06}s` }}
            >
              <div style={{ 
                width: 9, height: 9, borderRadius: "50%", background: a.dot, marginTop: 5, flexShrink: 0,
                boxShadow: `0 0 0 3px ${a.dot}20`,
              }} />
              <div style={{ flex: 1, fontSize: font.base, fontFamily: font.body, color: T.inkMid, lineHeight: 1.5 }}>{a.text}</div>
              <div style={{ fontSize: font.sm, fontFamily: font.body, color: T.inkFaint, whiteSpace: "nowrap" }}>{a.time}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
