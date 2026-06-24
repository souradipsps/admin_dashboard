import React, { useState, useRef } from "react";
import { T, font } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint, useHorizontalScroll } from "../hooks";
import { Card, SectionTitle, Table, Mono, Badge, Btn, Modal, ModalHeader, FormField, Input } from "../components/ui";
import { EXISTING_ROLES, INTERVIEWS } from "../data";

export default function OfferManagement({
  offers,
  setOffers,
  jobPostings = [],
}: {
  offers: any[];
  setOffers: React.Dispatch<React.SetStateAction<any[]>>;
  jobPostings?: any[];
}) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const [viewOffer, setViewOffer] = useState<any>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genForm, setGenForm] = useState({ candidate: "", role: "", ctc: "", expiry: "", joining: "" });
  const [genRange, setGenRange] = useState<{ min: number; max: number; label: string } | null>(null);
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);

  const [selectedOfferForModal, setSelectedOfferForModal] = useState<any>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [filterActiveIndex, setFilterActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const hScroll = useHorizontalScroll();
  const accentColor = T.blue;
  const accentPale = T.bluePale;

  const statusColors: Record<string, string> = {
    Draft: T.inkFaint,
    Sent: T.blue,
    Accepted: T.green,
    Rejected: T.red,
    Expired: T.amber,
  };

  const enrichedPostings = jobPostings.map((p) => ({
    ...p,
    offerCount: offers.filter((o) => o.role === p.role).length,
  }));

  const selectedRole = enrichedPostings.find((p) => p.id === selectedPostingId)?.role ?? null;

  const filteredOffers = selectedPostingId
    ? offers.filter((o) => o.role === selectedRole)
    : offers;

  const counts: Record<string, number> = ["Draft", "Sent", "Accepted", "Rejected", "Expired"].reduce((acc, s) => {
    acc[s] = filteredOffers.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  const parseSalaryRange = (salaryRange: string) => {
    const trimmed = salaryRange.replace(/[₹, ]/g, "");
    const parts = trimmed.split("-").map((part) => parseInt(part, 10)).filter((v) => !Number.isNaN(v));
    if (parts.length !== 2) return null;
    return { min: parts[0], max: parts[1], label: `₹${parts[0].toLocaleString()} - ₹${parts[1].toLocaleString()}` };
  };

  const getRoleRange = (role: string) => {
    const roleDef = EXISTING_ROLES.find((r: any) => r.role === role || (r.role && r.role.toLowerCase() === role.toLowerCase()));
    return roleDef?.salaryRange ? parseSalaryRange(roleDef.salaryRange) : null;
  };

  const scrollCarousel = (dir: "left" | "right") => {
    hScroll.ref.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const selectPosting = (id: string | null) => {
    setSelectedPostingId((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      <SectionTitle
        title="Offer Management"
        sub="Review generated offers and track status end-to-end"
      />

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
                <span style={{ color: T.inkFaint }}>Select a job to filter offers</span>
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
                    flexShrink: 0, width: "100%", border: `2px solid ${!selectedPostingId ? accentColor : T.border}`,
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
                    <div style={{ fontSize: 15, fontWeight: 800, color: !selectedPostingId ? accentColor : T.ink }}>All Offers</div>
                    <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>{offers.length} total offers</div>
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
                        flexShrink: 0, width: "100%", border: `2px solid ${isSelected ? accentColor : T.border}`,
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
                          <span style={{ fontSize: 18, fontWeight: 800, color: isSelected ? accentColor : T.ink }}>{p.offerCount}</span>
                          <span style={{ fontSize: 10, color: T.inkFaint, display: "block", lineHeight: 1 }}>offers</span>
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
                style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8, WebkitOverflowScrolling: "touch", cursor: "grab", userSelect: "none" }}
              >
              <div
                onClick={() => selectPosting(null)}
                style={{
                  flexShrink: 0, width: 200, border: `2px solid ${!selectedPostingId ? accentColor : T.border}`,
                  borderRadius: 14, padding: "16px 18px", cursor: "pointer",
                  background: !selectedPostingId ? accentPale : T.surface,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, transition: "all 0.15s", minHeight: 140,
                }}
              >
                <div style={{ fontSize: 24, opacity: 0.5 }}>◈</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: !selectedPostingId ? accentColor : T.ink, textAlign: "center" }}>All Offers</div>
                <div style={{ fontSize: 11, color: T.inkFaint, textAlign: "center" }}>{offers.length} offers</div>
              </div>

              {enrichedPostings.map((p) => {
                const isSelected = selectedPostingId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => selectPosting(p.id)}
                    style={{
                      flexShrink: 0, width: 280, border: `2px solid ${isSelected ? accentColor : T.border}`,
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
                      <span style={{ fontSize: 12, color: T.inkMid }}><strong>{p.offerCount}</strong> offers</span>
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

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(5,1fr)", gap: 10, marginBottom: 18 }}>
        {Object.entries(counts).map(([s, n], idx) => (
          <div key={s} className="animate-fade-in-up" style={{ animationDelay: `${idx * 0.05}s` }}>
            <Card style={{ padding: "12px 14px", textAlign: "center", borderTop: `3px solid ${statusColors[s]}` }}>
              <div className="animate-count-up" style={{ fontSize: isMobile ? font['2xl'] : font['3xl'], fontWeight: font.black, fontFamily: font.heading, color: statusColors[s], animationDelay: `${idx * 0.05 + 0.1}s` }}>{n}</div>
              <div style={{ fontSize: font.sm + 1, fontWeight: font.bold, fontFamily: font.body, color: T.inkMid, marginTop: 4 }}>{s}</div>
            </Card>
          </div>
        ))}
      </div>

      {isMobile ? (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
            {filteredOffers.length} of {offers.length} offers
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
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              gap: 16,
              padding: "0 16px 20px",
              margin: "0 -16px",
            }}
          >
            {filteredOffers.map((o, idx) => {
              const interview = INTERVIEWS.find(inv => inv.candidate === o.candidate && inv.role === o.role);
              const cardBackground = "linear-gradient(135deg, #72102a 0%, #3a0010 100%)";
              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedOfferForModal(o)}
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
                    minHeight: 380,
                  }}
                >
                  {/* Pagination counter */}
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    {idx + 1} of {filteredOffers.length}
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
                        📄
                      </div>
                      <div style={{ paddingRight: 64 }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{o.candidate}</h3>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                          {o.role || "—"}
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
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Offer ID</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{o.id}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Interview Score</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>
                          {interview && interview.score !== null ? `${interview.score}` : "—"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>CTC</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{o.ctc || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Joining Date</div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{o.joining || "—"}</div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div />
                        <div>
                          <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700, textAlign: "right" }}>Status</div>
                          <div style={{ marginTop: 2, textAlign: "right" }}>
                            <Badge label={o.status} variant={statusVariant(o.status)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "flex-end", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setGenForm({ candidate: o.candidate, role: o.role, ctc: "", expiry: "", joining: "" });
                        setGenRange(getRoleRange(o.role));
                        setShowGenerateModal(true);
                      }}
                      style={{ border: "none", background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                    >
                      Generate Offer
                    </button>
                    {o.ctc && o.issued && o.expiry ? (
                      <button
                        onClick={() => setViewOffer(o)}
                        style={{ border: "none", background: "#fff", color: T.primary, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                      >
                        View Letter
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{ border: "none", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", borderRadius: 8, padding: "8px 14px", cursor: "not-allowed", fontWeight: 700, fontSize: 12 }}
                      >
                        View Letter
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dot indicators */}
          {filteredOffers.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10, paddingBottom: 8 }}>
              {filteredOffers.map((_, i) => (
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
        <Card>
          <div style={{
            padding: "12px 14px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "flex-end",
          }}>
            <span style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, whiteSpace: "nowrap" }}>
              {filteredOffers.length} of {offers.length} offers
            </span>
          </div>
          <Table
            cols={["Offer ID", "Candidate", "Role", "Score", "Status", "Generate", "Actions"]}
            onRowClick={(i) => setSelectedOfferForModal(filteredOffers[i])}
            rows={filteredOffers.map((o) => {
              const interview = INTERVIEWS.find(inv => inv.candidate === o.candidate && inv.role === o.role);
              const score = interview && interview.score !== null ? (
                <div style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 34, height: 34, borderRadius: "50%",
                  background: "#E6F6ED", color: "#00796B", fontWeight: 800, fontSize: 13
                }}>
                  {interview.score}
                </div>
              ) : "—";
              return [
                <Mono v={o.id} />,
                <strong style={{ color: T.ink }}>{o.candidate}</strong>,
                o.role,
                score,
                <Badge label={o.status} variant={statusVariant(o.status)} />,
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setGenForm({ candidate: o.candidate, role: o.role, ctc: "", expiry: "", joining: "" });
                      setGenRange(getRoleRange(o.role));
                      setShowGenerateModal(true);
                    }}
                    style={{ border: "none", background: T.blueLight, color: T.blue, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                  >
                    Generate Offer
                  </button>
                </div>,
                <div onClick={(e) => e.stopPropagation()}>
                  {o.ctc && o.issued && o.expiry ? (
                    <button
                      onClick={() => setViewOffer(o)}
                      style={{ border: "none", background: T.blueLight, color: T.blue, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}
                    >
                      View Letter
                    </button>
                  ) : (
                    <button
                      disabled
                      style={{ border: "none", background: "#E5E7EB", color: "#9CA3AF", borderRadius: 8, padding: "6px 12px", cursor: "not-allowed", fontWeight: 700, fontSize: 12, opacity: 0.6 }}
                    >
                      View Letter
                    </button>
                  )}
                </div>,
              ];
            })}
          />
        </Card>
      )}

      {/* Offer Details Popup Modal */}
      <Modal open={!!selectedOfferForModal} onClose={() => setSelectedOfferForModal(null)} maxWidth={600}>
        {selectedOfferForModal && (
          <>
            <ModalHeader title="Offer Details" onClose={() => setSelectedOfferForModal(null)} />
            
            {/* Gradient Banner Header */}
            <div style={{
              background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)",
              margin: isMobile ? "-4px -16px 20px" : "-4px -24px 20px",
              padding: isMobile ? "18px 20px" : "24px 28px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}>
              <div style={{
                width: 54, height: 54, borderRadius: 14,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0,
              }}>
                📄
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  {selectedOfferForModal.id} · {selectedOfferForModal.role}
                </div>
                <h3 style={{ margin: 0, fontSize: font.lg + 1, fontWeight: font.black, fontFamily: font.heading, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedOfferForModal.candidate}
                </h3>
              </div>
              <div style={{ display: "flex", gap: 6, flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "5px 14px",
                  background: selectedOfferForModal.status === "Accepted" ? "rgba(52,211,153,0.2)" : selectedOfferForModal.status === "Rejected" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.12)",
                  color: selectedOfferForModal.status === "Accepted" ? "#6EE7B7" : selectedOfferForModal.status === "Rejected" ? "#FCA5A5" : "rgba(255,255,255,0.7)",
                  border: `1px solid ${selectedOfferForModal.status === "Accepted" ? "rgba(110,231,183,0.35)" : selectedOfferForModal.status === "Rejected" ? "rgba(252,165,165,0.35)" : "rgba(255,255,255,0.18)"}`,
                  letterSpacing: "0.02em",
                }}>
                  {selectedOfferForModal.status}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Offer ID", value: selectedOfferForModal.id },
                { label: "Candidate", value: selectedOfferForModal.candidate },
                { label: "Role Name", value: selectedOfferForModal.role },
                { 
                  label: "Interview Score", 
                  value: (() => {
                    const int = INTERVIEWS.find(i => i.candidate === selectedOfferForModal.candidate && i.role === selectedOfferForModal.role);
                    return int && int.score !== null ? `${int.score} / 100` : "—";
                  })()
                },
                { label: "CTC (Monthly)", value: selectedOfferForModal.ctc || "—" },
                { label: "Issued Date", value: selectedOfferForModal.issued || "—" },
                { label: "Expiry Date", value: selectedOfferForModal.expiry || "—" },
                { label: "Expected Joining Date", value: selectedOfferForModal.joining || "—" },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: "10px 12px", background: T.canvas, border: `1px solid ${T.border}`,
                  borderRadius: 8, display: "flex", flexDirection: "column", gap: 3
                }}>
                  <span style={{ fontSize: 9.5, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {item.label}
                  </span>
                  <div style={{ fontSize: 12.5, color: T.ink, fontWeight: 600 }}>
                    {item.value || "—"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 20,
              display: "flex",
              gap: 10,
              justifyContent: isMobile ? "stretch" : "flex-end",
              borderTop: `1px solid ${T.border}`,
              paddingTop: 16
            }}>
              {selectedOfferForModal.ctc && selectedOfferForModal.issued && selectedOfferForModal.expiry ? (
                <Btn
                  label="View Letter"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewOffer(selectedOfferForModal);
                    setSelectedOfferForModal(null);
                  }}
                  style={{ flex: isMobile ? 1 : undefined }}
                />
              ) : (
                <Btn
                  label="Generate Offer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setGenForm({ candidate: selectedOfferForModal.candidate, role: selectedOfferForModal.role, ctc: "", expiry: "", joining: "" });
                    setGenRange(getRoleRange(selectedOfferForModal.role));
                    setShowGenerateModal(true);
                    setSelectedOfferForModal(null);
                  }}
                  style={{ flex: isMobile ? 1 : undefined }}
                />
              )}
            </div>
          </>
        )}
      </Modal>

      {/* View Offer Letter Modal */}
      <Modal open={!!viewOffer} onClose={() => setViewOffer(null)} maxWidth={560}>
        {viewOffer && (
          <>
            <ModalHeader title="Offer Letter Preview" onClose={() => setViewOffer(null)} />
            
            {/* Gradient Banner Header */}
            <div style={{
              background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)",
              margin: isMobile ? "-4px -16px 20px" : "-4px -24px 20px",
              padding: isMobile ? "18px 20px" : "24px 28px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}>
              <div style={{
                width: 54, height: 54, borderRadius: 14,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0,
              }}>
                📄
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  Offer Letter Preview · {viewOffer.role}
                </div>
                <h3 style={{ margin: 0, fontSize: font.lg + 1, fontWeight: font.black, fontFamily: font.heading, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {viewOffer.candidate}
                </h3>
              </div>
            </div>

            <div style={{
              background: T.canvas,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: isMobile ? "16px 18px" : "24px 28px",
              marginBottom: 20,
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
            }}>
              <div style={{ textAlign: "center", marginBottom: 20, borderBottom: `1px dashed ${T.border}`, paddingBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#72102a", fontFamily: font.heading }}>South Point School</div>
                <div style={{ fontSize: 12, color: T.inkLight, fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Offer of Employment</div>
              </div>
              <div style={{ fontSize: 13.5, color: T.inkMid, lineHeight: 1.8, fontFamily: font.body }}>
                <p style={{ marginTop: 0 }}>Dear <strong>{viewOffer.candidate}</strong>,</p>
                <p>
                  We are pleased to offer you the position of <strong>{viewOffer.role}</strong> at South Point School.
                  The monthly compensation for this role is <strong style={{ color: T.tealDark }}>{viewOffer.ctc}</strong>.
                </p>
                <p>This offer is valid until <strong>{viewOffer.expiry}</strong>. Please confirm your acceptance by the deadline.</p>
                <p style={{ marginTop: 24, marginBottom: 0, borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
                  Warm regards,<br />
                  <strong style={{ color: T.ink }}>HR Department</strong><br />
                  <span style={{ fontSize: 12, color: T.inkFaint }}>South Point School</span>
                </p>
              </div>
            </div>

            <div style={{
              display: "flex",
              gap: 10,
              justifyContent: isMobile ? "stretch" : "flex-end",
              borderTop: `1px solid ${T.border}`,
              paddingTop: 16
            }}>
              <Btn
                label="Download PDF"
                onClick={() => alert("PDF download would be implemented here.")}
                style={{ flex: isMobile ? 1 : undefined }}
              />
              <Btn
                label="Close"
                variant="ghost"
                onClick={() => setViewOffer(null)}
                style={{ flex: isMobile ? 1 : undefined }}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Generate Offer Modal (OfferManagement) */}
      <Modal open={showGenerateModal} onClose={() => setShowGenerateModal(false)} maxWidth={520}>
        <ModalHeader title="Generate Offer Letter" onClose={() => setShowGenerateModal(false)} />
        
        {/* Gradient Banner Header */}
        <div style={{
          background: "linear-gradient(135deg, #72102a 0%, #3a0010 100%)",
          margin: isMobile ? "-4px -16px 20px" : "-4px -24px 20px",
          padding: isMobile ? "18px 20px" : "24px 28px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            width: 54, height: 54, borderRadius: 14,
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, flexShrink: 0,
          }}>
            ✉️
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Generate Offer Letter · {genForm.role}
            </div>
            <h3 style={{ margin: 0, fontSize: font.lg + 1, fontWeight: font.black, fontFamily: font.heading, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {genForm.candidate}
            </h3>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
          <FormField label="CTC (Monthly)" required>
            <Input
              type="number"
              placeholder={genRange ? genRange.label : "Enter monthly CTC"}
              value={genForm.ctc}
              onChange={(e) => setGenForm((p) => ({ ...p, ctc: e.target.value }))}
              style={{ width: "100%" }}
            />
            {genRange && (
              <div style={{ marginTop: 6, fontSize: 11, color: T.inkLight }}>
                Allowed range: {genRange.label}
              </div>
            )}
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
            <FormField label="Offer Expiry Date" required>
              <Input
                type="date"
                value={genForm.expiry}
                onChange={(e) => setGenForm((p) => ({ ...p, expiry: e.target.value }))}
                style={{ width: "100%" }}
              />
            </FormField>
            <FormField label="Expected Joining Date" required>
              <Input
                type="date"
                value={genForm.joining}
                onChange={(e) => setGenForm((p) => ({ ...p, joining: e.target.value }))}
                style={{ width: "100%" }}
              />
            </FormField>
          </div>
        </div>

        <div style={{
          display: "flex",
          gap: 10,
          justifyContent: isMobile ? "stretch" : "flex-end",
          borderTop: `1px solid ${T.border}`,
          paddingTop: 16
        }}>
          <Btn
            label="Generate & Send"
            onClick={() => {
              if (!genForm.ctc || !genForm.expiry || !genForm.joining) { alert("Please fill all required fields."); return; }
              const ctcNumber = Number(genForm.ctc);
              if (!ctcNumber || ctcNumber <= 0) { alert("Enter valid CTC amount."); return; }
              if (genRange && (ctcNumber < genRange.min || ctcNumber > genRange.max)) { alert(`CTC must be between ${genRange.label}.`); return; }
              const prepared = {
                id: `OFR-${Date.now()}`,
                candidate: genForm.candidate,
                role: genForm.role,
                ctc: `₹${ctcNumber.toLocaleString()}/mo`,
                issued: new Date().toISOString().split("T")[0],
                expiry: genForm.expiry,
                joining: genForm.joining,
                status: "Sent",
              };
              setOffers((prev) => {
                const idx = prev.findIndex((p) => p.candidate === prepared.candidate && p.role === prepared.role);
                if (idx >= 0) {
                  const copy = [...prev];
                  copy[idx] = { ...copy[idx], ...prepared };
                  return copy;
                }
                return [...prev, prepared];
              });
              setShowGenerateModal(false);
              setGenForm({ candidate: "", role: "", ctc: "", expiry: "", joining: "" });
              setGenRange(null);
            }}
            style={{ flex: isMobile ? 1 : undefined }}
          />
          <Btn
            label="Cancel"
            variant="ghost"
            onClick={() => setShowGenerateModal(false)}
            style={{ flex: isMobile ? 1 : undefined }}
          />
        </div>
      </Modal>
    </div>
  );
}
