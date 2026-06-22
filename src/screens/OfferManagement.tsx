import React, { useState, useRef } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint } from "../hooks";
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

  const scrollRef = useRef<HTMLDivElement>(null);
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
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
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
                    onClick={() => selectPosting(null)}
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
                    <div style={{ fontSize: 15, fontWeight: 800, color: !selectedPostingId ? accentColor : T.ink }}>All Offers</div>
                    <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>{offers.length} total offers</div>
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
                          <span style={{ fontSize: 18, fontWeight: 800, color: isSelected ? accentColor : T.ink }}>{p.offerCount}</span>
                          <span style={{ fontSize: 10, color: T.inkFaint, display: "block", lineHeight: 1 }}>offers</span>
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
                      <span style={{ fontSize: 12, color: T.inkMid }}><strong>{p.offerCount}</strong> offers</span>
                      {isSelected && <span style={{ fontSize: 10, fontWeight: 700, background: accentColor, color: "#fff", borderRadius: 99, padding: "2px 8px" }}>Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3,1fr)" : "repeat(5,1fr)", gap: 10, marginBottom: 18 }}>
        {Object.entries(counts).map(([s, n]) => (
          <Card key={s} style={{ padding: "12px 14px", textAlign: "center", borderTop: `3px solid ${statusColors[s]}` }}>
            <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: statusColors[s] }}>{n}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.inkMid, marginTop: 4 }}>{s}</div>
          </Card>
        ))}
      </div>

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

      {/* Offer Details Popup Modal */}
      <Modal open={!!selectedOfferForModal} onClose={() => setSelectedOfferForModal(null)} maxWidth={600}>
        {selectedOfferForModal && (
          <>
            <ModalHeader title="Offer Details" onClose={() => setSelectedOfferForModal(null)} />
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <Badge label={selectedOfferForModal.status} variant={statusVariant(selectedOfferForModal.status)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {[
                ["Offer ID", selectedOfferForModal.id],
                ["Candidate", selectedOfferForModal.candidate],
                ["Role", selectedOfferForModal.role],
                ["Interview Score", (() => {
                  const int = INTERVIEWS.find(i => i.candidate === selectedOfferForModal.candidate && i.role === selectedOfferForModal.role);
                  return int && int.score !== null ? `${int.score}` : "—";
                })()],
                ["Status", selectedOfferForModal.status],
                ["CTC (Monthly)", selectedOfferForModal.ctc || "—"],
                ["Issued Date", selectedOfferForModal.issued || "—"],
                ["Expiry Date", selectedOfferForModal.expiry || "—"],
                ["Expected Joining Date", selectedOfferForModal.joining || "—"],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{label as string}</div>
                  <div style={{ fontSize: 14, color: T.ink }}>{value as React.ReactNode}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              {selectedOfferForModal.ctc && selectedOfferForModal.issued && selectedOfferForModal.expiry ? (
                <Btn
                  label="View Letter"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewOffer(selectedOfferForModal);
                    setSelectedOfferForModal(null);
                  }}
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
                />
              )}
              <Btn label="Close" variant="ghost" onClick={() => setSelectedOfferForModal(null)} />
            </div>
          </>
        )}
      </Modal>

      {/* View Offer Letter Modal */}
      <Modal open={!!viewOffer} onClose={() => setViewOffer(null)} maxWidth={560}>
        {viewOffer && (
          <>
            <ModalHeader title="Offer Letter Preview" onClose={() => setViewOffer(null)} />
            <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 10, padding: 24, marginBottom: 20 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: T.blue }}>South Point School</div>
                <div style={{ fontSize: 12, color: T.inkLight, marginTop: 2 }}>Offer of Employment</div>
              </div>
              <div style={{ fontSize: 13, color: T.inkMid, lineHeight: 1.8 }}>
                <p>Dear <strong>{viewOffer.candidate}</strong>,</p>
                <p>
                  We are pleased to offer you the position of <strong>{viewOffer.role}</strong> at South Point School.
                  The monthly compensation for this role is <strong style={{ color: T.tealDark }}>{viewOffer.ctc}</strong>.
                </p>
                <p>This offer is valid until <strong>{viewOffer.expiry}</strong>. Please confirm your acceptance by the deadline.</p>
                <p style={{ marginTop: 16 }}>Warm regards,<br /><strong>HR Department</strong><br />South Point School</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn label="Download PDF" variant="outline" onClick={() => alert("PDF download would be implemented here.")} />
              <Btn label="Close" variant="ghost" onClick={() => setViewOffer(null)} />
            </div>
          </>
        )}
      </Modal>
      {/* Generate Offer Modal (OfferManagement) */}
      <Modal open={showGenerateModal} onClose={() => setShowGenerateModal(false)} maxWidth={520}>
        <ModalHeader title="Generate Offer Letter" onClose={() => setShowGenerateModal(false)} />
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.inkLight, marginBottom: 6 }}>Candidate</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{genForm.candidate}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.inkLight, marginBottom: 6 }}>Role</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{genForm.role}</div>
          </div>
          <div>
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
          </div>
          <div>
            <FormField label="Offer Expiry Date" required>
              <Input
                type="date"
                value={genForm.expiry}
                onChange={(e) => setGenForm((p) => ({ ...p, expiry: e.target.value }))}
                style={{ width: "100%" }}
              />
            </FormField>
          </div>
          <div>
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
        <div style={{ display: "flex", gap: 10 }}>
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
          />
          <Btn label="Cancel" variant="ghost" onClick={() => setShowGenerateModal(false)} />
        </div>
      </Modal>
    </div>
  );
}
