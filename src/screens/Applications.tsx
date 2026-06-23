import React, { useState, useRef } from "react";
import { T, statusVariant } from "../theme";
import { useBreakpoint, useHorizontalScroll } from "../hooks";
import { Card, SectionTitle, Table, Mono, Badge, Input, Btn, Modal, ModalHeader, Select, FormField } from "../components/ui";

const STATUS_OPTIONS = [
  { value: "Shortlisted", label: "Shortlisted" },
  { value: "Applied", label: "Applied" },
  { value: "Rejected", label: "Rejected" },
];

type Tab = "job" | "general";

export default function Applications({
  jobApplications,
  setJobApplications,
  generalApplications,
  setGeneralApplications,
  jobPostings = [],
  jobRequests = [],
}: {
  jobApplications: any[];
  setJobApplications: React.Dispatch<React.SetStateAction<any[]>>;
  generalApplications: any[];
  setGeneralApplications: React.Dispatch<React.SetStateAction<any[]>>;
  jobPostings?: any[];
  jobRequests?: any[];
}) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [tab, setTab] = useState<Tab>("general");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [statusModalApp, setStatusModalApp] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [filterActiveIndex, setFilterActiveIndex] = useState(0);

  const hScroll = useHorizontalScroll();
  const scrollRef = useRef<HTMLDivElement>(null);
  // lastTapRef is no longer needed for double-tap (using native onDoubleClick),
  // kept as empty ref so no other code breaks.
  const lastTapTimeRef = { current: {} as Record<string, number> };

  const statuses = ["All", "Shortlisted", "Applied", "Rejected"];
  const isJob = tab === "job";

  // Enrich job postings with request details + per-tab app counts
  const enrichedPostings = jobPostings.map((p) => {
    const jr = jobRequests.find((r: any) => r.role === p.role);
    const jobAppCount = jobApplications.filter((a) => a.jobPostingId === p.id).length;
    const genAppCount = generalApplications.filter((a) => a.preferredRole === p.role).length;
    return {
      ...p,
      exp: p.exp || jr?.exp || "—",
      type: p.type || jr?.type || "Full-time",
      qual: p.qual || jr?.qual || "—",
      sal: p.salary || jr?.sal || "—",
      jobAppCount,
      genAppCount,
    };
  });

  // The selected posting's role name drives both tabs
  const selectedRole = enrichedPostings.find((p) => p.id === selectedPostingId)?.role ?? null;

  const baseJobData = selectedPostingId
    ? jobApplications.filter((a) => a.jobPostingId === selectedPostingId)
    : jobApplications;

  const baseGenData = selectedRole
    ? generalApplications.filter((a) => a.preferredRole === selectedRole)
    : generalApplications;

  const setData = isJob ? setJobApplications : setGeneralApplications;

  const filteredJobApplications = baseJobData
    .filter((a) => filter === "All" || a.status === filter)
    .filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.role || "").toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()),
    );

  const filteredGenApplications = baseGenData
    .filter((a) => filter === "All" || a.status === filter)
    .filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        (a.preferredRole || "").toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()),
    );

  const filtered = isJob ? filteredJobApplications : filteredGenApplications;
  const data = isJob ? baseJobData : baseGenData;

  const counts = statuses.slice(1).reduce((acc, s) => {
    acc[s] = data.filter((a) => a.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const jobCount = filteredJobApplications.length;
  const genCount = filteredGenApplications.length;

  const updateStatus = (app: any, status: string) => {
    setData((prev: any[]) => prev.map((a) => (a.id === app.id ? { ...a, status } : a)));
    if (selectedApp?.id === app.id) setSelectedApp((prev: any) => ({ ...prev, status }));
    setStatusModalApp(null);
  };

  const scrollCarousel = (dir: "left" | "right") => {
    if (hScroll.ref.current) {
      hScroll.ref.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  const selectPosting = (id: string | null) => {
    setSelectedPostingId((prev) => (prev === id ? null : id));
    setFilter("All");
    setSearch("");
  };

  const avatar = (name: string, size = 32, fontSize = 12) => (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: isJob ? T.blueLight : T.tealLight,
        color: isJob ? T.blue : T.tealDark,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize, fontWeight: 700, flexShrink: 0,
      }}
    >
      {name.split(" ").map((n: string) => n[0]).join("")}
    </div>
  );

  const actionBtnStyle = (variant: "view" | "status" | "shortlist" | "reject" | "offer") => {
    const common = {
      border: "none",
      borderRadius: 8,
      padding: isMobile ? "5px 8px" : "6px 12px",
      cursor: "pointer",
      fontWeight: 700 as const,
      fontSize: isMobile ? 11 : 12,
    };

    if (variant === "view") {
      return {
        ...common,
        background: isJob ? T.blueLight : T.tealLight,
        color: isJob ? T.blue : T.tealDark,
      };
    }

    if (variant === "status") {
      return {
        ...common,
        background: T.amberLight,
        color: T.amber,
      };
    }

    if (variant === "shortlist") {
      return {
        ...common,
        background: T.greenLight,
        color: T.green,
      };
    }

    if (variant === "offer") {
      return {
        ...common,
        background: T.accentLight,
        color: T.accentDark,
      };
    }

    return {
      ...common,
      background: T.redLight,
      color: T.red,
    };
  };



  const accentColor = isJob ? T.blue : T.tealDark;
  const accentPale = isJob ? T.bluePale : T.tealLight;

  return (
    <div>
      {/* Hover styles moved to global index.css */}
      <SectionTitle title="Applications" sub="Track every candidate from application to final decision" />

      {/* Unified carousel — always visible, filters both tabs */}
      {enrichedPostings.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMid }}>
              {selectedPostingId ? (
                <span>
                  Filtering by <span style={{ color: accentColor }}>{selectedRole}</span>
                  <button
                    onClick={() => {
                      selectPosting(null);
                      setFilterActiveIndex(0);
                      if (hScroll.ref.current) {
                        const cards = hScroll.ref.current.children;
                        if (cards[0]) (cards[0] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                      }
                    }}
                    style={{ marginLeft: 8, fontSize: 11, color: T.inkFaint, background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}
                  >
                    Clear ×
                  </button>
                </span>
              ) : (
                <span style={{ color: T.inkFaint }}>Select a job to filter applications</span>
              )}
            </div>
            {!isMobile && (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => scrollCarousel("left")}
                  style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}
                >‹</button>
                <button
                  onClick={() => scrollCarousel("right")}
                  style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}
                >›</button>
              </div>
            )}
          </div>

          {/* ── MOBILE: one-at-a-time full-width tile snap carousel ── */}
          {isMobile ? (
            <>
              <div
                ref={hScroll.ref}
                onScroll={(e) => {
                  const scrollLeft = e.currentTarget.scrollLeft;
                  const cardWidth = e.currentTarget.clientWidth;
                  if (cardWidth > 0) {
                    const newIndex = Math.round(scrollLeft / cardWidth);
                    setFilterActiveIndex(newIndex);
                  }
                }}
                style={{
                  display: "flex",
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  gap: 12,
                  paddingBottom: 4,
                }}
              >
                {/* All tile — full width */}
                <div
                  onClick={() => {
                    selectPosting(null);
                    setFilterActiveIndex(0);
                    if (hScroll.ref.current) {
                      const cards = hScroll.ref.current.children;
                      if (cards[0]) (cards[0] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                    }
                  }}
                  style={{
                    flexShrink: 0,
                    width: "100%",
                    border: `2px solid ${!selectedPostingId ? accentColor : T.border}`,
                    borderRadius: 16,
                    padding: "18px 20px",
                    cursor: "pointer",
                    background: !selectedPostingId ? accentPale : T.surface,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                    transition: "all 0.2s",
                    boxShadow: !selectedPostingId ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                    background: !selectedPostingId ? accentColor : T.border,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, color: "#fff",
                  }}>◈</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: !selectedPostingId ? accentColor : T.ink }}>All Jobs</div>
                    <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>
                      {isJob ? jobApplications.length : generalApplications.length} total applicants
                    </div>
                  </div>
                  {!selectedPostingId && (
                    <div style={{ background: accentColor, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>
                  )}
                </div>

                {enrichedPostings.map((p, idx) => {
                  const isSelected = selectedPostingId === p.id;
                  const displayCount = isJob ? p.jobAppCount : p.genAppCount;
                  const initials = p.role.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        selectPosting(p.id);
                        setFilterActiveIndex(idx + 1);
                        if (hScroll.ref.current) {
                          const cards = hScroll.ref.current.children;
                          if (cards[idx + 1]) (cards[idx + 1] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                        }
                      }}
                      style={{
                        flexShrink: 0,
                        width: "100%",
                        border: `2px solid ${isSelected ? accentColor : T.border}`,
                        borderRadius: 16,
                        padding: "18px 20px",
                        cursor: "pointer",
                        background: isSelected ? accentPale : T.surface,
                        transition: "all 0.2s",
                        boxShadow: isSelected ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      {/* Top row: avatar + role info + badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                          background: isSelected ? accentColor : "#E2E8F0",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 17, fontWeight: 800,
                          color: isSelected ? "#fff" : T.inkMid,
                        }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.role}</div>
                          <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>
                            {p.channel === "Internal" ? "Internal Portal" : "Career Portal"}
                          </div>
                        </div>
                        {isSelected && (
                          <div style={{ background: accentColor, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>
                        )}
                      </div>

                      {/* Bottom row: chips + count */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, gap: 8 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 11, borderRadius: 99, padding: "3px 10px", fontWeight: 700,
                            background: p.type === "Full-time" ? T.blueLight : T.tealLight,
                            color: p.type === "Full-time" ? T.blue : T.tealDark,
                          }}>{p.type}</span>
                          <span style={{
                            fontSize: 11, borderRadius: 99, padding: "3px 10px", fontWeight: 700,
                            ...(p.status === "Published"
                              ? { background: T.greenLight, color: T.green }
                              : { background: T.amberLight, color: T.amber }),
                          }}>{p.status === "Published" ? "● Live" : "○ Draft"}</span>
                          {p.exp && p.exp !== "—" && (
                            <span style={{ fontSize: 11, color: T.inkMid, background: "#F1F5F9", borderRadius: 99, padding: "3px 10px", fontWeight: 600 }}>⏱ {p.exp}</span>
                          )}
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: isSelected ? accentColor : T.ink }}>{displayCount}</span>
                          <span style={{ fontSize: 10, color: T.inkFaint, display: "block", lineHeight: 1 }}>applicants</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dot indicators */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                {[null, ...enrichedPostings.map((p) => p.id)].map((id, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (id === null) selectPosting(null);
                      else selectPosting(id);
                      setFilterActiveIndex(i);
                      if (hScroll.ref.current) {
                        const cards = hScroll.ref.current.children;
                        if (cards[i]) (cards[i] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                      }
                    }}
                    style={{
                      width: filterActiveIndex === i ? 20 : 6,
                      height: 6,
                      borderRadius: 99,
                      background: filterActiveIndex === i ? accentColor : T.border,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            /* ── DESKTOP: premium inertia + drag carousel ── */
            <div style={{ position: "relative" }}>
              {/* Left fade edge */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 8, width: 40, zIndex: 2,
                background: `linear-gradient(to right, ${T.canvas}, transparent)`,
                pointerEvents: "none", borderRadius: "14px 0 0 14px",
              }} />
              {/* Right fade edge */}
              <div style={{
                position: "absolute", right: 0, top: 0, bottom: 8, width: 40, zIndex: 2,
                background: `linear-gradient(to left, ${T.canvas}, transparent)`,
                pointerEvents: "none", borderRadius: "0 14px 14px 0",
              }} />
              <div
                ref={hScroll.ref}
                className="carousel-scroll hscroll-track"
                onWheel={hScroll.onWheel}
                onMouseDown={hScroll.onMouseDown}
                onMouseMove={hScroll.onMouseMove}
                onMouseUp={hScroll.onMouseUp}
                onMouseLeave={hScroll.onMouseLeave}
                style={{
                  display: "flex", gap: 14, overflowX: "auto",
                  paddingBottom: 8, WebkitOverflowScrolling: "touch",
                  cursor: "grab",
                  userSelect: "none",
                }}
              >
              {/* All tile */}
              <div
                onClick={() => selectPosting(null)}
                style={{
                  flexShrink: 0, width: 200, border: `2px solid ${!selectedPostingId ? accentColor : T.border}`,
                  borderRadius: 14, padding: "16px 18px", cursor: "pointer",
                  background: !selectedPostingId ? accentPale : T.surface,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, transition: "all 0.15s", minHeight: 160,
                }}
              >
                <div style={{ fontSize: 28, opacity: 0.5 }}>◈</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: !selectedPostingId ? accentColor : T.ink, textAlign: "center" }}>All Jobs</div>
                <div style={{ fontSize: 11, color: T.inkFaint, textAlign: "center" }}>
                  {isJob ? jobApplications.length : generalApplications.length} total
                </div>
                {!selectedPostingId && (
                  <div style={{ background: accentColor, color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>Selected</div>
                )}
              </div>

              {enrichedPostings.map((p) => {
                const isSelected = selectedPostingId === p.id;
                const quals = p.qual ? p.qual.split("+").map((q: string) => q.trim()).filter(Boolean) : [];
                const displayCount = isJob ? p.jobAppCount : p.genAppCount;
                return (
                  <div
                    key={p.id}
                    onClick={() => selectPosting(p.id)}
                    style={{
                      flexShrink: 0, width: 300, border: `2px solid ${isSelected ? accentColor : T.border}`,
                      borderRadius: 14, overflow: "hidden", cursor: "pointer",
                      background: isSelected ? accentPale : T.surface,
                      transition: "all 0.18s",
                      boxShadow: isSelected ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{
                      padding: "14px 16px 10px",
                      borderBottom: `1px solid ${isSelected ? `${accentColor}22` : T.border}`,
                      background: isSelected ? `${accentColor}0d` : T.canvas,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, flex: 1 }}>{p.role}</div>
                        <span style={{
                          flexShrink: 0, fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "3px 9px",
                          background: p.type === "Full-time" ? T.blueLight : T.tealLight,
                          color: p.type === "Full-time" ? T.blue : T.tealDark,
                          whiteSpace: "nowrap",
                        }}>{p.type}</span>
                      </div>
                      <div style={{ fontSize: 11, color: T.inkFaint }}>
                        {p.channel === "Internal" ? "Internal Portal" : "Career Portal"}
                      </div>
                    </div>
                    <div style={{ padding: "10px 16px", display: "flex", gap: 6, flexWrap: "wrap", borderBottom: `1px solid ${isSelected ? `${accentColor}18` : T.border}` }}>
                      {p.exp && p.exp !== "—" && (
                        <span style={{ fontSize: 11, color: T.inkMid, background: "#F1F5F9", borderRadius: 6, padding: "3px 8px", fontWeight: 600 }}>⏱ {p.exp}</span>
                      )}
                      <span style={{
                        fontSize: 11, borderRadius: 6, padding: "3px 8px", fontWeight: 600,
                        ...(p.status === "Published"
                          ? { background: T.greenLight, color: T.green }
                          : { background: T.amberLight, color: T.amber }),
                      }}>{p.status === "Published" ? "● Live" : "○ Draft"}</span>
                    </div>
                    {quals.length > 0 && (
                      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${isSelected ? `${accentColor}18` : T.border}` }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Key Qualifications</div>
                        {quals.slice(0, 3).map((q: string, i: number) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 5, marginBottom: 3 }}>
                            <span style={{ color: accentColor, fontSize: 10, marginTop: 2, flexShrink: 0 }}>●</span>
                            <span style={{ fontSize: 11, color: T.inkMid, lineHeight: 1.4 }}>{q}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: T.inkFaint }}>
                        <span style={{ fontWeight: 700, color: isSelected ? accentColor : T.ink, fontSize: 15 }}>{displayCount}</span> applicants
                      </span>
                      {isSelected && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: accentColor, color: "#fff", borderRadius: 99, padding: "2px 9px" }}>Selected</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          )}
        </div>
      )}

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
        {[
          { key: "job" as Tab, label: isMobile ? "Job Post" : "Job Post Applications", count: jobCount, accent: T.blue, light: T.blueLight },
          { key: "general" as Tab, label: isMobile ? "Profiles" : "General Applications (Profiles)", count: genCount, accent: T.tealDark, light: T.tealLight },
        ].map((t, i) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setFilter("All");
              setSearch("");
            }}
            style={{
              background: tab === t.key ? t.light : T.white,
              color: tab === t.key ? t.accent : T.inkLight,
              border: `1.5px solid ${tab === t.key ? t.accent : T.border}`,
              borderRight: i === 0 ? "none" : undefined,
              borderRadius: i === 0 ? "10px 0 0 10px" : "0 10px 10px 0",
              padding: isMobile ? "8px 12px" : "10px 20px",
              fontSize: isMobile ? 12 : 13,
              fontWeight: tab === t.key ? 700 : 500,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: isMobile ? 6 : 8,
              transition: "all 0.15s", flex: 1, justifyContent: "center",
            }}
          >
            <span>{t.label}</span>
            <span style={{ background: tab === t.key ? t.accent : T.border, color: tab === t.key ? "#fff" : T.inkLight, borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              background: filter === status ? accentColor : T.white,
              color: filter === status ? "#fff" : T.ink,
              border: `1px solid ${filter === status ? accentColor : T.border}`,
              borderRadius: 999, padding: isMobile ? "4px 10px" : "6px 14px",
              fontSize: isMobile ? 11 : 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {status}
            {status !== "All" && counts[status] !== undefined && (
              <span style={{ marginLeft: 4, opacity: 0.7 }}>({counts[status]})</span>
            )}
          </button>
        ))}
      </div>

      {isMobile ? (
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            gap: 16,
            padding: "0 16px 20px",
            margin: "0 -16px",
          }}>
          {filtered.map((a, idx) => {
            let touchStartX = 0;
            const handleTouchStart = (e: React.TouchEvent) => {
              touchStartX = e.touches[0].clientX;
            };
            const handleTouchEnd = (e: React.TouchEvent) => {
              const touchEndX = e.changedTouches[0].clientX;
              const diff = touchEndX - touchStartX;
              const now = Date.now();
              const lastTap = lastTapTimeRef.current[a.id] ?? 0;
              // Detect double tap (within 300ms and minimal horizontal movement)
              if (now - lastTap < 300 && Math.abs(diff) < 30) {
                // Double tap: open details modal
                setSelectedApp(a);
                // Reset last tap to avoid triple taps
                lastTapTimeRef.current[a.id] = 0;
                return; // skip swipe handling
              }
              // Update last tap timestamp for next detection
              lastTapTimeRef.current[a.id] = now;
              // Swipe handling
              if (diff > 80) {
                // Right swipe → show previous candidate
                if (idx > 0) {
                  setCurrentCardIndex(idx - 1);
                }
              } else if (diff < -80) {
                // Left swipe → show next candidate
                if (idx < filtered.length - 1) {
                  setCurrentCardIndex(idx + 1);
                }
              }
            };



            const isShortlisted = a.status === "Shortlisted";
            const isRejected = a.status === "Rejected";
            const cardBackground = "linear-gradient(135deg, #72102a 0%, #3a0010 100%)";
            const cardTitle = a.name;
            const nameFade = 1;

            return (
              <div
                key={a.id}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{
                  flexShrink: 0,
                  minWidth: "calc(100% - 32px)",
                  borderRadius: 20,
                  background: cardBackground,
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: 24,
                  position: "relative",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
                  cursor: "pointer",
                  minHeight: 520,
                }}              >
                {/* Pagination counter */}
                <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  {idx + 1} of {filtered.length}
                </div>

                <div>
                  {/* Header info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {avatar(a.name, 56, 16)}
                     <div style={{ paddingRight: 64 }}>
                       <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff", opacity: nameFade }}>{cardTitle}</h3>
                       <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2, opacity: nameFade }}>
                         {isJob ? a.role : a.preferredRole || "—"}
                       </div>
                     </div>
                  </div>
                </div>

                {/* Details (Glassmorphic look) */}
                <div
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 12,
                    padding: 18,
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    minHeight: 260,
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>App ID</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{a.id}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Experience</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{a.exp}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Applied</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{a.applied}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Status</div>
                      <div style={{ marginTop: 2 }}>
                        <Badge label={a.status} variant={statusVariant(a.status)} />
                      </div>
                    </div>
                  </div>

                  {isJob && a.referredBy && (
                    <div>
                      <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Referred By</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>{a.referredBy}</div>
                    </div>
                  )}

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                    <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Email</div>
                    <div style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }}>{a.email}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 8, width: "100%", flexWrap: "wrap", marginTop: 12 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(a, "Shortlisted");
                    }}
                    style={{
                      flex: 1,
                      background: isShortlisted ? T.green : T.greenLight,
                      color: isShortlisted ? "#fff" : T.green,
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 16px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    }}
                    className="btn-shortlist-mobile"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(a, "Rejected");
                    }}
                    style={{
                      flex: 1,
                      background: isRejected ? T.red : T.redLight,
                      color: isRejected ? "#fff" : T.red,
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 16px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                    }}
                    className="btn-reject-mobile"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: "40px 24px", textAlign: "center", color: T.inkFaint, fontSize: 13 }}>
              No records found.
            </div>
          )}

          {/* Dot indicators */}
          {filtered.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
              {filtered.map((_, i) => (
                <div
                  key={i}
                  onClick={() => scrollRef.current?.scrollTo({ left: (i * scrollRef.current.clientWidth), behavior: "smooth" })}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: currentCardIndex === i ? T.tealDark : T.border,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card>
          <div style={{
            padding: "12px 14px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            gap: 8,
          }}>
            <Input
              placeholder={isJob ? "Search candidate, role, email..." : "Search candidate, preferred role, email..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 360, flex: 1, minWidth: 0 }}
            />
            <span style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, whiteSpace: "nowrap" }}>
              {filtered.length} of {data.length}
            </span>
          </div>

          {isJob ? (
            <Table
              cols={["App ID", "Candidate", "Role", "Job Post", "Experience", "Qualification", "Referred By", "Applied Date", "Status", "Actions"]}
              onRowClick={(index) => setSelectedApp(filtered[index])}
              onRowDoubleClick={(index) => updateStatus(filtered[index], "Shortlisted")}
              rows={filtered.map((a) => [
                <Mono v={a.id} />,
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {avatar(a.name)}
                  <div>
                    <strong>{a.name}</strong>
                    <div style={{ fontSize: 11, color: T.inkFaint }}>{a.email}</div>
                  </div>
                </div>,
                a.role,
                <span style={{ fontSize: 12, color: T.inkMid }}>{a.jobPostingId || "—"}</span>,
                a.exp,
                a.qualification || "—",
                <span style={{ fontWeight: 600, color: a.referredBy && a.referredBy !== "None" ? T.accentDark : T.inkLight }}>{a.referredBy || "—"}</span>,
                a.applied,
                <Badge label={a.status} variant={statusVariant(a.status)} />,
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(a, "Shortlisted");
                    }}
                    style={actionBtnStyle("shortlist")}
                    className="btn-shortlist"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(a, "Rejected");
                    }}
                    style={actionBtnStyle("reject")}
                    className="btn-reject"
                  >
                    Reject
                  </button>
                </div>,
              ])}
            />
          ) : (
            <Table
              cols={["App ID", "Candidate", "Preferred Role", "Department", "Experience", "Qualification", "Applied Date", "Status", "Actions"]}
              onRowClick={(index) => setSelectedApp(filtered[index])}
              onRowDoubleClick={(index) => updateStatus(filtered[index], "Shortlisted")}
              rows={filtered.map((a) => [
                <Mono v={a.id} />,
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {avatar(a.name)}
                  <div>
                    <strong>{a.name}</strong>
                    <div style={{ fontSize: 11, color: T.inkFaint }}>{a.email}</div>
                  </div>
                </div>,
                a.preferredRole || "—",
                <span style={{ fontSize: 12, color: T.inkMid }}>{a.preferredDept || "—"}</span>,
                a.exp,
                a.qualification || "—",
                a.applied,
                <Badge label={a.status} variant={statusVariant(a.status)} />,
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(a, "Shortlisted");
                    }}
                    style={actionBtnStyle("shortlist")}
                    className="btn-shortlist"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(a, "Rejected");
                    }}
                    style={actionBtnStyle("reject")}
                    className="btn-reject"
                  >
                    Reject
                  </button>
                </div>,
              ])}
            />
          )}
        </Card>
      )}


      {/* Detail Modal */}
      <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} maxWidth={680}>
        {selectedApp && (
          <>
            <ModalHeader title={isJob ? "Job Application Details" : "General Application Details"} onClose={() => setSelectedApp(null)} />
            <div
              style={{
                display: "flex", alignItems: isMobile ? "flex-start" : "center",
                flexDirection: isMobile ? "column" : "row", gap: 16, marginBottom: 20,
                padding: 16, background: isJob ? T.blueLight : T.tealLight, borderRadius: 12,
              }}
            >
              {avatar(selectedApp.name, isMobile ? 48 : 56, isMobile ? 16 : 18)}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: T.ink }}>{selectedApp.name}</div>
                <div style={{ color: T.inkLight, fontSize: 13, marginTop: 2 }}>
                  {isJob ? selectedApp.role : selectedApp.preferredRole}
                </div>
                <div style={{ marginTop: 6 }}>
                  <Badge label={selectedApp.status} variant={statusVariant(selectedApp.status)} />
                </div>
              </div>
              <a
                href={selectedApp.resume || "#"}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (!selectedApp.resume) {
                    e.preventDefault();
                    alert("Resume not available.");
                  }
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: T.blue,
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                View Resume
              </a>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {isJob
                ? [
                    ["Application ID", selectedApp.id],
                    ["Status", selectedApp.status],
                    ["Role Applied", selectedApp.role],
                    ["Job Posting", selectedApp.jobPostingId || "—"],
                    ["Experience", selectedApp.exp],
                    ["Qualification", selectedApp.qualification || "—"],
                    ["Referred By", selectedApp.referredBy || "—"],
                    ["Applied Date", selectedApp.applied],
                    ["Email", selectedApp.email],
                    ["Phone", selectedApp.phone || "—"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 14, color: T.ink }}>{value}</div>
                    </div>
                  ))
                : [
                    ["Application ID", selectedApp.id],
                    ["Status", selectedApp.status],
                    ["Preferred Role", selectedApp.preferredRole || "—"],
                    ["Preferred Dept", selectedApp.preferredDept || "—"],
                    ["Experience", selectedApp.exp],
                    ["Qualification", selectedApp.qualification || "—"],
                    ["Applied Date", selectedApp.applied],
                    ["Email", selectedApp.email],
                    ["Phone", selectedApp.phone || "—"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 14, color: T.ink }}>{value}</div>
                    </div>
                  ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn
                label="Shortlist"
                variant={selectedApp.status === "Shortlisted" ? "success" : "outline"}
                className="btn-shortlist"
                onClick={() => updateStatus(selectedApp, "Shortlisted")}
              />
              <Btn
                label="Reject"
                variant={selectedApp.status === "Rejected" ? "danger" : "outline"}
                className="btn-reject"
                onClick={() => updateStatus(selectedApp, "Rejected")}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal open={!!statusModalApp} onClose={() => setStatusModalApp(null)} maxWidth={420}>
        {statusModalApp && (
          <>
            <ModalHeader title="Update Application Status" onClose={() => setStatusModalApp(null)} />
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                {avatar(statusModalApp.name, 40, 14)}
                <div>
                  <div style={{ fontWeight: 700, color: T.ink }}>{statusModalApp.name}</div>
                  <div style={{ fontSize: 12, color: T.inkLight }}>{isJob ? statusModalApp.role : statusModalApp.preferredRole}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <Badge label={statusModalApp.status} variant={statusVariant(statusModalApp.status)} />
                <span style={{ color: T.inkFaint, fontSize: 14 }}>&rarr;</span>
                {newStatus && newStatus !== statusModalApp.status && (
                  <Badge label={newStatus} variant={statusVariant(newStatus)} />
                )}
              </div>
              <FormField label="New Status">
                <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} options={STATUS_OPTIONS} />
              </FormField>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn label="Cancel" variant="ghost" onClick={() => setStatusModalApp(null)} />
              <Btn
                label="Update"
                onClick={() => updateStatus(statusModalApp, newStatus)}
                style={newStatus === statusModalApp.status ? { opacity: 0.4, cursor: "not-allowed" } : {}}
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
