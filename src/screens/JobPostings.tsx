import React, { useState, useRef } from "react";
import { T } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Table, Mono, Badge, Input, Modal, ModalHeader, Btn } from "../components/ui";

interface JobPostingsProps {
  postings: any[];
  setPostings: React.Dispatch<React.SetStateAction<any[]>>;
  jobRequests: any[];
  existingRoles: any[];
}

export default function JobPostings({ postings, setPostings, jobRequests, existingRoles }: JobPostingsProps) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const [search, setSearch] = useState("");
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);
  const [selectedJobForModal, setSelectedJobForModal] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getJobDetails = (posting: any) => {
    const jr = (jobRequests || []).find((r) => r.role === posting.role);
    const er = (existingRoles || []).find((r) => r.role === posting.role);
    return {
      vacancies: jr?.vacancies || "—",
      exp: jr?.exp || er?.experience || "—",
      qual: jr?.qual || "—",
      type: jr?.type || er?.type || "—",
      salary: jr?.salary || er?.salaryRange || "—",
      location: jr?.location || "—",
      description: jr?.description || "—",
      justification: jr?.justification || "—",
    };
  };

  const selectedRole = postings.find((p) => p.id === selectedPostingId)?.role ?? null;

  const selectPosting = (id: string | null) => {
    setSelectedPostingId((prev) => (prev === id ? null : id));
    setSearch("");
  };

  const scrollCarousel = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  const filtered = postings.filter(
    (p) =>
      (selectedPostingId === null || p.id === selectedPostingId) &&
      (p.role?.toLowerCase().includes(search.toLowerCase()) ||
        p.channel?.toLowerCase().includes(search.toLowerCase())),
  );

  const shareJob = (job: any) => {
    const link = `https://careers.school.com/job/${job.id}`;
    navigator.clipboard.writeText(link).catch(() => { });
    alert(`Job link copied!\n\n${link}`);
  };

  const toggleStatus = (id: any, currentStatus: string) => {
    const newStatus = currentStatus === "Published" ? "Unpublished" : "Published";
    const label = currentStatus === "Published" ? "Unpublish" : "Publish";
    const role = postings.find((p) => p.id === id)?.role;
    if (window.confirm(`${label} "${role}"?`)) {
      setPostings((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
    }
  };

  const stats = [
    { label: "Published", value: postings.filter((p) => p.status === "Published").length, color: T.green },
    { label: "Unpublished", value: postings.filter((p) => p.status !== "Published").length, color: T.amber },
    { label: "Total Applications", value: postings.reduce((s, p) => s + (p.apps || 0), 0), color: T.blue },
  ];

  return (
    <div>
      <SectionTitle title="Job Postings" sub="Manage and publish approved jobs to your career portal" />

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {stats.map((s) => (
          <Card key={s.label} style={{ padding: isMobile ? 14 : 18 }}>
            <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.ink, marginTop: 4 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Job filter carousel */}
      {postings.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMid }}>
              {selectedPostingId ? (
                <span>
                  Filtering by <span style={{ color: T.primary }}>{selectedRole}</span>
                  <button
                    onClick={() => selectPosting(null)}
                    style={{ marginLeft: 8, fontSize: 11, color: T.inkFaint, background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}
                  >
                    Clear ×
                  </button>
                </span>
              ) : (
                <span style={{ color: T.inkFaint }}>Select a job to filter postings</span>
              )}
            </div>
            {!isMobile && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => scrollCarousel("left")} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                <button onClick={() => scrollCarousel("right")} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
              </div>
            )}
          </div>

          {/* ── MOBILE: one-at-a-time full-width tile snap carousel ── */}
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
                {/* All tile — full width */}
                <div
                  onClick={() => selectPosting(null)}
                  style={{
                    flexShrink: 0, width: "100%", scrollSnapAlign: "center",
                    border: `2px solid ${!selectedPostingId ? T.primary : T.border}`,
                    borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                    background: !selectedPostingId ? T.primaryLight : T.surface,
                    display: "flex", flexDirection: "row", alignItems: "center", gap: 16,
                    transition: "all 0.2s",
                    boxShadow: !selectedPostingId ? `0 4px 20px ${T.primary}22` : "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                    background: !selectedPostingId ? T.primary : T.border,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, color: "#fff",
                  }}>◈</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: !selectedPostingId ? T.primary : T.ink }}>All Postings</div>
                    <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>{postings.reduce((s, p) => s + (p.apps || 0), 0)} total applications</div>
                  </div>
                  {!selectedPostingId && (
                    <div style={{ background: T.primary, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>
                  )}
                </div>

                {postings.map((p) => {
                  const isSelected = selectedPostingId === p.id;
                  const initials = p.role.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
                  const details = getJobDetails(p);
                  return (
                    <div
                      key={p.id}
                      onClick={() => selectPosting(p.id)}
                      style={{
                        flexShrink: 0, width: "100%", scrollSnapAlign: "center",
                        border: `2px solid ${isSelected ? T.primary : T.border}`,
                        borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                        background: isSelected ? T.primaryLight : T.surface,
                        transition: "all 0.2s",
                        boxShadow: isSelected ? `0 4px 20px ${T.primary}22` : "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                          background: isSelected ? T.primary : "#E2E8F0",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 17, fontWeight: 800,
                          color: isSelected ? "#fff" : T.inkMid,
                        }}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{p.role}</div>
                          <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>{p.channel} Posting</div>
                        </div>
                        {isSelected && (
                          <div style={{ background: T.primary, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, gap: 8 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{
                            fontSize: 11, borderRadius: 99, padding: "3px 10px", fontWeight: 700,
                            background: details.type === "Full-time" ? T.primaryLight : T.tealLight,
                            color: details.type === "Full-time" ? T.primary : T.teal,
                          }}>{details.type}</span>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: isSelected ? T.primary : T.ink }}>{p.apps ?? 0}</span>
                          <span style={{ fontSize: 10, color: T.inkFaint, display: "block", lineHeight: 1 }}>applications</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dot indicators */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
                {[null, ...postings.map((p) => p.id)].map((id, i) => (
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
                      background: selectedPostingId === id ? T.primary : T.border,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            /* ── DESKTOP: multi-card side-scroll carousel ── */
            <div
              ref={scrollRef}
              className="carousel-scroll"
              style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8, WebkitOverflowScrolling: "touch" }}
            >
              <div
                onClick={() => selectPosting(null)}
                style={{
                  flexShrink: 0, width: 200, scrollSnapAlign: "start",
                  border: `2px solid ${!selectedPostingId ? T.primary : T.border}`,
                  borderRadius: 14, padding: "16px 18px", cursor: "pointer",
                  background: !selectedPostingId ? T.primaryLight : T.surface,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, transition: "all 0.15s", minHeight: 140,
                }}
              >
                <div style={{ fontSize: 24, opacity: 0.5 }}>◈</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: !selectedPostingId ? T.primary : T.ink, textAlign: "center" }}>All Postings</div>
                <div style={{ fontSize: 11, color: T.inkFaint, textAlign: "center" }}>{postings.reduce((s, p) => s + (p.apps || 0), 0)} applications</div>
              </div>

              {postings.map((p) => {
                const isSelected = selectedPostingId === p.id;
                const details = getJobDetails(p);
                return (
                  <div
                    key={p.id}
                    onClick={() => selectPosting(p.id)}
                    style={{
                      flexShrink: 0, width: 280, scrollSnapAlign: "start",
                      border: `2px solid ${isSelected ? T.primary : T.border}`,
                      borderRadius: 14, padding: "14px 16px", cursor: "pointer",
                      background: isSelected ? T.primaryLight : T.surface,
                      transition: "all 0.18s",
                      display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 140,
                      boxShadow: isSelected ? `0 4px 20px ${T.primary}22` : "0 1px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, flex: 1 }}>{p.role}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 7px", background: details.type === "Full-time" ? T.primaryLight : T.tealLight, color: details.type === "Full-time" ? T.primary : T.teal }}>{details.type}</span>
                      </div>
                      <div style={{ fontSize: 11, color: T.inkLight }}>{p.channel} Posting</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: T.inkMid }}><strong>{p.apps ?? 0}</strong> applications</span>
                      {isSelected && <span style={{ fontSize: 10, fontWeight: 700, background: T.primary, color: "#fff", borderRadius: 99, padding: "2px 8px" }}>Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isMobile ? (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
            {filtered.length} posting{filtered.length !== 1 ? "s" : ""}
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
            {filtered.map((p, idx) => {
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedJobForModal(p)}
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
                      <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.role}</div>
                      <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 4 }}>{p.channel}</div>
                    </div>
                    <div style={{ fontSize: 11, color: T.inkFaint, flexShrink: 0 }}>
                      {idx + 1}/{filtered.length}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8, borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Job ID</span>
                      <Mono v={p.id} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Posted</span>
                      <span style={{ fontSize: 13, color: T.ink }}>{p.posted || "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Expiry</span>
                      <span style={{ fontSize: 13, color: T.ink }}>{p.expiry || "—"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Applications</span>
                      <span style={{ fontSize: 13, color: T.ink, fontWeight: 700 }}>{p.apps ?? 0}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</span>
                      <span
                        style={{
                          borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700,
                          ...(p.status === "Published"
                            ? { background: T.greenLight, color: T.green, border: `1px solid ${T.green}` }
                            : { background: T.amberLight, color: T.amber, border: `1px solid ${T.amber}` }),
                        }}
                      >
                        {p.status || "Unpublished"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: "12px 18px", display: "flex", justifyContent: "flex-end", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                    {p.status === "Published" && (
                      <button
                        onClick={() => shareJob(p)}
                        style={{ border: "none", background: T.blueLight, color: T.blue, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                      >
                        Share
                      </button>
                    )}
                    <button
                      onClick={() => toggleStatus(p.id, p.status)}
                      style={{
                        border: "none",
                        background: p.status === "Published" ? "#FEE2E2" : T.greenLight,
                        color: p.status === "Published" ? "#DC2626" : T.green,
                        borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12,
                      }}
                    >
                      {p.status === "Published" ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card>
          <div style={{ padding: "16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Input
              placeholder="Search role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: isMobile ? "100%" : 280 }}
            />
          </div>

          <Table
            cols={["Job ID", "Role", "Posted", "Expiry", "Applications", "Status", "Actions"]}
            onRowClick={(i) => setSelectedJobForModal(filtered[i])}
            rows={filtered.map((p) => [
              <Mono v={p.id} />,
              <div>
                <div style={{ fontWeight: 800, color: T.ink }}>{p.role}</div>
              </div>,
              <span style={{ fontSize: 12, color: T.inkMid }}>{p.posted}</span>,
              <span style={{ fontSize: 12, color: T.inkMid }}>{p.expiry}</span>,
              <span style={{ fontWeight: 700, color: T.ink }}>{p.apps ?? 0}</span>,
              <span
                style={{
                  borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700, display: "inline-block",
                  ...(p.status === "Published"
                    ? { background: T.greenLight, color: T.green, border: `1px solid ${T.green}` }
                    : { background: T.amberLight, color: T.amber, border: `1px solid ${T.amber}` }),
                }}
              >
                {p.status || "Unpublished"}
              </span>,
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
                {p.status === "Published" && (
                  <button
                    onClick={() => shareJob(p)}
                    style={{ border: "none", background: T.blueLight, color: T.blue, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                  >
                    Share
                  </button>
                )}
                <button
                  onClick={() => toggleStatus(p.id, p.status)}
                  style={{
                    border: "none",
                    background: p.status === "Published" ? "#FEE2E2" : T.greenLight,
                    color: p.status === "Published" ? "#DC2626" : T.green,
                    borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12,
                  }}
                >
                  {p.status === "Published" ? "Unpublish" : "Publish"}
                </button>
              </div>,
            ])}
          />
        </Card>
      )}

      {selectedJobForModal && (() => {
        const details = getJobDetails(selectedJobForModal);
        return (
          <Modal open={!!selectedJobForModal} onClose={() => setSelectedJobForModal(null)} maxWidth={600}>
            <ModalHeader title="Job Posting Details" onClose={() => setSelectedJobForModal(null)} />
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <Badge label={selectedJobForModal.status || "Unpublished"} variant={selectedJobForModal.status === "Published" ? "green" : "amber"} />
              <Badge label={`${selectedJobForModal.apps || 0} Applications`} variant="blue" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[
                ["Role", selectedJobForModal.role],
                ["Vacancies", details.vacancies],
                ["Experience", details.exp],
                ["Qualification", details.qual],
                ["Employment Type", details.type],
                ["Salary Range", details.salary],
                ["Location", details.location],
                ["Channel", selectedJobForModal.channel],
                ["Posted Date", selectedJobForModal.posted || "—"],
                ["Expiry", selectedJobForModal.expiry || "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 14, color: T.ink }}>{value || "—"}</div>
                </div>
              ))}
            </div>
            {details.description && details.description !== "—" && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Job Description</div>
                <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{details.description}</div>
              </div>
            )}
            {details.justification && details.justification !== "—" && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Justification</div>
                <div style={{ fontSize: 13, color: T.ink, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{details.justification}</div>
              </div>
            )}
            <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              {selectedJobForModal.status === "Published" && (
                <Btn label="Share" variant="outline" onClick={(e) => { e.stopPropagation(); shareJob(selectedJobForModal); }} />
              )}
              <Btn
                label={selectedJobForModal.status === "Published" ? "Unpublish" : "Publish"}
                variant={selectedJobForModal.status === "Published" ? "danger" : "success"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStatus(selectedJobForModal.id, selectedJobForModal.status);
                  setSelectedJobForModal((prev: any) =>
                    prev ? { ...prev, status: prev.status === "Published" ? "Unpublished" : "Published" } : null
                  );
                }}
              />
              <Btn label="Close" variant="ghost" onClick={() => setSelectedJobForModal(null)} />
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
