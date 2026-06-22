import React, { useState, useRef } from "react";
import { T } from "../theme";
import { useBreakpoint } from "../hooks";

const MAROON = T.primary;
const GOLD = T.accent;

const DEFAULT_FIELDS = [
  "Communication Skills",
  "Subject Knowledge",
  "Confidence",
  "Problem Solving",
  "Cultural Fit",
];

const REC_COLORS: Record<string, { bg: string; color: string }> = {
  "Strong Hire": { bg: T.greenLight, color: T.green },
  "Hire": { bg: "#ECFDF5", color: "#047857" },
  "Hold": { bg: T.accentLight, color: T.accentDark },
  "Reject": { bg: T.redLight, color: T.red },
};

/** Compute 0-100 score from a {field: 1-5} scores map */
function computeScore(scores: Record<string, number>): number | null {
  const vals = Object.values(scores);
  if (!vals.length) return null;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 20);
}

/** Average all evaluation scores for an interview */
function computeTotalScore(evaluations: any[]): number | null {
  if (!evaluations?.length) return null;
  const valid = evaluations
    .map((e) => computeScore(e.scores))
    .filter((s): s is number => s !== null);
  if (!valid.length) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 80 ? T.green : score >= 60 ? T.accentDark : T.red;
  const bg = score >= 80 ? T.greenLight : score >= 60 ? T.accentLight : T.redLight;
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 900, fontSize: 14, background: bg, color,
      border: `2px solid ${color}44`, flexShrink: 0,
    }}>
      {score}
    </div>
  );
}

/** Mini 1-5 dot row for a single criterion */
function ScoreDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 10, height: 10, borderRadius: "50%",
            background: i < value ? MAROON : T.border,
            transition: "background 0.1s",
          }}
        />
      ))}
    </div>
  );
}

export default function Panelist({
  interviews = [],
  setInterviews,
  jobPostings = [],
  panelists = [],
  selectedPanelists = [],
  currentUser = "admin",
}: {
  interviews?: any[];
  setInterviews?: React.Dispatch<React.SetStateAction<any[]>>;
  jobPostings?: any[];
  panelists?: any[];
  selectedPanelists?: string[];
  currentUser?: string;
}) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const scrollRef = useRef<HTMLDivElement>(null);

  // Job filter
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Evaluation modal state
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [evaluatorName, setEvaluatorName] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newField, setNewField] = useState("");
  const [notes, setNotes] = useState("");
  const [recommendation, setRecommendation] = useState("Strong Hire");

  // Which card's scorecards are expanded
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // ── Check if current user can evaluate ──────────────────────────────────────

  const canEvaluate = (interview: any): { allowed: boolean; reason?: string } => {
    const isAdmin = currentUser === "admin";
    const isAssignedPanelist = interview.panel?.includes(currentUser);

    if (!isAdmin && !isAssignedPanelist) {
      return { allowed: false, reason: "You are not authorized to evaluate candidates" };
    }

    // Check if already evaluated
    const alreadyEvaluated = interview.evaluations?.some((e: any) => e.panelist === currentUser);
    if (alreadyEvaluated && !isAdmin) {
      return { allowed: false, reason: "You have already evaluated this candidate" };
    }

    return { allowed: true };
  };

  // ── Derived data ──────────────────────────────────────────────────────────

  const enrichedPostings = jobPostings.map((p) => ({
    ...p,
    count: interviews.filter(
      (i) => i.role === p.role && i.date && i.status !== "Completed"
    ).length,
  }));

  const selectedRole = enrichedPostings.find((p) => p.id === selectedJobId)?.role ?? null;
  const scheduledInterviews = interviews.filter((i) => i.date);
  const filteredInterviews = selectedRole
    ? scheduledInterviews.filter((i) => i.role === selectedRole)
    : scheduledInterviews;

  const upcomingCount = scheduledInterviews.filter((i) => i.status !== "Completed").length;
  const evaluatedCount = scheduledInterviews.filter(
    (i) => i.evaluations?.length > 0
  ).length;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const selectJob = (id: string | null) =>
    setSelectedJobId((prev) => (prev === id ? null : id));

  const scrollCarousel = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const openEval = (interview: any) => {
    setSelectedInterview(interview);

    // Check if admin is editing an existing evaluation
    const isAdmin = currentUser === "admin";
    const alreadyEvaluated = interview.evaluations?.some((e: any) => e.panelist === currentUser);

    if (isAdmin && alreadyEvaluated && interview.evaluations?.length > 0) {
      // Admin editing - if they haven't evaluated, pick first evaluation to edit
      const firstEval = interview.evaluations[0];
      setEvaluatorName(firstEval.panelist);
      setScores(firstEval.scores || {});
      setCustomFields(firstEval.customFields || []);
      setNotes(firstEval.notes || "");
      setRecommendation(firstEval.recommendation || "Strong Hire");
    } else {
      // Regular panelist - their own evaluation
      setEvaluatorName(currentUser);
      setScores({});
      setCustomFields([]);
      setNotes("");
      setRecommendation("Strong Hire");
    }

    setNewField("");
  };

  const updateScore = (field: string, value: number) =>
    setScores((prev) => ({ ...prev, [field]: value }));

  const addCustomField = () => {
    if (!newField.trim()) return;
    setCustomFields((prev) => [...prev, newField.trim()]);
    setNewField("");
  };

  const handleSubmit = () => {
    if (!evaluatorName.trim()) {
      alert("Please enter your name before submitting.");
      return;
    }
    if (!setInterviews || !selectedInterview) return;

    const newEval = {
      panelist: evaluatorName.trim(),
      scores,
      customFields,
      recommendation,
      notes,
      submittedAt: new Date().toISOString(),
    };

    setInterviews((prev) =>
      prev.map((i) => {
        if (
          i.candidate !== selectedInterview.candidate ||
          i.role !== selectedInterview.role ||
          i.round !== selectedInterview.round
        )
          return i;

        // Check if admin is editing an existing evaluation
        const isAdmin = currentUser === "admin";
        let updatedEvals = [...(i.evaluations || [])];

        if (isAdmin && evaluatorName !== currentUser) {
          // Admin is editing someone else's evaluation - find and replace it
          const existingIdx = updatedEvals.findIndex((e) => e.panelist === evaluatorName.trim());
          if (existingIdx >= 0) {
            updatedEvals[existingIdx] = newEval;
          } else {
            updatedEvals = [...updatedEvals, newEval];
          }
        } else {
          // Regular panelist or admin editing their own - just add/replace
          const existingIdx = updatedEvals.findIndex((e) => e.panelist === evaluatorName.trim());
          if (existingIdx >= 0) {
            updatedEvals[existingIdx] = newEval;
          } else {
            updatedEvals = [...updatedEvals, newEval];
          }
        }

        const allScores = updatedEvals
          .map((e) => computeScore(e.scores))
          .filter((s): s is number => s !== null);
        const avgScore =
          allScores.length
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : i.score;

        return {
          ...i,
          evaluations: updatedEvals,
          score: avgScore,
          rec: recommendation,
          status: "Completed",
        };
      })
    );

    // Auto-expand scorecards for this card
    const key = `${selectedInterview.candidate}-${selectedInterview.role}-${selectedInterview.round}`;
    setExpandedCards((prev) => ({ ...prev, [key]: true }));
    setSelectedInterview(null);
  };

  const toggleExpand = (key: string) =>
    setExpandedCards((prev) => ({ ...prev, [key]: !prev[key] }));

  const avatar = (name: string, size = 48, fs = 16) => (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: T.primaryLight, color: MAROON,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: fs, flexShrink: 0,
    }}>
      {name.split(" ").map((n: string) => n[0]).join("")}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: T.ink, margin: 0, letterSpacing: "-0.02em" }}>
          Panelist Dashboard
        </h1>
        <p style={{ color: T.inkLight, margin: "4px 0 0", fontSize: 13 }}>
          Review interviews, submit evaluations, and see scorecard history.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Upcoming Interviews", value: upcomingCount, color: MAROON, bg: T.primaryLight },
          { label: "Evaluations Done", value: evaluatedCount, color: T.green, bg: T.greenLight },
          { label: "Total Scheduled", value: scheduledInterviews.length, color: T.teal, bg: T.tealLight },
        ].map((k) => (
          <div key={k.label} style={{ background: k.bg, borderRadius: 14, padding: isMobile ? 16 : 20, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: k.color, textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.85 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: k.color, marginTop: 6, lineHeight: 1 }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Job filter carousel ─────────────────────────────────────────────── */}
      {enrichedPostings.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMid }}>
              {selectedJobId ? (
                <span>
                  Filtering by <span style={{ color: MAROON }}>{selectedRole}</span>
                  <button
                    onClick={() => selectJob(null)}
                    style={{ marginLeft: 8, fontSize: 11, color: T.inkFaint, background: "none", border: `1px solid ${T.border}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}
                  >Clear ×</button>
                </span>
              ) : (
                <span style={{ color: T.inkFaint }}>Select a job to filter interviews</span>
              )}
            </div>
            {!isMobile && (
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => scrollCarousel("left")} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                <button onClick={() => scrollCarousel("right")} style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
              </div>
            )}
          </div>

          <div ref={scrollRef} style={{ display: "flex", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8, WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            {/* All tile */}
            <div
              onClick={() => selectJob(null)}
              style={{
                flexShrink: 0, width: isMobile ? "78vw" : 190, scrollSnapAlign: "start",
                border: `2px solid ${!selectedJobId ? MAROON : T.border}`, borderRadius: 14,
                padding: "16px 18px", cursor: "pointer",
                background: !selectedJobId ? T.primaryLight : T.surface,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 8, transition: "all 0.15s", minHeight: 125,
                boxShadow: !selectedJobId ? `0 4px 20px ${MAROON}22` : "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 24, opacity: 0.45 }}>◈</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: !selectedJobId ? MAROON : T.ink, textAlign: "center" }}>All Interviews</div>
              <div style={{ fontSize: 11, color: T.inkFaint }}>{scheduledInterviews.length} scheduled</div>
              {!selectedJobId && <div style={{ background: MAROON, color: "#fff", borderRadius: 99, padding: "2px 10px", fontSize: 10, fontWeight: 700 }}>Selected</div>}
            </div>

            {enrichedPostings.map((p) => {
              const isSelected = selectedJobId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => selectJob(p.id)}
                  style={{
                    flexShrink: 0, width: isMobile ? "78vw" : 250, scrollSnapAlign: "start",
                    border: `2px solid ${isSelected ? MAROON : T.border}`, borderRadius: 14,
                    padding: "14px 16px", cursor: "pointer",
                    background: isSelected ? T.primaryLight : T.surface,
                    transition: "all 0.18s",
                    display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 125,
                    boxShadow: isSelected ? `0 4px 20px ${MAROON}22` : "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3, flex: 1 }}>{p.role}</div>
                      <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 7px", flexShrink: 0, background: p.type === "Full-time" ? T.primaryLight : T.tealLight, color: p.type === "Full-time" ? MAROON : T.teal }}>
                        {p.type}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: T.inkLight }}>{p.channel} Posting</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <span style={{ fontSize: 12, color: T.inkMid }}>
                      <strong style={{ fontSize: 15, color: isSelected ? MAROON : T.ink }}>{p.count}</strong> upcoming
                    </span>
                    {isSelected && <span style={{ fontSize: 10, fontWeight: 700, background: MAROON, color: "#fff", borderRadius: 99, padding: "2px 9px" }}>Selected</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Interview cards ─────────────────────────────────────────────────── */}
      {filteredInterviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: T.surface, borderRadius: 16, border: `1.5px dashed ${T.border}`, color: T.inkFaint, fontSize: 14 }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.35 }}>🗓</div>
          {selectedRole ? `No scheduled interviews for "${selectedRole}"` : "No interviews scheduled yet."}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            alignItems: isMobile ? "flex-start" : undefined,
            gap: 20,
            overflowX: isMobile ? "auto" : undefined,
            overflowY: isMobile ? "hidden" : undefined,
            scrollSnapType: isMobile ? "x mandatory" : undefined,
            WebkitOverflowScrolling: isMobile ? "touch" : undefined,
            msOverflowStyle: isMobile ? "none" : undefined,
            paddingBottom: isMobile ? 20 : undefined,
            marginBottom: isMobile ? 10 : undefined,
            paddingLeft: isMobile ? 16 : undefined,
            paddingRight: isMobile ? 16 : undefined,
            height: isMobile ? "auto" : undefined,
            margin: isMobile ? "0 -16px" : undefined,
          }}
        >
          {filteredInterviews.map((interview, idx) => {
            const cardKey = `${interview.candidate}-${interview.role}-${interview.round}`;
            const evaluations: any[] = interview.evaluations || [];
            const totalScore = computeTotalScore(evaluations);
            const isCompleted = interview.status === "Completed";
            const isExpanded = expandedCards[cardKey] ?? evaluations.length > 0;
            const allFields = [...DEFAULT_FIELDS];

            if (isMobile) {
              return (
                <div
                  key={cardKey}
                  style={{
                    flexShrink: 0,
                    width: "calc(100vw - 32px)",
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
                    cursor: "pointer",
                    minHeight: 520,
                  }}
                >
                  {/* Pagination counter */}
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    {idx + 1} of {filteredInterviews.length}
                  </div>

                  <div>
                    {/* Header info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {avatar(interview.candidate, 56, 16)}
                      <div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff" }}>{interview.candidate}</h3>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                          {interview.role}
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
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Date & Time</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{interview.date} · {interview.time}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Panel</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{interview.panel?.join(", ") || "TBD"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Mode</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{interview.mode || "In-Person"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Status</div>
                        <div style={{ marginTop: 2 }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isCompleted ? T.greenLight : "#FEF3C7",
                            color: isCompleted ? T.green : "#B45309",
                            padding: "4px 10px",
                            borderRadius: 99,
                            fontSize: 10,
                            fontWeight: 700
                          }}>
                            {isCompleted ? "✓ Completed" : "● Upcoming"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8, marginTop: 4 }}>
                      <div style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>Evaluations</div>
                      <div style={{ fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                        <span>{evaluations.length} submitted</span>
                        {totalScore !== null && <span style={{ fontWeight: 700, color: GOLD }}>Avg: {totalScore}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: 8, width: "100%", flexWrap: "wrap" }}>
                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          background: MAROON,
                          color: "#fff",
                          textDecoration: "none",
                          padding: "10px 16px",
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 13,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                          textAlign: "center"
                        }}
                      >
                        🔗 Join
                      </a>
                    )}
                    {(() => {
                      const evalCheck = canEvaluate(interview);
                      const alreadyEvaluated = interview.evaluations?.some((e: any) => e.panelist === currentUser);
                      const isAdmin = currentUser === "admin";

                      if (!evalCheck.allowed) {
                        return (
                          <button
                            disabled
                            title={evalCheck.reason}
                            style={{
                              flex: 1,
                              border: "none",
                              background: "rgba(255,255,255,0.15)",
                              color: "rgba(255,255,255,0.5)",
                              padding: "10px 16px",
                              borderRadius: 8,
                              cursor: "not-allowed",
                              fontWeight: 700,
                              fontSize: 12,
                              opacity: 0.6
                            }}
                          >
                            {evalCheck.reason ? (evalCheck.reason.includes("already") ? "Done" : "Lock") : "Disabled"}
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={() => openEval(interview)}
                          style={{
                            flex: 1,
                            border: "none",
                            background: GOLD,
                            color: "#fff",
                            padding: "10px 16px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 13,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
                          }}
                        >
                          ⭐ {alreadyEvaluated && isAdmin ? "Edit" : alreadyEvaluated ? "Evaluated" : "Evaluate"}
                        </button>
                      );
                    })()}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={cardKey}
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  border: `1px solid ${T.border}`,
                  boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
                  overflow: "hidden",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: undefined,
                  maxWidth: undefined,
                  height: undefined,
                  minHeight: undefined,
                  scrollSnapAlign: undefined,
                }}
              >
                {/* Card header */}
                <div style={{ padding: isMobile ? "20px 20px 18px" : "24px 26px 20px", background: T.surface }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 14, minWidth: 0 }}>
                      {avatar(interview.candidate)}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: T.ink, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {interview.candidate}
                        </div>
                        <div style={{ fontSize: 13, color: T.inkMid, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {interview.role}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                          <span style={{ background: T.primaryLight, color: MAROON, borderRadius: 999, fontWeight: 700, fontSize: 10, padding: "6px 12px" }}>
                            Round {interview.round || 1}
                          </span>
                          <span style={{ background: interview.mode === "Online" ? T.skyLight : T.tealLight, color: interview.mode === "Online" ? T.sky : T.teal, borderRadius: 999, fontWeight: 700, fontSize: 10, padding: "6px 12px" }}>
                            {interview.mode === "Online" ? "💻 Online" : "🏢 In-Person"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, minWidth: 130 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: isCompleted ? T.greenLight : "#FEF3C7", color: isCompleted ? T.green : "#B45309", padding: "8px 18px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `1px solid ${isCompleted ? T.green + "44" : "#FDE68A"}` }}>
                        {isCompleted ? "✓ Completed" : "● Upcoming"}
                      </span>
                      {totalScore !== null && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: T.canvas, borderRadius: 999, padding: "10px 14px", border: `1px solid ${T.border}` }}>
                          <span style={{ fontSize: 11, color: T.inkFaint, fontWeight: 700 }}>Score</span>
                          <ScoreCircle score={totalScore} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "16px 18px 14px", display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                  {[
                    { icon: "📅", label: "Date & Time", value: `${interview.date} · ${interview.time}` },
                    { icon: "👥", label: "Panel", value: interview.panel?.join(", ") || "TBD" },
                    { icon: "🔗", label: "Mode", value: interview.meetingLink ? "Meeting link available" : (interview.mode || "In-Person") },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={{ background: T.canvas, borderRadius: 16, padding: "14px 16px", border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                        {icon} {label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.ink, lineHeight: 1.5 }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {currentUser === "admin" && !isMobile && (
                  <div style={{ padding: "16px 20px", background: T.canvas, borderTop: `1px solid ${T.border}`, borderBottom: evaluations.length > 0 ? `1px solid ${T.border}` : undefined }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                      📊 Evaluation status
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {(interview.panel || []).length > 0 ? (
                        (interview.panel || []).map((panelistName: string) => {
                          const hasEvaluated = interview.evaluations?.some((e: any) => e.panelist === panelistName);
                          return (
                            <div key={panelistName} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 999, background: hasEvaluated ? T.greenLight : "#FEF3C7", color: hasEvaluated ? T.green : "#B45309", fontSize: 11, fontWeight: 700, border: `1px solid ${hasEvaluated ? T.green + "33" : "#FDE68A"}` }}>
                              <span>{hasEvaluated ? "✓" : "○"}</span>
                              <span>{panelistName}</span>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ fontSize: 11, color: T.inkFaint }}>No panel assigned</div>
                      )}
                    </div>
                  </div>
                )}
                {isMobile && evaluations.length > 0 && (
                  <div style={{ padding: "12px 18px", background: T.canvas, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, fontSize: 12, color: T.inkMid }}>
                    <span>{evaluations.length} evaluation{evaluations.length !== 1 ? "s" : ""}</span>
                    {totalScore !== null && <span style={{ fontWeight: 700, color: T.ink }}>Avg {totalScore}</span>}
                  </div>
                )}

                {/* ── Scorecards section ────────────────────────── */}
                <div style={{ borderBottom: evaluations.length > 0 ? `1px solid ${T.border}` : undefined }}>
                  {evaluations.length > 0 && !isMobile && (
                    <button
                      onClick={() => toggleExpand(cardKey)}
                      style={{ width: "100%", background: "none", border: "none", borderBottom: `1px solid ${T.border}`, padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", color: T.inkMid, fontSize: 12, fontWeight: 700 }}
                    >
                      <span>📋 Scorecards ({evaluations.length} evaluation{evaluations.length !== 1 ? "s" : ""})</span>
                      <span style={{ fontSize: 14, transition: "transform 0.2s", display: "inline-block", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                    </button>
                  )}

                  {isExpanded && evaluations.length > 0 && !isMobile && (
                    <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                      {evaluations.map((ev, idx) => {
                        const evScore = computeScore(ev.scores);
                        const recStyle = REC_COLORS[ev.recommendation] || { bg: T.canvas, color: T.inkMid };
                        return (
                          <div
                            key={idx}
                            style={{ background: T.canvas, borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}
                          >
                            {/* Evaluator header */}
                            <div style={{ padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: T.primaryLight, borderBottom: `1px solid ${T.border}` }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: MAROON, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                                  {ev.panelist.split(" ").map((n: string) => n[0]).join("")}
                                </div>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 800, color: MAROON }}>{ev.panelist}</div>
                                  <div style={{ fontSize: 10, color: T.inkFaint }}>{new Date(ev.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "3px 10px", background: recStyle.bg, color: recStyle.color, border: `1px solid ${recStyle.color}33` }}>
                                  {ev.recommendation}
                                </span>
                                {evScore !== null && <ScoreCircle score={evScore} />}
                              </div>
                            </div>

                            {/* Scores grid */}
                            <div style={{ padding: "12px 16px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "8px 20px", marginBottom: ev.notes ? 12 : 0 }}>
                                {Object.entries(ev.scores).map(([field, val]) => (
                                  <div key={field} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 12, color: T.inkMid, fontWeight: 600, minWidth: 0, flex: 1 }}>{field}</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <ScoreDots value={val as number} />
                                      <span style={{ fontSize: 11, fontWeight: 700, color: T.inkLight, minWidth: 14, textAlign: "right" }}>{val as number}/5</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {ev.notes && (
                                <div style={{ marginTop: 8, padding: "8px 12px", background: "#fff", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 12, color: T.inkMid, fontStyle: "italic", lineHeight: 1.5 }}>
                                  "{ev.notes}"
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Overall score summary bar */}
                      {totalScore !== null && evaluations.length > 1 && (
                        <div style={{ marginTop: 4, padding: "12px 16px", background: totalScore >= 80 ? T.greenLight : totalScore >= 60 ? T.accentLight : T.redLight, borderRadius: 12, border: `1px solid ${totalScore >= 80 ? T.green + "44" : totalScore >= 60 ? T.accentDark + "33" : T.red + "44"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: T.ink }}>Overall Score</div>
                            <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 1 }}>Average of {evaluations.length} evaluations</div>
                          </div>
                          <ScoreCircle score={totalScore} />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Action buttons ──────────────────────────────── */}
                <div style={{ padding: "14px 24px", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ background: MAROON, color: "#fff", textDecoration: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      🔗 Join Interview
                    </a>
                  )}
                  {(() => {
                    const evalCheck = canEvaluate(interview);
                    const alreadyEvaluated = interview.evaluations?.some((e: any) => e.panelist === currentUser);
                    const isAdmin = currentUser === "admin";

                    if (!evalCheck.allowed) {
                      return (
                        <button
                          disabled
                          title={evalCheck.reason}
                          style={{ border: "none", background: "#E5E7EB", color: "#9CA3AF", padding: "10px 20px", borderRadius: 10, cursor: "not-allowed", fontWeight: 700, fontSize: 13, opacity: 0.6 }}
                        >
                          ⭐ {evalCheck.reason}
                        </button>
                      );
                    }

                    return (
                      <button
                        onClick={() => openEval(interview)}
                        style={{ border: "none", background: GOLD, color: "#fff", padding: "10px 20px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13 }}
                      >
                        ⭐ {alreadyEvaluated && isAdmin ? "Edit Evaluation" : alreadyEvaluated ? "Already Evaluated" : "Evaluate Candidate"}
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Evaluation Modal ─────────────────────────────────────────────────── */}
      {selectedInterview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.52)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 880, maxHeight: "92vh", overflowY: "auto", background: "#faf8f5", borderRadius: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>

            {/* Modal header */}
            <div style={{ background: MAROON, color: "#fff", padding: "22px 26px", borderRadius: "20px 20px 0 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>
                  {currentUser === "admin" && evaluatorName && evaluatorName !== "__custom" ? "Edit Panelist Evaluation" : "Candidate Evaluation"}
                </h2>
                <div style={{ marginTop: 4, opacity: 0.85, fontSize: 14 }}>
                  {selectedInterview.candidate} · {selectedInterview.role} · Round {selectedInterview.round || 1}
                  {currentUser !== "admin" && <span style={{ marginLeft: 8, opacity: 0.7 }}>| Your evaluation</span>}
                </div>
              </div>
              <button onClick={() => setSelectedInterview(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: isMobile ? 18 : 26 }}>

              {/* Evaluator name */}
              <div style={{ marginBottom: 24, padding: "14px 16px", background: T.primaryLight, borderRadius: 12, border: `1px solid ${MAROON}22` }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 8, fontSize: 12, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Evaluating as <span style={{ color: T.red }}>*</span>
                </label>
                {currentUser === "admin" ? (
                  // Admin can select only assigned panelists
                  <select
                    value={evaluatorName}
                    onChange={(e) => setEvaluatorName(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, fontWeight: 600, color: T.ink, background: "#fff" }}
                  >
                    <option value="">— Select assigned panelist —</option>
                    {panelists
                      .filter((p: any) => selectedInterview?.panel?.includes(p.name))
                      .map((p: any) => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    <option value="__custom">Other (type below)</option>
                  </select>
                ) : (
                  // Regular panelist - locked to their name
                  <div style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, fontWeight: 600, color: T.ink, background: T.canvas }}>
                    {currentUser}
                  </div>
                )}
                {(currentUser === "admin" && evaluatorName === "__custom") && (
                  <input
                    placeholder="Type panelist name..."
                    value={evaluatorName === "__custom" ? "" : evaluatorName}
                    onChange={(e) => setEvaluatorName(e.target.value)}
                    style={{ width: "100%", marginTop: 8, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 14, color: T.ink, background: "#fff", boxSizing: "border-box" }}
                  />
                )}
              </div>

              {/* Scorecard */}
              <div style={{ fontSize: 12, fontWeight: 700, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>Evaluation Scorecard</div>
              {[...DEFAULT_FIELDS, ...customFields].map((field) => (
                <div key={field} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: T.ink }}>{field}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: scores[field] ? MAROON : T.inkFaint }}>{scores[field] ? `${scores[field]}/5` : "—"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateScore(field, n)}
                        style={{
                          flex: 1, height: 44, borderRadius: 10, border: "none", cursor: "pointer",
                          fontWeight: 800, fontSize: 16, transition: "all 0.15s",
                          background: (scores[field] || 0) >= n ? MAROON : "#F1F5F9",
                          color: (scores[field] || 0) >= n ? "#fff" : T.inkMid,
                          boxShadow: (scores[field] || 0) >= n ? `0 4px 12px ${MAROON}44` : "none",
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Score preview */}
              {Object.keys(scores).length > 0 && (
                <div style={{ margin: "16px 0", padding: "12px 16px", background: T.primaryLight, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid ${MAROON}22` }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>Your Score Preview</span>
                  <ScoreCircle score={computeScore(scores) ?? 0} />
                </div>
              )}

              <hr style={{ margin: "20px 0", borderColor: T.border, borderStyle: "solid", borderWidth: "1px 0 0 0" }} />

              {/* Custom field */}
              <div style={{ fontSize: 12, fontWeight: 700, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Add Custom Field</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
                <input
                  value={newField}
                  onChange={(e) => setNewField(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomField()}
                  placeholder="e.g. Leadership, Punctuality..."
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.ink, background: "#fff" }}
                />
                <button onClick={addCustomField} style={{ background: MAROON, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, cursor: "pointer", fontWeight: 700 }}>
                  Add
                </button>
              </div>

              {/* Recommendation */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 8, fontSize: 12, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Recommendation</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Strong Hire", "Hire", "Hold", "Reject"].map((r) => {
                    const rc = REC_COLORS[r];
                    const isActive = recommendation === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setRecommendation(r)}
                        style={{
                          padding: "8px 16px", borderRadius: 99, cursor: "pointer", fontWeight: 700, fontSize: 13, border: "none", transition: "all 0.15s",
                          background: isActive ? rc.color : T.canvas,
                          color: isActive ? "#fff" : T.inkMid,
                          boxShadow: isActive ? `0 4px 12px ${rc.color}55` : "none",
                        }}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 8, fontSize: 12, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>Interview Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${T.border}`, fontSize: 13, color: T.ink, background: "#fff", resize: "vertical", boxSizing: "border-box" }}
                  placeholder="Enter detailed feedback about the candidate..."
                />
              </div>

              {/* Footer buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setSelectedInterview(null)} style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${T.border}`, cursor: "pointer", fontWeight: 600, background: "#fff", color: T.inkMid, fontSize: 13 }}>
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  style={{ background: MAROON, color: "#fff", border: "none", padding: "10px 26px", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, boxShadow: `0 4px 14px ${MAROON}44` }}
                >
                  Submit Evaluation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}