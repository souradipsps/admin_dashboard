import React, { useState, useRef, useEffect } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Mono, Badge, Btn, Modal, ModalHeader } from "../components/ui";
import { ONBOARDING, JOB_APPLICATIONS, GENERAL_APPLICATIONS, OFFERS } from "../data";

const TASK_KEYS = ["profile", "offer", "docsUpload", "docsVerify", "bgc", "checkin"] as const;
const TASK_LABELS = [
  "Profile Submitted",
  "Offer Letter Accepted",
  "Documentation Upload",
  "Document Verification",
  "Background Check",
  "Check In"
];

export default function Onboarding({ jobPostings = [] }: { jobPostings?: any[] }) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const scrollRef = useRef<HTMLDivElement>(null);
  const accentColor = T.blue;
  const accentPale = T.bluePale;

  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ type: string; title: string; content: React.ReactNode } | null>(null);

  const [records, setRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem("onboardingRecords");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old boolean tasks to string states
      return parsed.map((r: any) => {
        const migratedTasks = { ...r.tasks };
        ["profile", "offer", "docsUpload", "docsVerify"].forEach((k) => {
          if (typeof migratedTasks[k] === "boolean") {
            migratedTasks[k] = migratedTasks[k] ? "Verified" : "Pending";
          }
        });
        return { ...r, tasks: migratedTasks };
      });
    }
    // Initialize first 4 tasks to "Verified" as they are pre-completed, and bgc to true, checkin to false
    return ONBOARDING.map((o) => ({
      ...o,
      tasks: {
        profile: "Verified",
        offer: "Verified",
        docsUpload: "Verified",
        docsVerify: "Verified",
        bgc: true,
        checkin: o.tasks?.checkin || false,
      },
      status: o.status === "Completed" ? "Completed" : "Documents Pending",
    }));
  });

  useEffect(() => {
    localStorage.setItem("onboardingRecords", JSON.stringify(records));
  }, [records]);

  const ALL_APPS = [...JOB_APPLICATIONS, ...GENERAL_APPLICATIONS.map((a) => ({ ...a, role: a.preferredRole }))];

  const getCandidateDetails = (name: string) => {
    const app = ALL_APPS.find((a) => a.name && a.name.toLowerCase() === name.toLowerCase());
    const offer = OFFERS.find((o) => o.candidate && o.candidate.toLowerCase() === name.toLowerCase());
    return {
      email: app?.email || "—",
      phone: app?.phone || "—",
      referredBy: (app as any)?.referredBy || "None",
      resume: app?.resume || "",
      ctc: offer?.ctc || "—",
    };
  };

  const isTaskDone = (key: typeof TASK_KEYS[number], val: any) => {
    if (key === "bgc" || key === "checkin") {
      return !!val;
    }
    return val === "Verified";
  };

  const toggleTask = (id: string, taskKey: typeof TASK_KEYS[number]) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updatedTasks = { ...r.tasks, [taskKey]: !r.tasks[taskKey] };
        const done = TASK_KEYS.filter((k) => isTaskDone(k, updatedTasks[k])).length;
        const newStatus = done === TASK_KEYS.length ? "Completed" : done === 0 ? "Initiated" : "Documents Pending";
        return { ...r, tasks: updatedTasks, status: newStatus };
      }),
    );
  };

  const setTaskStatus = (id: string, taskKey: typeof TASK_KEYS[number], newStatus: "Verified" | "Rejected" | "Pending") => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updatedTasks = { ...r.tasks, [taskKey]: newStatus };
        const done = TASK_KEYS.filter((k) => isTaskDone(k, updatedTasks[k])).length;
        const newStatusStr = done === TASK_KEYS.length ? "Completed" : done === 0 ? "Initiated" : "Documents Pending";
        return { ...r, tasks: updatedTasks, status: newStatusStr };
      }),
    );
  };

  const enrichedPostings = jobPostings.map((p) => ({
    ...p,
    onboardCount: records.filter((r) => r.role === p.role).length,
  }));

  const selectedRole = enrichedPostings.find((p) => p.id === selectedPostingId)?.role ?? null;

  const filteredRecords = selectedPostingId
    ? records.filter((r) => r.role === selectedRole)
    : records;

  const scrollCarousel = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  const selectPosting = (id: string | null) => {
    setSelectedPostingId((prev) => (prev === id ? null : id));
  };

  const currentRecord = selectedRecord ? records.find(r => r.id === selectedRecord.id) : null;

  const getTaskIconAndColor = (key: typeof TASK_KEYS[number], val: any) => {
    if (key === "bgc" || key === "checkin") {
      return val
        ? { icon: "✓", color: T.green, bg: T.greenLight, border: "#A7F3D0" }
        : { icon: "○", color: T.inkFaint, bg: T.canvas, border: T.border };
    }
    if (val === "Verified") {
      return { icon: "✓", color: T.green, bg: T.greenLight, border: "#A7F3D0" };
    }
    if (val === "Rejected") {
      return { icon: "✗", color: T.red, bg: T.redLight, border: "#FECACA" };
    }
    return { icon: "○", color: T.inkFaint, bg: T.canvas, border: T.border };
  };

  const renderProfilePreview = (record: any, details: any) => (
    <div style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.6 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.blue }}>{record.name}</div>
        <div style={{ fontSize: 11, color: T.inkLight }}>{record.role} Candidate Profile</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div><strong>Email:</strong> {details.email}</div>
        <div><strong>Phone:</strong> {details.phone}</div>
        <div><strong>CTC Offered:</strong> {details.ctc}</div>
        <div><strong>Referred By:</strong> {details.referredBy}</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Education:</strong> Master of Science in Education / B.Ed.
      </div>
      <div style={{ marginTop: 6 }}>
        <strong>Experience:</strong> 4+ years of teaching experience.
      </div>
    </div>
  );

  const renderOfferPreview = (record: any, details: any) => (
    <div style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.6 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.green }}>Offer Status: Accepted</div>
        <div style={{ fontSize: 11, color: T.inkLight }}>Digitally Signed by {record.name}</div>
      </div>
      <div style={{ background: T.canvas, padding: 14, borderRadius: 8, border: `1px solid ${T.border}` }}>
        <p>Dear {record.name},</p>
        <p>We are pleased to offer you the role of <strong>{record.role}</strong> at South Point School.</p>
        <p>Compensation: <strong>{details.ctc}</strong></p>
        <p>Joining Date: <strong>{record.joining}</strong></p>
      </div>
    </div>
  );

  const renderDocsUploadPreview = (_record: any) => (
    <div style={{ fontSize: 13, color: T.inkMid }}>
      <div style={{ marginBottom: 12 }}><strong>Submitted Documents:</strong></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { name: "Government ID (Aadhaar).pdf", size: "1.2 MB", date: "2026-06-15" },
          { name: "PAN Card.pdf", size: "840 KB", date: "2026-06-15" },
          { name: "Degree Certificates.pdf", size: "4.5 MB", date: "2026-06-16" },
          { name: "Relieving Letter.pdf", size: "1.1 MB", date: "2026-06-17" },
        ].map((file) => (
          <div key={file.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: T.canvas, borderRadius: 6, border: `1px solid ${T.border}` }}>
            <div>
              <div style={{ fontWeight: 600, color: T.ink }}>{file.name}</div>
              <div style={{ fontSize: 11, color: T.inkFaint }}>{file.size} · Uploaded on {file.date}</div>
            </div>
            <button
              onClick={() => alert(`Opening ${file.name} in a new tab (mocked).`)}
              style={{ border: "none", background: "none", color: T.blue, fontWeight: 700, cursor: "pointer", fontSize: 12 }}
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocsVerifyPreview = (_record: any) => (
    <div style={{ fontSize: 13, color: T.inkMid }}>
      <div style={{ marginBottom: 12 }}><strong>Verification Checks:</strong></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { check: "Identity Verification", status: "PASSED", note: "Aadhaar and PAN details matched with government database." },
          { check: "Academic Verification", status: "PASSED", note: "M.Sc. & B.Ed. degrees verified with Guwahati University." },
          { check: "Employment History Check", status: "PASSED", note: "Previous school experience verified with Principal's reference." },
        ].map((item) => (
          <div key={item.check} style={{ padding: 12, background: T.canvas, borderRadius: 8, border: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontWeight: 700, color: T.ink }}>{item.check}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: T.green, background: T.greenLight, padding: "2px 8px", borderRadius: 4 }}>{item.status}</span>
            </div>
            <div style={{ fontSize: 11, color: T.inkLight }}>{item.note}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <SectionTitle
        title="Onboarding"
        sub="Track every new joiner from offer acceptance to Day 1"
      />

      {/* Job Postings Filter */}
      {enrichedPostings.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMid }}>
              {selectedPostingId ? (
                <span>
                  Filtering by <span style={{ color: accentColor }}>{selectedRole}</span>
                  <button
                    onClick={() => selectPosting(null)}
                    style={{ marginLeft: 8, fontSize: 11, color: T.inkFaint, background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}
                  >
                    Clear ×
                  </button>
                </span>
              ) : (
                <span style={{ color: T.inkFaint }}>Select a job to filter onboarding records</span>
              )}
            </div>
            {!isMobile && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => scrollCarousel("left")} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                <button onClick={() => scrollCarousel("right")} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
              </div>
            )}
          </div>

          {isMobile ? (
            <>
              <div
                ref={scrollRef}
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
                <div
                  onClick={() => selectPosting(null)}
                  style={{
                    flexShrink: 0, width: "100%", scrollSnapAlign: "center",
                    border: `2px solid ${!selectedPostingId ? accentColor : T.border}`,
                    borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                    background: !selectedPostingId ? accentPale : T.surface,
                    display: "flex", flexDirection: "row", alignItems: "center", gap: 16,
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
                    <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>{records.length} total joiners</div>
                  </div>
                  {!selectedPostingId && (
                    <div style={{ background: accentColor, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>
                  )}
                </div>

                {enrichedPostings.map((p) => {
                  const isSelected = selectedPostingId === p.id;
                  const initials = p.role.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectPosting(p.id)}
                      style={{
                        flexShrink: 0, width: "100%", scrollSnapAlign: "center",
                        border: `2px solid ${isSelected ? accentColor : T.border}`,
                        borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                        background: isSelected ? accentPale : T.surface,
                        transition: "all 0.2s",
                        boxShadow: isSelected ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                    >
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
                          <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>{p.channel} Posting</div>
                        </div>
                        {isSelected && (
                          <div style={{ background: accentColor, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, gap: 8 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{
                            fontSize: 11, borderRadius: 99, padding: "3px 10px", fontWeight: 700,
                            background: p.type === "Full-time" ? T.blueLight : T.tealLight,
                            color: p.type === "Full-time" ? T.blue : T.teal,
                          }}>{p.type}</span>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: isSelected ? accentColor : T.ink }}>{p.onboardCount}</span>
                          <span style={{ fontSize: 10, color: T.inkFaint, display: "block", lineHeight: 1 }}>joiners</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                {[null, ...enrichedPostings.map((p) => p.id)].map((id, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (id === null) selectPosting(null);
                      else selectPosting(id as string);
                      if (scrollRef.current) {
                        const cards = scrollRef.current.children;
                        if (cards[i]) (cards[i] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                      }
                    }}
                    style={{
                      width: selectedPostingId === id ? 20 : 6,
                      height: 6, borderRadius: 99,
                      background: selectedPostingId === id ? accentColor : T.border,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div
              ref={scrollRef}
              className="carousel-scroll"
              style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}
            >
              <div
                onClick={() => selectPosting(null)}
                style={{
                  flexShrink: 0, width: 200, scrollSnapAlign: "start",
                  border: `2px solid ${!selectedPostingId ? accentColor : T.border}`,
                  borderRadius: 14, padding: "16px 18px", cursor: "pointer",
                  background: !selectedPostingId ? accentPale : T.surface,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, transition: "all 0.15s", minHeight: 140,
                }}
              >
                <div style={{ fontSize: 24, opacity: 0.5 }}>◈</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: !selectedPostingId ? accentColor : T.ink, textAlign: "center" }}>All Jobs</div>
                <div style={{ fontSize: 11, color: T.inkFaint, textAlign: "center" }}>{records.length} joiners</div>
              </div>

              {enrichedPostings.map((p) => {
                const isSelected = selectedPostingId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => selectPosting(p.id)}
                    style={{
                      flexShrink: 0, width: 280, scrollSnapAlign: "start",
                      border: `2px solid ${isSelected ? accentColor : T.border}`,
                      borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                      background: isSelected ? accentPale : T.surface,
                      transition: "all 0.18s",
                      display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 140,
                      boxShadow: isSelected ? `0 4px 20px ${accentColor}22` : "0 1px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, flex: 1 }}>{p.role}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 7px", background: p.type === "Full-time" ? T.blueLight : T.tealLight, color: p.type === "Full-time" ? T.blue : T.teal }}>{p.type}</span>
                      </div>
                      <div style={{ fontSize: 11, color: T.inkLight }}>{p.channel} Posting</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: T.inkMid }}><strong>{p.onboardCount}</strong> joiners</span>
                      {isSelected && <span style={{ fontSize: 10, fontWeight: 700, background: accentColor, color: "#fff", borderRadius: 99, padding: "2px 8px" }}>Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Onboarding Candidate List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredRecords.length === 0 ? (
          <Card style={{ padding: 32, textAlign: "center", color: T.inkFaint }}>
            No onboarding candidates found for this role.
          </Card>
        ) : (
          filteredRecords.map((o) => {
            const done = TASK_KEYS.filter((k) => isTaskDone(k, o.tasks[k])).length;
            const pct = Math.round((done / TASK_KEYS.length) * 100);
            return (
              <div
                key={o.id}
                onClick={() => setSelectedRecord(o)}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <Card style={{ padding: isMobile ? 16 : 22 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        <Mono v={o.id} />
                        <Badge label={o.status} variant={statusVariant(o.status)} />
                      </div>
                      <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800, color: T.ink }}>{o.name}</div>
                      <div style={{ fontSize: 12, color: T.inkLight, marginTop: 3 }}>
                        {o.role} · Joining: <strong>{o.joining}</strong>
                        {o.empId !== "—" && <> · ID: <strong>{o.empId}</strong></>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 12 }}>
                      <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, color: pct === 100 ? T.green : T.blue }}>{pct}%</div>
                      <div style={{ fontSize: 10, color: T.inkFaint }}>Complete</div>
                    </div>
                  </div>

                  <div style={{ background: T.canvas, borderRadius: 99, height: 7, overflow: "hidden", marginBottom: 14 }}>
                    <div
                      style={{
                        width: `${pct}%`, height: "100%", borderRadius: 99, transition: "width 0.6s",
                        background: pct === 100 ? T.green : `linear-gradient(90deg,${T.blue},${T.teal})`,
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {TASK_LABELS.map((t, i) => {
                      const { icon, color, bg, border } = getTaskIconAndColor(TASK_KEYS[i], o.tasks[TASK_KEYS[i]]);
                      return (
                        <div
                          key={t}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: bg,
                            border: `1.5px solid ${border}`,
                            borderRadius: 8, padding: "6px 10px",
                          }}
                        >
                          <span style={{ color: color, fontSize: 13 }}>{icon}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: color === T.inkFaint ? T.inkMid : color }}>{t}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>

      {/* Candidate Details Popup Modal */}
      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)} maxWidth={640}>
        {currentRecord && (() => {
          const candDetails = getCandidateDetails(currentRecord.name);
          const done = TASK_KEYS.filter((k) => isTaskDone(k, currentRecord.tasks[k])).length;
          const pct = Math.round((done / TASK_KEYS.length) * 100);
          return (
            <>
              <ModalHeader title="Onboarding Checklist & Details" onClose={() => setSelectedRecord(null)} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <Mono v={currentRecord.id} />
                    <Badge label={currentRecord.status} variant={statusVariant(currentRecord.status)} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>{currentRecord.name}</div>
                  <div style={{ fontSize: 12, color: T.inkMid, marginTop: 4 }}>
                    Role: <strong>{currentRecord.role}</strong>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: pct === 100 ? T.green : T.blue }}>{pct}%</div>
                  <div style={{ fontSize: 10, color: T.inkFaint }}>Progress</div>
                </div>
              </div>

              <div style={{ background: T.canvas, borderRadius: 99, height: 7, overflow: "hidden", marginBottom: 18 }}>
                <div
                  style={{
                    width: `${pct}%`, height: "100%", borderRadius: 99, transition: "width 0.4s",
                    background: pct === 100 ? T.green : `linear-gradient(90deg,${T.blue},${T.teal})`,
                  }}
                />
              </div>

              {/* Full Candidate Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20, padding: "14px 16px", background: T.canvas, borderRadius: 10, border: `1px solid ${T.border}` }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Joining Date</div>
                  <div style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{currentRecord.joining}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Employee ID</div>
                  <div style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{currentRecord.empId}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Email</div>
                  <div style={{ fontSize: 13, color: T.ink }}>{candDetails.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Phone</div>
                  <div style={{ fontSize: 13, color: T.ink }}>{candDetails.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Monthly CTC</div>
                  <div style={{ fontSize: 13, color: T.ink, fontWeight: 600 }}>{candDetails.ctc}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Resume</div>
                  <div style={{ fontSize: 13 }}>
                    {candDetails.resume ? (
                      <a href={candDetails.resume} target="_blank" rel="noreferrer" style={{ color: T.blue, textDecoration: "none", fontWeight: 600 }}>
                        View Resume ↗
                      </a>
                    ) : (
                      <span style={{ color: T.inkFaint }}>—</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: T.inkMid, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Onboarding Checklist & Document Verification</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {TASK_LABELS.map((t, i) => {
                    const key = TASK_KEYS[i];
                    const val = currentRecord.tasks[key];
                    const isSpecialField = key === "profile" || key === "offer" || key === "docsUpload" || key === "docsVerify";

                    if (isSpecialField) {
                      const statusColor = val === "Verified" ? T.green : val === "Rejected" ? T.red : T.inkFaint;
                      const statusBg = val === "Verified" ? T.greenLight : val === "Rejected" ? T.redLight : T.canvas;
                      const statusBorder = val === "Verified" ? "#A7F3D0" : val === "Rejected" ? "#FECACA" : T.border;

                      return (
                        <div
                          key={t}
                          style={{
                            display: "flex", flexDirection: isMobile ? "column" : "row",
                            justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
                            padding: "10px 14px", borderRadius: 8,
                            background: statusBg,
                            border: `1.5px solid ${statusBorder}`,
                            gap: 10,
                            transition: "all 0.15s"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                              display: "flex", alignItems: "center", justifyContent: "center",
                              width: 18, height: 18, borderRadius: "50%",
                              border: `2px solid ${statusColor}`,
                              background: val === "Verified" ? T.green : val === "Rejected" ? T.red : "transparent",
                              color: "#fff", fontSize: 10, fontWeight: 800
                            }}>
                              {val === "Verified" ? "✓" : val === "Rejected" ? "✗" : ""}
                            </span>
                            <div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: val === "Verified" ? "#065F46" : val === "Rejected" ? "#991B1B" : T.ink }}>
                                {t}
                              </span>
                              <span style={{
                                fontSize: 9, fontWeight: 800, marginLeft: 8,
                                padding: "2px 6px", borderRadius: 4,
                                color: statusColor,
                                background: val === "Verified" ? "rgba(16, 185, 129, 0.1)" : val === "Rejected" ? "rgba(239, 68, 68, 0.1)" : "rgba(156, 163, 175, 0.1)"
                              }}>
                                {val || "Pending"}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 6, width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "flex-end" : "flex-start" }}>
                            <button
                              onClick={() => {
                                let title = "";
                                let content = null;
                                if (key === "profile") {
                                  title = "Candidate Profile";
                                  content = renderProfilePreview(currentRecord, candDetails);
                                } else if (key === "offer") {
                                  title = "Offer Letter Details";
                                  content = renderOfferPreview(currentRecord, candDetails);
                                } else if (key === "docsUpload") {
                                  title = "Uploaded Documents";
                                  content = renderDocsUploadPreview(currentRecord);
                                } else if (key === "docsVerify") {
                                  title = "Document Verification Checks";
                                  content = renderDocsVerifyPreview(currentRecord);
                                }
                                setPreviewDoc({ type: key, title, content });
                              }}
                              style={{
                                border: `1.5px solid ${T.border}`, background: T.surface, color: T.blue,
                                borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer"
                              }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => setTaskStatus(currentRecord.id, key, "Verified")}
                              style={{
                                border: "none", background: val === "Verified" ? T.green : T.greenLight, color: val === "Verified" ? "#fff" : T.green,
                                borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer"
                              }}
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => setTaskStatus(currentRecord.id, key, "Rejected")}
                              style={{
                                border: "none", background: val === "Rejected" ? T.red : T.redLight, color: val === "Rejected" ? "#fff" : T.red,
                                borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer"
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      const isDone = val;
                      return (
                        <button
                          key={t}
                          onClick={() => toggleTask(currentRecord.id, key)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            cursor: "pointer", padding: "10px 14px", borderRadius: 8,
                            background: isDone ? T.greenLight : T.surface,
                            border: `1.5px solid ${isDone ? "#A7F3D0" : T.border}`,
                            width: "100%", textAlign: "left", transition: "all 0.15s"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                              display: "flex", alignItems: "center", justifyContent: "center",
                              width: 18, height: 18, borderRadius: "50%",
                              border: `2px solid ${isDone ? T.green : T.inkFaint}`,
                              background: isDone ? T.green : "transparent",
                              color: "#fff", fontSize: 10, fontWeight: 800
                            }}>
                              {isDone ? "✓" : ""}
                            </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: isDone ? "#065F46" : T.ink }}>
                              {t}
                            </span>
                          </div>
                        </button>
                      );
                    }
                  })}
                </div>
              </div>

              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                <Btn label="Close" onClick={() => setSelectedRecord(null)} />
              </div>
            </>
          );
        })()}
      </Modal>

      {/* Document Preview Modal */}
      <Modal open={!!previewDoc} onClose={() => setPreviewDoc(null)} maxWidth={500}>
        {previewDoc && (
          <>
            <ModalHeader title={previewDoc.title} onClose={() => setPreviewDoc(null)} />
            <div style={{ padding: "12px 0" }}>
              {previewDoc.content}
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
              <Btn label="Close" onClick={() => setPreviewDoc(null)} />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
