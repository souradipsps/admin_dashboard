import React, { useState, useRef, useEffect } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint, useHorizontalScroll } from "../hooks";
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
  const hScroll = useHorizontalScroll();
  const accentColor = T.blue;
  const accentPale = T.bluePale;

  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [filterActiveIndex, setFilterActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ type: string; title: string; content: React.ReactNode } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; key: typeof TASK_KEYS[number]; status: "Verified" | "Rejected" } | null>(null);

  const [records, setRecords] = useState<any[]>(() => {
    const saved = localStorage.getItem("onboardingRecords");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old boolean tasks to string states
      return parsed.map((r: any) => {
        const migratedTasks = { ...r.tasks };
        ["profile", "offer", "docsUpload", "docsVerify", "bgc"].forEach((k) => {
          if (typeof migratedTasks[k] === "boolean") {
            migratedTasks[k] = migratedTasks[k] ? "Verified" : "Pending";
          }
        });
        // Auto fill document upload to Verified
        migratedTasks.docsUpload = "Verified";
        // Force reset to Pending so you can test the verify/reject flow
        migratedTasks.docsVerify = "Pending";
        migratedTasks.bgc = "Pending";
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
        docsVerify: "Pending",
        bgc: "Pending",
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
    if (key === "checkin") return !!val;
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
    hScroll.ref.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const selectPosting = (id: string | null) => {
    setSelectedPostingId((prev) => (prev === id ? null : id));
  };

  const currentRecord = selectedRecord ? records.find(r => r.id === selectedRecord.id) : null;

  const getTaskIconAndColor = (key: typeof TASK_KEYS[number], val: any) => {
    if (key === "checkin") {
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

  const renderBgcPreview = (_record: any) => (
    <div style={{ fontSize: 13, color: T.inkMid }}>
      <div style={{ marginBottom: 12 }}><strong>Background Check Details:</strong></div>
      <div style={{ padding: 12, background: T.canvas, borderRadius: 8, border: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, color: T.ink }}>Criminal Record Check</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: T.green, background: T.greenLight, padding: "2px 8px", borderRadius: 4 }}>CLEAR</span>
        </div>
        <div style={{ fontSize: 11, color: T.inkLight }}>No matching records found in national databases.</div>
      </div>
      <div style={{ padding: 12, background: T.canvas, borderRadius: 8, border: `1px solid ${T.border}`, marginTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, color: T.ink }}>Address Verification</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: T.green, background: T.greenLight, padding: "2px 8px", borderRadius: 4 }}>VERIFIED</span>
        </div>
        <div style={{ fontSize: 11, color: T.inkLight }}>Current and permanent addresses physically verified.</div>
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
                  scrollSnapType: "x mandatory",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  gap: 12,
                  paddingBottom: 4,
                }}
              >
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

                {enrichedPostings.map((p, idx) => {
                  const isSelected = selectedPostingId === p.id;
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
                      setFilterActiveIndex(i);
                      if (hScroll.ref.current) {
                        const cards = hScroll.ref.current.children;
                        if (cards[i]) (cards[i] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                      }
                    }}
                    style={{
                      width: filterActiveIndex === i ? 20 : 6,
                      height: 6, borderRadius: 99,
                      background: filterActiveIndex === i ? accentColor : T.border,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 8, width: 40, zIndex: 2, background: `linear-gradient(to right, ${T.canvas}, transparent)`, pointerEvents: "none" }} />
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 8, width: 40, zIndex: 2, background: `linear-gradient(to left, ${T.canvas}, transparent)`, pointerEvents: "none" }} />
              <div
                ref={hScroll.ref}
                className="carousel-scroll hscroll-track"
                onWheel={hScroll.onWheel}
                onMouseDown={hScroll.onMouseDown}
                onMouseMove={hScroll.onMouseMove}
                onMouseUp={hScroll.onMouseUp}
                onMouseLeave={hScroll.onMouseLeave}
                style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8, WebkitOverflowScrolling: "touch", cursor: "grab", userSelect: "none" }}
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
            </div>
          )}
        </div>
      )}

      {filteredRecords.length === 0 ? (
        <Card style={{ padding: 32, textAlign: "center", color: T.inkFaint }}>
          No onboarding candidates found for this role.
        </Card>
      ) : isMobile ? (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
            {filteredRecords.length} candidate{filteredRecords.length !== 1 ? "s" : ""}
          </div>

          <div
            ref={scrollRef}
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const cardWidth = e.currentTarget.clientWidth;
              const newIndex = Math.round(scrollLeft / cardWidth);
              setCurrentCardIndex(newIndex);
            }}
            style={{
              display: "flex",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              gap: 16,
              padding: "0 16px 20px",
              margin: "0 -16px",
            }}
          >
            {filteredRecords.map((o, idx) => {
              const done = TASK_KEYS.filter((k) => isTaskDone(k, o.tasks[k])).length;
              const pct = Math.round((done / TASK_KEYS.length) * 100);
              const cardBackground = "linear-gradient(135deg, #72102a 0%, #3a0010 100%)";
              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedRecord(o)}
                  style={{
                    flexShrink: 0,
                    minWidth: "calc(100% - 32px)",
                    scrollSnapAlign: "center",
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
                    minHeight: 460,
                  }}
                >
                  {/* Pagination counter */}
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    {idx + 1} of {filteredRecords.length}
                  </div>

                  <div>
                    {/* Header info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div
                        style={{
                          width: 48, height: 48, borderRadius: "50%",
                          background: "rgba(255,255,255,0.15)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0,
                        }}
                      >
                        👤
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{o.name}</h3>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                          {o.role} · Joining: <strong>{o.joining}</strong>
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
                      gap: 12,
                      marginTop: 16,
                      flex: 1,
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Candidate ID</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{o.id}</div>
                      </div>
                      {o.empId !== "—" && (
                        <div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Employee ID</div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{o.empId}</div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Progress</div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: pct === 100 ? "#34D399" : "#60A5FA" }}>{pct}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Status</div>
                        <div style={{ marginTop: 2 }}>
                          <Badge label={o.status} variant={statusVariant(o.status)} />
                        </div>
                      </div>
                    </div>

                    {/* Progress bar inside card */}
                    <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 99, height: 6, overflow: "hidden", margin: "4px 0" }}>
                      <div
                        style={{
                          width: `${pct}%`, height: "100%", borderRadius: 99, transition: "width 0.4s",
                          background: pct === 100 ? "#10B981" : "linear-gradient(90deg, #3B82F6, #06B6D4)",
                        }}
                      />
                    </div>

                    {/* Step indicators (sleek timeline stepper for mobile) */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, marginTop: 4, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                      {/* Connecting line container behind the circles */}
                      <div style={{ position: "absolute", left: "8.33%", right: "8.33%", top: 26, height: 2, background: "rgba(255,255,255,0.15)", zIndex: 0 }} />
                      
                      {TASK_KEYS.map((key, i) => {
                        const val = o.tasks[key];
                        const isDone = isTaskDone(key, val);
                        const isRejected = val === "Rejected";
                        const stepNum = i + 1;
                        
                        let stepLabel = "";
                        switch(key) {
                          case "profile": stepLabel = "Profile"; break;
                          case "offer": stepLabel = "Offer"; break;
                          case "docsUpload": stepLabel = "Upload"; break;
                          case "docsVerify": stepLabel = "Verify"; break;
                          case "bgc": stepLabel = "BGC"; break;
                          case "checkin": stepLabel = "Day 1"; break;
                        }

                        // Determine circle styling
                        let circleBg = "rgba(255,255,255,0.1)";
                        let circleBorder = "rgba(255,255,255,0.2)";
                        let circleColor = "rgba(255,255,255,0.7)";
                        let circleText = `${stepNum}`;

                        if (isDone) {
                          circleBg = "#10B981";
                          circleBorder = "#34D399";
                          circleColor = "#fff";
                          circleText = "✓";
                        } else if (isRejected) {
                          circleBg = "#EF4444";
                          circleBorder = "#F87171";
                          circleColor = "#fff";
                          circleText = "✗";
                        }

                        return (
                          <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, zIndex: 1 }}>
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                background: circleBg,
                                border: `2px solid ${circleBorder}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 800,
                                color: circleColor,
                                transition: "all 0.3s",
                                boxShadow: isDone ? "0 0 8px rgba(16,185,129,0.4)" : isRejected ? "0 0 8px rgba(239,68,68,0.4)" : "none",
                              }}
                            >
                              {circleText}
                            </div>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: isDone ? "#34D399" : isRejected ? "#F87171" : "rgba(255,255,255,0.5)",
                                marginTop: 6,
                                textAlign: "center",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {stepLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dot indicators */}
          {filteredRecords.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
              {filteredRecords.map((_, i) => (
                <div
                  key={i}
                  onClick={() => scrollRef.current?.scrollTo({ left: (i * scrollRef.current.clientWidth), behavior: "smooth" })}
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
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredRecords.map((o) => {
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
          })}
        </div>
      )}

      {/* Candidate Details Popup Modal */}
      <Modal open={!!selectedRecord} onClose={() => setSelectedRecord(null)} maxWidth={640}>
        {currentRecord && (() => {
          const candDetails = getCandidateDetails(currentRecord.name);
          const done = TASK_KEYS.filter((k) => isTaskDone(k, currentRecord.tasks[k])).length;
          const pct = Math.round((done / TASK_KEYS.length) * 100);
          return (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.ink }}>Onboarding Checklist & Details</h2>
                <button
                  onClick={() => setSelectedRecord(null)}
                  style={{
                    background: "none", border: "none", fontSize: 20, fontWeight: 700,
                    color: T.inkFaint, cursor: "pointer", padding: 0
                  }}
                >
                  ✕
                </button>
              </div>
              
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
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 20, padding: "14px 16px", background: T.canvas, borderRadius: 10, border: `1px solid ${T.border}` }}>
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
                    if (key === "checkin") return null;
                    const val = currentRecord.tasks[key];
                    const isSpecialField = key === "profile" || key === "offer" || key === "docsUpload" || key === "docsVerify" || key === "bgc";

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
                                } else if (key === "bgc") {
                                  title = "Background Check Details";
                                  content = renderBgcPreview(currentRecord);
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
                            {(key === "docsVerify" || key === "bgc") && val !== "Verified" && val !== "Rejected" && (
                              <>
                                <button
                                  onClick={() => setConfirmAction({ id: currentRecord.id, key, status: "Verified" })}
                                  style={{
                                    border: "none", background: T.greenLight, color: T.green,
                                    borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer"
                                  }}
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => setConfirmAction({ id: currentRecord.id, key, status: "Rejected" })}
                                  style={{
                                    border: "none", background: T.redLight, color: T.red,
                                    borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer"
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
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

              {(() => {
                const canCheckIn = currentRecord.tasks.checkin || ["profile", "offer", "docsUpload", "docsVerify", "bgc"].every(k => currentRecord.tasks[k] === "Verified");
                return (
                  <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: T.red, fontWeight: 500 }}>
                      {!canCheckIn && "★ All steps must be verified before Check In"}
                    </div>
                    <button
                      onClick={() => {
                        if (!canCheckIn) return;
                        toggleTask(currentRecord.id, "checkin");
                        setSelectedRecord(null);
                      }}
                      style={{
                        background: canCheckIn ? (currentRecord.tasks.checkin ? T.green : T.blue) : T.canvas,
                        color: canCheckIn ? "#fff" : T.inkFaint,
                        border: canCheckIn ? "none" : `1px solid ${T.border}`,
                        borderRadius: 8,
                        padding: "8px 20px",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: canCheckIn ? "pointer" : "not-allowed",
                        transition: "all 0.2s"
                      }}
                      disabled={!canCheckIn}
                    >
                      {currentRecord.tasks.checkin ? "Checked In" : "Check In"}
                    </button>
                  </div>
                );
              })()}
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

      {/* Confirmation Modal */}
      <Modal open={!!confirmAction} onClose={() => setConfirmAction(null)} maxWidth={400}>
        {confirmAction && (
          <>
            <ModalHeader title="Confirm Action" onClose={() => setConfirmAction(null)} />
            <div style={{ padding: "12px 0", color: T.inkMid, fontSize: 14 }}>
              Are you sure you want to mark this task as <strong style={{ color: confirmAction.status === "Verified" ? T.green : T.red }}>{confirmAction.status}</strong>? This action cannot be undone.
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <Btn label="Cancel" variant="outline" onClick={() => setConfirmAction(null)} />
              <button
                onClick={() => {
                  setTaskStatus(confirmAction.id, confirmAction.key, confirmAction.status);
                  setConfirmAction(null);
                }}
                style={{
                  background: confirmAction.status === "Verified" ? T.green : T.red,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Yes, {confirmAction.status}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
