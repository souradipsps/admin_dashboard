import React, { useState, useRef } from "react";
import { T, font } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint, useHorizontalScroll } from "../hooks";
import { Card, SectionTitle, Badge, Btn, Modal, ModalHeader, FormField, Select, Input } from "../components/ui";

const TIME_OPTIONS = [
  { value: "9:00 AM", label: "9:00 AM" },
  { value: "10:00 AM", label: "10:00 AM" },
  { value: "11:00 AM", label: "11:00 AM" },
  { value: "12:00 PM", label: "12:00 PM" },
  { value: "2:00 PM", label: "2:00 PM" },
  { value: "3:00 PM", label: "3:00 PM" },
  { value: "4:00 PM", label: "4:00 PM" },
];

const MODE_OPTIONS = [
  { value: "In-Person", label: "In-Person" },
  { value: "Online", label: "Online" },
];

interface ScoreState {
  [criteria: string]: number;
}

const getRoundOrdinal = (round: number) => {
  if (round === 1) return "1st Round";
  if (round === 2) return "2nd Round";
  if (round === 3) return "3rd Round";
  return `${round}th Round`;
};

export default function InterviewPanel({
  jobApplications = [],
  generalApplications = [],
  jobPostings = [],
  interviews = [],
  setInterviews,
  panelists = [],
  setPanelists,
  onGiveOffer,
}: {
  jobApplications?: any[];
  generalApplications?: any[];
  jobPostings?: any[];
  interviews?: any[];
  setInterviews?: React.Dispatch<React.SetStateAction<any[]>>;
  panelists?: any[];
  setPanelists?: React.Dispatch<React.SetStateAction<any[]>>;
  onGiveOffer?: (candidate: any) => void;
}) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [search, setSearch] = useState("");
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);
  const [roundFilter, setRoundFilter] = useState<number | null>(1);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [evalInterview, setEvalInterview] = useState<any>(null);
  const [inlineEvalKey, setInlineEvalKey] = useState<string | null>(null);
  const [scores, setScores] = useState<ScoreState>({});
  const [recommendation, setRecommendation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingCandidate, setSchedulingCandidate] = useState<any>(null);
  const [assigningCandidate, setAssigningCandidate] = useState<any>(null);
  const [selectedAppDetail, setSelectedAppDetail] = useState<any>(null);
  const [showAddPanelistModal, setShowAddPanelistModal] = useState(false);
  const [reminderCandidate, setReminderCandidate] = useState<any>(null);

  // Form validations for Add Panelist
  const [panelistErrors, setPanelistErrors] = useState({ name: "", email: "", phone: "" });

  const validateName = (name: string) => {
    if (!name.trim()) return "Full Name is required.";
    if (name.trim().length < 2) return "Full Name must be at least 2 characters.";
    if (!/^[a-zA-Z\s.\-]+$/.test(name)) return "Full Name can only contain letters, spaces, dots, and hyphens.";
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return "Email address is required.";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return "Please enter a valid email address.";
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required.";
    if (!/^\+?[0-9\s.\-()]+$/.test(phone)) return "Phone number contains invalid characters.";
    const digits = phone.replace(/[^0-9]/g, "");
    if (digits.length < 10) return "Phone number must have at least 10 digits.";
    if (digits.length > 15) return "Phone number cannot exceed 15 digits.";
    return "";
  };

  const handleNameChange = (val: string) => {
    setNewPanelistName(val);
    setPanelistErrors((prev) => ({ ...prev, name: validateName(val) }));
  };

  const handleEmailChange = (val: string) => {
    setNewPanelistEmail(val);
    setPanelistErrors((prev) => ({ ...prev, email: validateEmail(val) }));
  };

  const handlePhoneChange = (val: string) => {
    setNewPanelistPhone(val);
    setPanelistErrors((prev) => ({ ...prev, phone: validatePhone(val) }));
  };

  const closeAddPanelistModal = () => {
    setShowAddPanelistModal(false);
    setNewPanelistName("");
    setNewPanelistEmail("");
    setNewPanelistPhone("");
    setPanelistErrors({ name: "", email: "", phone: "" });
  };

  // Track the current active round view override per candidate (key: name-role)
  const [activeRoundOverrides, setActiveRoundOverrides] = useState<Record<string, number>>({});
  const [selectedCandidateKeys, setSelectedCandidateKeys] = useState<string[]>([]);

  const candidateKey = (c: any) => `${c.name}-${c.role}`;

  // Form for Schedule Modal
  const [scheduleForm, setScheduleForm] = useState({
    date: "",
    time: "",
    mode: "In-Person",
    meetingLink: "",
  });

  // Form for Add Panelist
  const [newPanelistName, setNewPanelistName] = useState("");
  const [newPanelistEmail, setNewPanelistEmail] = useState("");
  const [newPanelistPhone, setNewPanelistPhone] = useState("");

  const [filterActiveIndex, setFilterActiveIndex] = useState(0);
  const hScroll = useHorizontalScroll();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const criteria = ["Subject Knowledge", "Communication Skills", "Demo Class / Task", "Classroom Management"];

  // Filter out candidates from Applications where status === "Shortlisted"
  const shortlistedCandidates = [
    ...jobApplications
      .filter((a) => a.status === "Shortlisted")
      .map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone || "",
        role: a.role,
        jobPostingId: a.jobPostingId,
        
        exp: a.exp,
        qualification: a.qualification || "—",
        applied: a.applied,
        sourceType: "job" as const,
      })),
    ...generalApplications
      .filter((a) => a.status === "Shortlisted")
      .map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone || "",
        role: a.preferredRole || "General",
        jobPostingId: null,
        referredBy: "None",
        exp: a.exp,
        qualification: a.qualification || "—",
        applied: a.applied,
        sourceType: "general" as const,
      })),
  ];

  // Get active round for candidate, defaulting to highest scheduled round or 1
  const getCandidateActiveRound = (name: string, role: string) => {
    const override = activeRoundOverrides[`${name}-${role}`];
    if (override !== undefined) return override;

    const candInts = interviews.filter((i) => i.candidate === name && i.role === role);
    if (candInts.length > 0) {
      return Math.max(...candInts.map((i) => i.round || 1));
    }
    return 1;
  };

  // Resolve interview details specifically for the candidate's active round
  const candidatesWithInterviews = shortlistedCandidates.map((c) => {
    const activeRound = getCandidateActiveRound(c.name, c.role);
    const interview = interviews.find(
      (i) => i.candidate === c.name && i.role === c.role && i.round === activeRound
    ) || {
      id: `INT-${c.id}-${activeRound}`,
      candidate: c.name,
      role: c.role,
      date: "",
      time: "",
      panel: [],
      score: null,
      rec: "—",
      status: "Pending",
      mode: "In-Person",
      meetingLink: "",
      round: activeRound,
    };
    return {
      ...c,
      activeRound,
      interview,
    };
  });

  // Enrich job postings with shortlisted candidate counts for the carousel
  const enrichedPostings = jobPostings.map((p) => {
    const count = shortlistedCandidates.filter((c) => c.jobPostingId === p.id || c.role === p.role).length;
    return {
      ...p,
      count,
    };
  });

  const selectedRole = enrichedPostings.find((p) => p.id === selectedPostingId)?.role ?? null;

  // Candidates after job filter (before round filter) — used to compute available rounds
  const jobFilteredCandidates = candidatesWithInterviews.filter((c) => {
    if (selectedPostingId) {
      return c.jobPostingId === selectedPostingId || c.role === selectedRole;
    }
    return true;
  });

  // All rounds up to the max active round
  const maxRound = jobFilteredCandidates.length > 0 ? Math.max(...jobFilteredCandidates.map((c) => c.activeRound)) : 0;
  const availableRounds = Array.from({ length: maxRound }, (_, i) => i + 1);

  const filteredCandidates = jobFilteredCandidates
    .filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase());

      const matchesRound = roundFilter === null || c.activeRound >= roundFilter;

      return matchesSearch && matchesRound;
    })
    .map((c) => {
      if (roundFilter !== null && c.activeRound > roundFilter) {
        const interview = interviews.find(
          (i) => i.candidate === c.name && i.role === c.role && i.round === roundFilter
        ) || {
          id: `INT-${c.id}-${roundFilter}`,
          candidate: c.name,
          role: c.role,
          date: "",
          time: "",
          panel: [],
          score: null,
          rec: "—",
          status: "Pending",
          mode: "In-Person",
          meetingLink: "",
          round: roundFilter,
        };
        return {
          ...c,
          displayRound: roundFilter,
          interview,
        };
      }
      return { ...c, displayRound: c.activeRound };
    });

  const selectableCandidates = filteredCandidates.filter((c) => c.displayRound === c.activeRound);

  const isAllSelected =
    selectableCandidates.length > 0 &&
    selectableCandidates.every((c) => selectedCandidateKeys.includes(candidateKey(c)));

  const toggleSelectCandidate = (c: any) => {
    if (c.displayRound < c.activeRound) return; // ignore toggling for disabled/previous rounds
    const key = candidateKey(c);
    setSelectedCandidateKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const selectableKeys = selectableCandidates.map(candidateKey);
      setSelectedCandidateKeys((prev) => prev.filter((k) => !selectableKeys.includes(k)));
    } else {
      const selectableKeys = selectableCandidates.map(candidateKey);
      setSelectedCandidateKeys((prev) => {
        const next = [...prev];
        selectableKeys.forEach((k) => {
          if (!next.includes(k)) next.push(k);
        });
        return next;
      });
    }
  };

  const handleAdvanceSelectedRounds = () => {
    if (selectedCandidateKeys.length === 0) {
      alert("Select at least one candidate to advance their round.");
      return;
    }
    setActiveRoundOverrides((prev) => {
      const next = { ...prev };
      selectableCandidates.forEach((c) => {
        const key = candidateKey(c);
        if (selectedCandidateKeys.includes(key)) {
          next[key] = Math.min(10, c.activeRound + 1);
        }
      });
      return next;
    });
    setSelectedCandidateKeys([]);
  };

  const handleIncrementCandidateRound = (c: any, currentRound: number) => {
    const newRound = Math.min(10, currentRound + 1);
    setActiveRoundOverrides((prev) => ({
      ...prev,
      [`${c.name}-${c.role}`]: newRound,
    }));
  };

  const handleDecrementCandidateRound = (c: any, currentRound: number) => {
    const newRound = Math.max(1, currentRound - 1);
    setActiveRoundOverrides((prev) => ({
      ...prev,
      [`${c.name}-${c.role}`]: newRound,
    }));
  };

  const handleAddPanelist = (e: React.FormEvent) => {
    e.preventDefault();
    const nameErr = validateName(newPanelistName);
    const emailErr = validateEmail(newPanelistEmail);
    const phoneErr = validatePhone(newPanelistPhone);

    if (nameErr || emailErr || phoneErr) {
      setPanelistErrors({ name: nameErr, email: emailErr, phone: phoneErr });
      return;
    }

    if (!setPanelists) return;
    setPanelists((prev) => [
      ...prev,
      { name: newPanelistName.trim(), email: newPanelistEmail.trim(), phone: newPanelistPhone.trim() },
    ]);
    setNewPanelistName("");
    setNewPanelistEmail("");
    setNewPanelistPhone("");
    setPanelistErrors({ name: "", email: "", phone: "" });
    setShowAddPanelistModal(false);
  };

  const handleGiveOffer = (c: any) => {
    if (onGiveOffer) {
      onGiveOffer(c);
    }
  };

  const handleOpenSchedule = (candidate: any) => {
    setSchedulingCandidate(candidate);
    const inv = candidate.interview;
    setScheduleForm({
      date: inv.date || "",
      time: inv.time || "",
      mode: inv.mode || "In-Person",
      meetingLink: inv.meetingLink || "",
    });
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = () => {
    if (!scheduleForm.date || !scheduleForm.time) {
      alert("Please select date and time.");
      return;
    }
    if (scheduleForm.mode === "Online" && !scheduleForm.meetingLink) {
      alert("Please provide a meeting link for online interviews.");
      return;
    }
    if (!setInterviews || !schedulingCandidate) return;

    setInterviews((prev) => {
      const existingPanel = schedulingCandidate?.interview?.panel || [];

      const exists = prev.some(
        (i) =>
          i.candidate === schedulingCandidate.name &&
          i.role === schedulingCandidate.role &&
          i.round === schedulingCandidate.activeRound
      );
      if (exists) {
        return prev.map((i) =>
          i.candidate === schedulingCandidate.name &&
            i.role === schedulingCandidate.role &&
            i.round === schedulingCandidate.activeRound
            ? {
              ...i,
              date: scheduleForm.date,
              time: scheduleForm.time,
              mode: scheduleForm.mode,
              meetingLink: scheduleForm.mode === "Online" ? scheduleForm.meetingLink : "",
              panel: existingPanel,
            }
            : i
        );
      } else {
        return [
          ...prev,
          {
            id: `INT-${schedulingCandidate.id}-${schedulingCandidate.activeRound}`,
            candidate: schedulingCandidate.name,
            role: schedulingCandidate.role,
            date: scheduleForm.date,
            time: scheduleForm.time,
            panel: [],
            score: null,
            rec: "—",
            status: "Pending",
            mode: scheduleForm.mode,
            meetingLink: scheduleForm.mode === "Online" ? scheduleForm.meetingLink : "",
            round: schedulingCandidate.activeRound,
          },
        ];
      }
    });

    setShowScheduleModal(false);
    setSchedulingCandidate(null);
  };

  const handleTogglePanelistForCandidate = (panelistName: string) => {
    if (!assigningCandidate || !setInterviews) return;
    setInterviews((prev) => {
      const exists = prev.some(
        (i) =>
          i.candidate === assigningCandidate.name &&
          i.role === assigningCandidate.role &&
          i.round === assigningCandidate.activeRound
      );
      let updatedList = [];
      if (exists) {
        updatedList = prev.map((i) => {
          if (
            i.candidate === assigningCandidate.name &&
            i.role === assigningCandidate.role &&
            i.round === assigningCandidate.activeRound
          ) {
            const panel = i.panel || [];
            const newPanel = panel.includes(panelistName)
              ? panel.filter((p: string) => p !== panelistName)
              : [...panel, panelistName];
            return { ...i, panel: newPanel };
          }
          return i;
        });
      } else {
        updatedList = [
          ...prev,
          {
            id: `INT-${assigningCandidate.id}-${assigningCandidate.activeRound}`,
            candidate: assigningCandidate.name,
            role: assigningCandidate.role,
            date: "",
            time: "",
            panel: [panelistName],
            score: null,
            rec: "—",
            status: "Pending",
            mode: "In-Person",
            meetingLink: "",
            round: assigningCandidate.activeRound,
          },
        ];
      }
      const updatedCand = updatedList.find(
        (i) =>
          i.candidate === assigningCandidate.name &&
          i.role === assigningCandidate.role &&
          i.round === assigningCandidate.activeRound
      );
      setAssigningCandidate((prevCand: any) => ({
        ...prevCand,
        interview: { ...prevCand.interview, panel: updatedCand?.panel || [] },
      }));
      return updatedList;
    });
  };

  const submitEvaluation = () => {
    if (!recommendation) {
      alert("Please select a recommendation.");
      return;
    }
    if (!setInterviews || !evalInterview) return;

    const scoreValues = Object.values(scores);
    const avgScore = scoreValues.length > 0 ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 20) : null;

    setInterviews((prev) => {
      const exists = prev.some(
        (i) =>
          i.candidate === evalInterview.candidate &&
          i.role === evalInterview.role &&
          i.round === evalInterview.round
      );
      if (exists) {
        return prev.map((i) =>
          i.candidate === evalInterview.candidate &&
            i.role === evalInterview.role &&
            i.round === evalInterview.round
            ? { ...i, score: avgScore, rec: recommendation, status: "Completed", remarks }
            : i
        );
      } else {
        return [
          ...prev,
          {
            id: evalInterview.id || `INT-${Date.now()}`,
            candidate: evalInterview.candidate,
            role: evalInterview.role,
            date: evalInterview.date || "",
            time: evalInterview.time || "",
            panel: evalInterview.panel || [],
            score: avgScore,
            rec: recommendation,
            status: "Completed",
            mode: evalInterview.mode || "In-Person",
            meetingLink: evalInterview.meetingLink || "",
            round: evalInterview.round,
            remarks,
          },
        ];
      }
    });

    setEvalInterview(null);
    setScores({});
    setRecommendation("");
    setRemarks("");
  };

  const scrollCarousel = (dir: "left" | "right") => {
    if (hScroll.ref.current) {
      hScroll.ref.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  const selectPosting = (id: string | null) => {
    setSelectedPostingId((prev) => (prev === id ? null : id));
    setSearch("");
    setRoundFilter(1); // reset round filter when job changes
  };

  const avatar = (name: string, size = 32, fontSize = 12) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: T.primaryLight,
        color: T.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {name.split(" ").map((n: string) => n[0]).join("")}
    </div>
  );

  const actionBtnStyle = (variant: "primary" | "secondary" | "success" | "amber" | "reschedule", disabled = false) => ({
    border: "none",
    background: disabled
      ? T.border
      : variant === "primary"
        ? T.primaryLight
        : variant === "success"
          ? T.greenLight
          : variant === "amber"
            ? T.accentLight
            : variant === "reschedule"
              ? "#FFF3E0"
              : T.skyLight,
    color: disabled
      ? T.inkFaint
      : variant === "primary"
        ? T.primary
        : variant === "success"
          ? T.green
          : variant === "amber"
            ? T.accentDark
            : variant === "reschedule"
              ? "#E65100"
              : T.sky,
    borderRadius: 8,
    padding: "5px 8px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 700 as const,
    fontSize: 10.5,
    whiteSpace: "nowrap" as const,
    opacity: disabled ? 0.6 : 1,
  });

  const modeCell = (mode: string) => {
    const isOnline = mode === "Online";
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          fontWeight: 700,
          background: isOnline ? T.skyLight : T.primaryLight,
          color: isOnline ? T.sky : T.primary,
          borderRadius: 99,
          padding: "3px 10px",
          border: `1px solid ${isOnline ? "#BAE6FD" : "#E8D0D8"}`,
        }}
      >
        {isOnline ? "💻" : "🏢"} {mode}
      </span>
    );
  };





  return (
    <div>
      <style>{`
        .btn-action-hover {
          transition: all 0.2s ease-in-out !important;
        }
        .btn-action-hover:hover {
          transform: translateY(-1.5px) scale(1.02);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
          filter: brightness(0.95);
        }
      `}</style>
      <SectionTitle
        title="Interview Panel"
        sub="Manage shortlisted candidates, schedule interviews, and assign panel members"
        action={
          <button
            onClick={() => setShowAddPanelistModal(true)}
            className="btn-action-hover"
            style={{
              background: T.primary,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: isMobile ? "8px 14px" : "9px 18px",
              fontSize: isMobile ? 12 : 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: `0 4px 12px ${T.primary}33`,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 15 }}>＋</span> Register Panelist
          </button>
        }
      />

      {/* Job filter carousel — sticky on mobile */}
      {enrichedPostings.length > 0 && (
        <div style={{
          marginBottom: 20,
          position: isMobile ? "sticky" : "relative",
          top: isMobile ? -16 : undefined,
          zIndex: isMobile ? 50 : undefined,
          background: isMobile ? T.canvas : undefined,
          paddingTop: isMobile ? 12 : undefined,
          paddingBottom: isMobile ? 4 : undefined,
          marginLeft: isMobile ? -12 : undefined,
          marginRight: isMobile ? -12 : undefined,
          paddingLeft: isMobile ? 12 : undefined,
          paddingRight: isMobile ? 12 : undefined,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMid }}>
              {selectedPostingId ? (
                <span>
                  Filtering by <span style={{ color: T.primary }}>{selectedRole}</span>
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
                <span style={{ color: T.inkFaint }}>Select a job to filter shortlisted candidates</span>
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
                    flexShrink: 0, width: "100%", scrollSnapAlign: "center",
                    border: `2px solid ${!selectedPostingId ? T.primary : T.border}`,
                    borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                    background: !selectedPostingId ? T.primaryLight : T.surface,
                    transition: "all 0.2s",
                    boxShadow: !selectedPostingId ? `0 4px 20px ${T.primary}22` : "0 1px 4px rgba(0,0,0,0.05)",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                      background: !selectedPostingId ? T.primary : "#E2E8F0",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, color: !selectedPostingId ? "#fff" : T.inkMid,
                      fontWeight: 800,
                    }}>◈</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: T.ink, lineHeight: 1.3 }}>All Shortlisted</div>
                      <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 2 }}>Universal Filter</div>
                    </div>
                    {!selectedPostingId && (
                      <div style={{ background: T.primary, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, gap: 8 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{
                        fontSize: 11, borderRadius: 99, padding: "3px 10px", fontWeight: 700,
                        background: !selectedPostingId ? "rgba(255,255,255,0.25)" : T.canvas,
                        color: !selectedPostingId ? T.primary : T.inkLight,
                        border: !selectedPostingId ? `1px solid rgba(255,255,255,0.3)` : `1px solid ${T.border}`,
                      }}>All Jobs</span>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: !selectedPostingId ? T.primary : T.ink }}>{shortlistedCandidates.length}</span>
                      <span style={{ fontSize: 10, color: T.inkFaint, display: "block", lineHeight: 1 }}>shortlisted</span>
                    </div>
                  </div>
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
                            background: p.type === "Full-time" ? T.primaryLight : T.tealLight,
                            color: p.type === "Full-time" ? T.primary : T.teal,
                          }}>{p.type}</span>
                        </div>
                        <div style={{ flexShrink: 0, textAlign: "right" }}>
                          <span style={{ fontSize: 18, fontWeight: 800, color: isSelected ? T.primary : T.ink }}>{p.count}</span>
                          <span style={{ fontSize: 10, color: T.inkFaint, display: "block", lineHeight: 1 }}>shortlisted</span>
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
                      background: filterActiveIndex === i ? T.primary : T.border,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            /* ── DESKTOP: premium inertia + drag carousel ── */
            <div style={{ position: "relative" }}>
              {/* Left fade */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 8, width: 40, zIndex: 2,
                background: `linear-gradient(to right, ${T.canvas}, transparent)`,
                pointerEvents: "none",
              }} />
              {/* Right fade */}
              <div style={{
                position: "absolute", right: 0, top: 0, bottom: 8, width: 40, zIndex: 2,
                background: `linear-gradient(to left, ${T.canvas}, transparent)`,
                pointerEvents: "none",
              }} />
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
                  flexShrink: 0, width: 200,
                  border: `2px solid ${!selectedPostingId ? T.primary : T.border}`,
                  borderRadius: 14, padding: "16px 18px", cursor: "pointer",
                  background: !selectedPostingId ? T.primaryLight : T.surface,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 8, transition: "all 0.15s", minHeight: 140,
                }}
              >
                <div style={{ fontSize: 24, opacity: 0.5 }}>◈</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: !selectedPostingId ? T.primary : T.ink, textAlign: "center" }}>All Shortlisted</div>
                <div style={{ fontSize: 11, color: T.inkFaint, textAlign: "center" }}>{shortlistedCandidates.length} candidates</div>
              </div>

              {enrichedPostings.map((p) => {
                const isSelected = selectedPostingId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => selectPosting(p.id)}
                    style={{
                      flexShrink: 0, width: 280,
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
                        <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "2px 7px", background: p.type === "Full-time" ? T.primaryLight : T.tealLight, color: p.type === "Full-time" ? T.primary : T.teal }}>{p.type}</span>
                      </div>
                      <div style={{ fontSize: 11, color: T.inkLight }}>{p.channel} Posting</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: T.inkMid }}><strong>{p.count}</strong> shortlisted</span>
                      {isSelected && <span style={{ fontSize: 10, fontWeight: 700, background: T.primary, color: "#fff", borderRadius: 99, padding: "2px 8px" }}>Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          )}
        </div>
      )}

      {/* Round Filter Pills — shown below carousel, depends on selected job */}
      {availableRounds.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 2 }}>Round:</span>
          {availableRounds.map((rnd) => {
            const count = jobFilteredCandidates.filter((c) => c.activeRound >= rnd).length;
            const isActive = roundFilter === rnd;
            return (
              <button
                key={rnd}
                onClick={() => setRoundFilter(rnd)}
                style={{
                  background: isActive ? T.primary : T.white,
                  color: isActive ? "#fff" : T.ink,
                  border: `1.5px solid ${isActive ? T.primary : T.border}`,
                  borderRadius: 999,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {getRoundOrdinal(rnd)}
                <span
                  style={{
                    background: isActive ? "rgba(255,255,255,0.25)" : T.primaryLight,
                    color: isActive ? "#fff" : T.primary,
                    borderRadius: 99,
                    padding: "1px 7px",
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main candidate list board */}
      {isMobile ? (
        /* ── MOBILE: one candidate at a time snap carousel ── */
        <div style={{ marginBottom: 4 }}>
          {/* Selection actions */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <button
              onClick={toggleSelectAll}
              style={{
                background: T.surface,
                border: `1.5px solid ${T.border}`,
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                color: T.ink,
                cursor: "pointer",
              }}
            >
              {isAllSelected ? "Clear selection" : "Select all"}
            </button>
            <button
              onClick={handleAdvanceSelectedRounds}
              disabled={selectedCandidateKeys.length === 0}
              style={{
                background: selectedCandidateKeys.length === 0 ? T.border : T.primary,
                color: selectedCandidateKeys.length === 0 ? T.inkFaint : "#fff",
                border: "none",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: selectedCandidateKeys.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              Advance Round
            </button>
            <span style={{ fontSize: 12, color: T.inkFaint, whiteSpace: "nowrap" }}>
              {selectedCandidateKeys.length} selected
            </span>
          </div>
          {/* Search bar */}
          <div style={{ marginBottom: 12 }}>
            <Input
              placeholder="Search candidate name, role, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredCandidates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: T.inkFaint, fontSize: 14 }}>
              No candidates found
            </div>
          ) : (
            <>
              {/* Candidate count */}
              <div style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, marginBottom: 8, textAlign: "center" }}>
                {filteredCandidates.length} shortlisted candidate{filteredCandidates.length !== 1 ? "s" : ""}
              </div>

              {/* Snap scroll container */}
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
                {filteredCandidates.map((c, idx) => {
                  const i = c.interview;
                  const rnd = c.displayRound;
                  const isScheduled = !!i.date;
                  const isPreviousRound = c.displayRound < c.activeRound;
                  const cardBackground = "linear-gradient(135deg, #72102a 0%, #3a0010 100%)";
                  return (
                    <div
                      key={`${c.name}-${c.role}-${rnd}`}
                      style={{
                        flexShrink: 0,
                        minWidth: "calc(100% - 32px)",
                        scrollSnapAlign: "center",
                        background: cardBackground,
                        color: "#fff",
                        borderRadius: 20,
                        padding: 24,
                        position: "relative",
                        boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
                        minHeight: 460,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Pagination counter */}
                      <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}>
                        {idx + 1} of {filteredCandidates.length}
                      </div>

                      <div>
                        {/* Card header — candidate info */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedAppDetail(c)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCandidateKeys.includes(candidateKey(c))}
                            disabled={isPreviousRound}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectCandidate(c);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: 18, height: 18,
                              cursor: isPreviousRound ? "not-allowed" : "pointer",
                              flexShrink: 0,
                            }}
                          />
                          {avatar(c.name, 48, 16)}
                          <div style={{ flex: 1, minWidth: 0, paddingRight: 64 }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{c.role}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{c.email}</div>
                          </div>
                        </div>
                      </div>

                      {/* Details (Glassmorphic) */}
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
                        {/* Round stepper + status row */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid rgba(255,255,255,0.1)`, paddingBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Round</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDecrementCandidateRound(c, rnd); }}
                                disabled={rnd <= 1 || isPreviousRound}
                                style={{
                                  width: 24, height: 24, borderRadius: 6, border: "none",
                                  background: (rnd <= 1 || isPreviousRound) ? "rgba(255,255,255,0.05)" : "#fff",
                                  color: (rnd <= 1 || isPreviousRound) ? "rgba(255,255,255,0.3)" : "#72102a",
                                  cursor: (rnd <= 1 || isPreviousRound) ? "not-allowed" : "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: "bold",
                                }}
                              >−</button>
                              <span style={{
                                fontSize: 13, fontWeight: 800, color: "#fff",
                                background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "3px 10px",
                                minWidth: 70, textAlign: "center",
                              }}>
                                {getRoundOrdinal(rnd)}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleIncrementCandidateRound(c, rnd); }}
                                disabled={rnd >= 10 || isPreviousRound}
                                style={{
                                  width: 24, height: 24, borderRadius: 6, border: "none",
                                  background: (rnd >= 10 || isPreviousRound) ? "rgba(255,255,255,0.05)" : "#fff",
                                  color: (rnd >= 10 || isPreviousRound) ? "rgba(255,255,255,0.3)" : "#72102a",
                                  cursor: (rnd >= 10 || isPreviousRound) ? "not-allowed" : "pointer",
                                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: "bold",
                                }}
                              >+</button>
                            </div>
                          </div>

                          <div style={{
                            fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "4px 10px",
                            background: i.status === "Completed" ? "rgba(16, 185, 129, 0.2)" : isScheduled ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.08)",
                            color: i.status === "Completed" ? "#34D399" : isScheduled ? "#FBBF24" : "rgba(255,255,255,0.7)",
                            border: `1px solid ${i.status === "Completed" ? "rgba(16, 185, 129, 0.3)" : isScheduled ? "rgba(245, 158, 11, 0.3)" : "rgba(255,255,255,0.15)"}`,
                          }}>
                            {i.status === "Completed" ? "✓ Done" : isScheduled ? "● Scheduled" : "○ Pending"}
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date & Time</span>
                          {isScheduled ? (
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                              {i.date} · {i.time}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>Not scheduled</span>
                          )}
                        </div>

                        {/* Mode */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mode</span>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                              fontSize: 11,
                              fontWeight: 700,
                              background: (i.mode || "In-Person") === "Online" ? "rgba(56, 189, 248, 0.2)" : "rgba(255, 255, 255, 0.08)",
                              color: (i.mode || "In-Person") === "Online" ? "#38BDF8" : "#fff",
                              borderRadius: 99,
                              padding: "3px 10px",
                              border: `1px solid ${(i.mode || "In-Person") === "Online" ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.15)"}`,
                            }}
                          >
                            {(i.mode || "In-Person") === "Online" ? "💻 Online" : "🏢 In-Person"}
                          </span>
                        </div>

                        {/* Panelists */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Panelists</span>
                          <span style={{ fontSize: 12, color: i.panel?.length > 0 ? "#fff" : "rgba(255,255,255,0.5)", fontStyle: i.panel?.length > 0 ? "normal" : "italic", textAlign: "right", maxWidth: "60%" }}>
                            {i.panel?.length > 0 ? i.panel.join(", ") : "Not assigned"}
                          </span>
                        </div>

                        {/* Score / Rec */}
                        {i.score !== null && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Score / Rec</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 800,
                                background: i.score >= 80 ? "rgba(16, 185, 129, 0.2)" : i.score >= 60 ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)",
                                color: i.score >= 80 ? "#34D399" : i.score >= 60 ? "#FBBF24" : "#FCA5A5",
                                border: `1px solid ${i.score >= 80 ? "rgba(16, 185, 129, 0.3)" : i.score >= 60 ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
                              }}>{i.score}</div>
                              {i.rec && i.rec !== "—" && (
                                <span style={{
                                  fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "3px 10px",
                                  background: i.rec === "Selected" ? "rgba(16, 185, 129, 0.2)" : i.rec === "Rejected" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)",
                                  color: i.rec === "Selected" ? "#34D399" : i.rec === "Rejected" ? "#FCA5A5" : "#FBBF24",
                                  border: `1px solid ${i.rec === "Selected" ? "rgba(16, 185, 129, 0.3)" : i.rec === "Rejected" ? "rgba(239, 68, 68, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
                                }}>{i.rec}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ padding: "14px 0 0", display: "flex", gap: 8, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
                        {!isScheduled ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenSchedule(c); }}
                            disabled={isPreviousRound}
                            style={{
                              flex: 1, padding: "10px 0", borderRadius: 10,
                              background: isPreviousRound ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
                              color: isPreviousRound ? "rgba(255,255,255,0.3)" : "#fff",
                              border: isPreviousRound ? "none" : "1px solid rgba(255,255,255,0.25)",
                              fontSize: 13, fontWeight: 700, cursor: isPreviousRound ? "not-allowed" : "pointer",
                              opacity: isPreviousRound ? 0.6 : 1,
                            }}
                          >📅 Schedule</button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenSchedule(c); }}
                            disabled={isPreviousRound}
                            style={{
                              flex: 1, padding: "10px 0", borderRadius: 10,
                              background: isPreviousRound ? "rgba(255,255,255,0.05)" : "rgba(245, 158, 11, 0.2)",
                              color: isPreviousRound ? "rgba(255,255,255,0.3)" : "#FBBF24",
                              border: isPreviousRound ? "none" : "1px solid rgba(245, 158, 11, 0.3)",
                              fontSize: 13, fontWeight: 700, cursor: isPreviousRound ? "not-allowed" : "pointer",
                              opacity: isPreviousRound ? 0.6 : 1,
                            }}
                          >🔄 Reschedule</button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setAssigningCandidate(c); }}
                          disabled={isPreviousRound}
                          style={{
                            flex: 1, padding: "10px 0", borderRadius: 10,
                            background: isPreviousRound ? "rgba(255,255,255,0.05)" : "rgba(255, 215, 0, 0.15)",
                            color: isPreviousRound ? "rgba(255,255,255,0.3)" : "#FBBF24",
                            border: isPreviousRound ? "none" : "1px solid rgba(255, 215, 0, 0.25)",
                            fontSize: 13, fontWeight: 700, cursor: isPreviousRound ? "not-allowed" : "pointer",
                            opacity: isPreviousRound ? 0.6 : 1,
                          }}
                        >👥 Panelist</button>
                        {isScheduled && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setReminderCandidate(c); }}
                            disabled={isPreviousRound}
                            style={{
                              flex: 1, padding: "10px 0", borderRadius: 10,
                              background: isPreviousRound ? "rgba(255,255,255,0.05)" : "rgba(167, 139, 250, 0.2)",
                              color: isPreviousRound ? "rgba(255,255,255,0.3)" : "#C084FC",
                              border: isPreviousRound ? "none" : "1px solid rgba(167, 139, 250, 0.3)",
                              fontSize: 13, fontWeight: 700, cursor: isPreviousRound ? "not-allowed" : "pointer",
                              opacity: isPreviousRound ? 0.6 : 1,
                            }}
                          >🔔 Reminder</button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleGiveOffer(c); }}
                          disabled={isPreviousRound}
                          style={{
                            width: "100%", padding: "10px 0", borderRadius: 10,
                            background: isPreviousRound ? "rgba(255,255,255,0.05)" : "rgba(52, 211, 153, 0.2)",
                            color: isPreviousRound ? "rgba(255,255,255,0.3)" : "#34D399",
                            border: isPreviousRound ? "none" : "1px solid rgba(52, 211, 153, 0.3)",
                            fontSize: 13, fontWeight: 700, cursor: isPreviousRound ? "not-allowed" : "pointer",
                            opacity: isPreviousRound ? 0.6 : 1,
                          }}
                        >📜 Give Offer</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dot indicators */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12, paddingBottom: 8 }}>
                {filteredCandidates.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => scrollRef.current?.scrollTo({ left: (idx * scrollRef.current.clientWidth), behavior: "smooth" })}
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: currentCardIndex === idx ? T.primary : T.border,
                      cursor: "pointer", transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* ── DESKTOP: table view ── */
        <Card>
          <div
            style={{
              padding: "12px 14px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={toggleSelectAll}
                style={{
                  background: T.surface,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: T.ink,
                  cursor: "pointer",
                }}
              >
                {isAllSelected ? "Clear selection" : "Select all"}
              </button>
              <button
                onClick={handleAdvanceSelectedRounds}
                disabled={selectedCandidateKeys.length === 0}
                style={{
                  background: selectedCandidateKeys.length === 0 ? T.border : T.primary,
                  color: selectedCandidateKeys.length === 0 ? T.inkFaint : "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: selectedCandidateKeys.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Advance Round
              </button>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Input
                placeholder="Search candidate name, role, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 360, flex: 1, minWidth: 0 }}
              />
              <span style={{ fontSize: 12, color: T.inkFaint, fontWeight: 600, whiteSpace: "nowrap" }}>
                {filteredCandidates.length} of {candidatesWithInterviews.length} shortlisted
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: font.base, fontFamily: font.body }}>
              <thead>
                <tr style={{ background: T.canvas, borderBottom: `2px solid ${T.border}` }}>
                  <th style={{ width: 44, padding: "12px 8px", textAlign: "center", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        style={{ width: 16, height: 16, cursor: "pointer" }}
                      />
                    </div>
                  </th>
                  <th style={{ padding: "12px 10px", textAlign: "left", fontSize: font.xs, fontWeight: font.bold, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", verticalAlign: "middle" }}>Candidate & Role</th>
                  <th style={{ padding: "12px 10px", textAlign: "center", fontSize: font.xs, fontWeight: font.bold, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", verticalAlign: "middle", width: 120 }}>Round</th>
                  <th style={{ padding: "12px 10px", textAlign: "left", fontSize: font.xs, fontWeight: font.bold, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", verticalAlign: "middle" }}>Panelists</th>
                  <th style={{ padding: "12px 10px", textAlign: "left", fontSize: font.xs, fontWeight: font.bold, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", verticalAlign: "middle" }}>Schedule</th>
                  <th style={{ padding: "12px 10px", textAlign: "left", fontSize: font.xs, fontWeight: font.bold, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", verticalAlign: "middle", width: 100 }}>Mode</th>
                  <th style={{ padding: "12px 10px", textAlign: "left", fontSize: font.xs, fontWeight: font.bold, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", verticalAlign: "middle", width: 80 }}>Link</th>
                  <th style={{ padding: "12px 10px", textAlign: "center", fontSize: font.xs, fontWeight: font.bold, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", verticalAlign: "middle" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((c) => {
                  const i = c.interview;
                  const rnd = c.displayRound;
                  const isPreviousRound = c.displayRound < c.activeRound;
                  const isChecked = selectedCandidateKeys.includes(candidateKey(c));

                  return (
                    <React.Fragment key={candidateKey(c)}>
                    <tr
                      onClick={() => setSelectedAppDetail(c)}
                      style={{
                        borderBottom: `1px solid ${T.border}`,
                        cursor: "pointer",
                        background: isChecked ? `${T.primary}05` : "transparent",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isChecked ? `${T.primary}09` : `${T.canvas}`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isChecked ? `${T.primary}05` : "transparent";
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: "12px 8px", textAlign: "center", verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isPreviousRound}
                            onChange={() => {
                              toggleSelectCandidate(c);
                            }}
                            style={{ width: 16, height: 16, cursor: isPreviousRound ? "not-allowed" : "pointer" }}
                          />
                        </div>
                      </td>

                      {/* Candidate & Role */}
                      <td style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {avatar(c.name, 36, 12)}
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontWeight: 700, color: T.ink, fontSize: 13 }}>{c.name}</span>
                              {i.score !== null && (
                                <span style={{
                                  fontSize: 9, fontWeight: 800,
                                  background: i.score >= 80 ? T.greenLight : i.score >= 60 ? T.amberLight : T.redLight,
                                  color: i.score >= 80 ? T.green : i.score >= 60 ? T.amber : T.red,
                                  border: `1px solid ${i.score >= 80 ? "#A7F3D0" : i.score >= 60 ? "#FDE68A" : "#FCA5A5"}`,
                                  padding: "1px 5px", borderRadius: 4
                                }}>
                                  ★ {i.score}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: T.inkMid, marginTop: 1 }}>{c.role}</div>
                            <div style={{ fontSize: 10, color: T.inkFaint }}>{c.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Round */}
                      <td style={{ padding: "12px 10px", textAlign: "center", verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 8, padding: "2px 4px" }}>
                          <button
                            onClick={() => handleDecrementCandidateRound(c, rnd)}
                            disabled={rnd <= 1 || isPreviousRound}
                            style={{
                              width: 20, height: 20, borderRadius: 5, border: "none",
                              background: (rnd <= 1 || isPreviousRound) ? "transparent" : T.primaryLight,
                              color: (rnd <= 1 || isPreviousRound) ? T.inkFaint : T.primary,
                              fontWeight: "bold",
                              cursor: (rnd <= 1 || isPreviousRound) ? "not-allowed" : "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
                              transition: "all 0.15s"
                            }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: 11.5, fontWeight: 700, minWidth: 55, textAlign: "center", color: T.ink }}>
                            {getRoundOrdinal(rnd)}
                          </span>
                          <button
                            onClick={() => handleIncrementCandidateRound(c, rnd)}
                            disabled={rnd >= 10 || isPreviousRound}
                            style={{
                              width: 20, height: 20, borderRadius: 5, border: "none",
                              background: (rnd >= 10 || isPreviousRound) ? "transparent" : T.primaryLight,
                              color: (rnd >= 10 || isPreviousRound) ? T.inkFaint : T.primary,
                              fontWeight: "bold",
                              cursor: (rnd >= 10 || isPreviousRound) ? "not-allowed" : "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11,
                              transition: "all 0.15s"
                            }}
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Panelists */}
                      <td style={{ padding: "12px 10px", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {i.panel && i.panel.length > 0 ? (
                            i.panel.map((pName: string) => (
                              <span key={pName} style={{
                                fontSize: 10, fontWeight: 700, color: T.inkMid,
                                background: T.canvas, border: `1px solid ${T.border}`,
                                borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap"
                              }} title={pName}>
                                {pName.split(" ").map((n: string) => n[0]).join("")}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: 11, color: T.inkFaint, fontStyle: "italic" }}>—</span>
                          )}
                        </div>
                      </td>

                      {/* Schedule */}
                      <td style={{ padding: "12px 10px", verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                        {i.date ? (
                          <div
                            onClick={(e) => { if (!isPreviousRound) { e.stopPropagation(); handleOpenSchedule(c); } }}
                            style={{
                              cursor: isPreviousRound ? "default" : "pointer",
                              fontSize: 12,
                              fontWeight: 600,
                              color: T.ink,
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span>{i.date} at {i.time}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: T.inkFaint }}>—</span>
                        )}
                      </td>

                      {/* Mode */}
                      <td style={{ padding: "12px 10px", verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                        {modeCell(i.mode || "In-Person")}
                      </td>

                      {/* Link */}
                      <td style={{ padding: "12px 10px", verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                        {i.mode === "Online" && i.meetingLink ? (
                          <a
                            href={i.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: 12, color: T.primary, textDecoration: "none",
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              width: 24, height: 24, borderRadius: 6, background: T.primaryLight,
                              border: `1px solid ${T.primary}44`,
                              transition: "all 0.2s"
                            }}
                            className="btn-action-hover"
                            title="Join Meeting"
                          >
                            🔗
                          </a>
                        ) : (
                          <span style={{ fontSize: 11, color: T.inkFaint }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 10px", textAlign: "center", verticalAlign: "middle" }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "grid", gridTemplateColumns: "105px 75px 90px 80px 65px", gap: 6, justifyContent: "center", alignItems: "center" }}>
                          {!i.date ? (
                            <button
                              onClick={() => handleOpenSchedule(c)}
                              disabled={isPreviousRound}
                              style={{ ...actionBtnStyle("primary", isPreviousRound), width: "100%", textAlign: "center" }}
                              className={isPreviousRound ? "" : "btn-action-hover"}
                            >
                              📅 Schedule
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenSchedule(c)}
                              disabled={isPreviousRound}
                              style={{ ...actionBtnStyle("reschedule", isPreviousRound), width: "100%", textAlign: "center" }}
                              className={isPreviousRound ? "" : "btn-action-hover"}
                              title={`Currently: ${i.date} at ${i.time}`}
                            >
                              🔄 Reschedule
                            </button>
                          )}
                          <button
                            onClick={() => setAssigningCandidate(c)}
                            disabled={isPreviousRound}
                            style={{ ...actionBtnStyle("amber", isPreviousRound), width: "100%", textAlign: "center" }}
                            className={isPreviousRound ? "" : "btn-action-hover"}
                          >
                            Panelist
                          </button>
                          {i.date ? (
                            <button
                              onClick={() => setReminderCandidate(c)}
                              disabled={isPreviousRound}
                              style={{ ...actionBtnStyle("secondary", isPreviousRound), width: "100%", textAlign: "center" }}
                              className={isPreviousRound ? "" : "btn-action-hover"}
                            >
                              🔔 Reminder
                            </button>
                          ) : (
                            <div style={{ width: 90 }} />
                          )}
                          <button
                            onClick={() => {
                              const key = candidateKey(c);
                              if (inlineEvalKey === key) {
                                setInlineEvalKey(null);
                                setScores({});
                                setRecommendation("");
                                setRemarks("");
                              } else {
                                setInlineEvalKey(key);
                                setScores({});
                                setRecommendation("");
                                setRemarks("");
                              }
                            }}
                            disabled={isPreviousRound}
                            style={{
                              ...actionBtnStyle(
                                inlineEvalKey === candidateKey(c) ? "primary" : "secondary",
                                isPreviousRound
                              ),
                              width: "100%",
                              textAlign: "center",
                              background: inlineEvalKey === candidateKey(c) ? T.primary : actionBtnStyle("secondary", isPreviousRound).background,
                              color: inlineEvalKey === candidateKey(c) ? "#fff" : actionBtnStyle("secondary", isPreviousRound).color,
                            }}
                            className={isPreviousRound ? "" : "btn-action-hover"}
                          >
                            {inlineEvalKey === candidateKey(c) ? "✕ Close" : "📝 Evaluate"}
                          </button>
                          <button
                            onClick={() => handleGiveOffer(c)}
                            disabled={isPreviousRound}
                            style={{ ...actionBtnStyle("success", isPreviousRound), width: "100%", textAlign: "center" }}
                            className={isPreviousRound ? "" : "btn-action-hover"}
                          >
                            📜 Offer
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Inline Evaluation Form Row */}
                    {inlineEvalKey === candidateKey(c) && (
                      <tr>
                        <td colSpan={8} style={{ padding: 0, background: T.canvas, borderBottom: `2px solid ${T.primary}22` }}>
                          <div
                            style={{
                              padding: "20px 24px",
                              background: `linear-gradient(135deg, ${T.primaryLight} 0%, ${T.canvas} 100%)`,
                              borderTop: `2px solid ${T.primary}33`,
                            }}
                          >
                            {/* Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>📝 Evaluate — {c.name}</span>
                                <span style={{ fontSize: 12, color: T.inkMid, fontWeight: 600 }}>
                                  {c.role} · {getRoundOrdinal(rnd)}
                                  {i.date ? ` · ${i.date} at ${i.time}` : ""}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  setInlineEvalKey(null);
                                  setScores({});
                                  setRecommendation("");
                                  setRemarks("");
                                }}
                                style={{
                                  background: "none", border: `1.5px solid ${T.border}`, borderRadius: 8,
                                  padding: "4px 12px", fontSize: 12, fontWeight: 700, color: T.inkMid,
                                  cursor: "pointer",
                                }}
                                className="btn-action-hover"
                              >
                                ✕ Close
                              </button>
                            </div>

                            {/* Scoring Grid */}
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 16 }}>
                              {criteria.map((cr) => (
                                <div key={cr} style={{ background: T.white, borderRadius: 10, padding: "12px 14px", border: `1px solid ${T.border}` }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMid, marginBottom: 10 }}>{cr}</div>
                                  <div style={{ display: "flex", gap: 6, justifyContent: "space-between" }}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                      <div
                                        key={n}
                                        onClick={() => setScores((prev) => ({ ...prev, [cr]: n }))}
                                        style={{
                                          width: 32, height: 32, borderRadius: 8,
                                          display: "flex", alignItems: "center", justifyContent: "center",
                                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                                          background: scores[cr] >= n ? T.primary : T.primaryLight,
                                          color: scores[cr] >= n ? "#fff" : T.primary,
                                          border: `1.5px solid ${scores[cr] >= n ? T.primary : T.border}`,
                                          transition: "all 0.1s",
                                        }}
                                      >
                                        {n}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Recommendation + Remarks row */}
                            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 16 }}>
                              <div style={{ flex: "0 0 auto" }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMid, marginBottom: 6 }}>Overall Recommendation</div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  {["Selected", "Hold", "Rejected"].map((r) => (
                                    <button
                                      key={r}
                                      onClick={() => setRecommendation(r)}
                                      style={{
                                        border: `1.5px solid ${recommendation === r ? T.primary : T.border}`,
                                        borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700,
                                        background: recommendation === r ? T.primaryLight : T.white,
                                        color: recommendation === r ? T.primary : T.inkMid,
                                        cursor: "pointer",
                                      }}
                                      className="btn-action-hover"
                                    >
                                      {r}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div style={{ flex: 1, minWidth: 200 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMid, marginBottom: 6 }}>Remarks</div>
                                <textarea
                                  placeholder="Any additional remarks…"
                                  value={remarks}
                                  onChange={(e) => setRemarks(e.target.value)}
                                  style={{
                                    border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 10,
                                    fontSize: 13, width: "100%", minHeight: 48, resize: "vertical",
                                    boxSizing: "border-box", outline: "none", color: T.ink,
                                    background: T.white,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Submit actions */}
                            <div style={{ display: "flex", gap: 10 }}>
                              <button
                                onClick={() => {
                                  if (!recommendation) {
                                    alert("Please select a recommendation.");
                                    return;
                                  }
                                  if (!setInterviews) return;
                                  const scoreValues = Object.values(scores);
                                  const avgScore = scoreValues.length > 0 ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 20) : null;
                                  setInterviews((prev) => {
                                    const exists = prev.some(
                                      (iv) => iv.candidate === c.name && iv.role === c.role && iv.round === rnd
                                    );
                                    if (exists) {
                                      return prev.map((iv) =>
                                        iv.candidate === c.name && iv.role === c.role && iv.round === rnd
                                          ? { ...iv, score: avgScore, rec: recommendation, status: "Completed", remarks }
                                          : iv
                                      );
                                    } else {
                                      return [
                                        ...prev,
                                        {
                                          id: i.id || `INT-${Date.now()}`,
                                          candidate: c.name,
                                          role: c.role,
                                          date: i.date || "",
                                          time: i.time || "",
                                          panel: i.panel || [],
                                          score: avgScore,
                                          rec: recommendation,
                                          status: "Completed",
                                          mode: i.mode || "In-Person",
                                          meetingLink: i.meetingLink || "",
                                          round: rnd,
                                          remarks,
                                        },
                                      ];
                                    }
                                  });
                                  setInlineEvalKey(null);
                                  setScores({});
                                  setRecommendation("");
                                  setRemarks("");
                                }}
                                style={{
                                  background: T.primary, color: "#fff", border: "none", borderRadius: 10,
                                  padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                                  boxShadow: `0 4px 12px ${T.primary}33`,
                                }}
                                className="btn-action-hover"
                              >
                                ✓ Submit Evaluation
                              </button>
                              <button
                                onClick={() => {
                                  setInlineEvalKey(null);
                                  setScores({});
                                  setRecommendation("");
                                  setRemarks("");
                                }}
                                style={{
                                  background: "none", border: `1.5px solid ${T.border}`, borderRadius: 10,
                                  padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                                  color: T.inkMid,
                                }}
                                className="btn-action-hover"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}

                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: "40px 24px", textAlign: "center", color: T.inkFaint, fontSize: 14 }}>
                      No candidates found matching the filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Schedule / Reschedule Interview Modal */}
      <Modal open={showScheduleModal} onClose={() => { setShowScheduleModal(false); setSchedulingCandidate(null); }} maxWidth={480}>
        <ModalHeader
          title={schedulingCandidate?.interview?.date ? "🔄 Reschedule Interview" : "📅 Schedule Interview"}
          onClose={() => { setShowScheduleModal(false); setSchedulingCandidate(null); }}
        />
        {schedulingCandidate && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Candidate info card */}
            <div style={{ background: T.canvas, borderRadius: 10, padding: 12, border: `1px solid ${T.border}` }}>
              <strong>{schedulingCandidate.name}</strong>
              <div style={{ fontSize: 12, color: T.inkLight, marginTop: 2 }}>
                {schedulingCandidate.role} · {getRoundOrdinal(schedulingCandidate.activeRound)}
              </div>
            </div>

            {/* Reschedule notice — shown only when already scheduled */}
            {schedulingCandidate?.interview?.date && (
              <div style={{
                background: "#FFF3E0",
                border: "1.5px solid #FFB74D",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#E65100", marginBottom: 2 }}>Currently Scheduled</div>
                  <div style={{ fontSize: 12, color: "#BF360C" }}>
                    {schedulingCandidate.interview.date} at {schedulingCandidate.interview.time}
                    {schedulingCandidate.interview.mode ? ` · ${schedulingCandidate.interview.mode}` : ""}
                  </div>
                  <div style={{ fontSize: 11, color: "#E65100", marginTop: 3, opacity: 0.8 }}>
                    Setting a new date & time will replace the current schedule.
                  </div>
                </div>
              </div>
            )}

            <FormField label="Interview Date" required>
              <div
                onClick={() => dateInputRef.current?.showPicker?.()}
                style={{ cursor: "pointer" }}
              >
                <input
                  ref={dateInputRef}
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, date: e.target.value }))}
                  onClick={(e) => {
                    e.stopPropagation();
                    (e.target as HTMLInputElement).showPicker?.();
                  }}
                  style={{
                    border: `1.5px solid ${T.border}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    fontSize: 13,
                    color: T.ink,
                    background: "#fff",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                />
              </div>
            </FormField>

            <FormField label="Time Slot" required>
              <Select
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm((p) => ({ ...p, time: e.target.value }))}
                options={TIME_OPTIONS}
                placeholder="Select time…"
              />
            </FormField>

            <FormField label="Interview Mode" required>
              <Select
                value={scheduleForm.mode}
                onChange={(e) => setScheduleForm((p) => ({ ...p, mode: e.target.value, meetingLink: e.target.value === "In-Person" ? "" : p.meetingLink }))}
                options={MODE_OPTIONS}
              />
            </FormField>

            {scheduleForm.mode === "Online" && (
              <FormField label="Meeting Link" required>
                <Input
                  placeholder="https://meet.google.com/xxx-xxx-xxx"
                  value={scheduleForm.meetingLink}
                  onChange={(e) => setScheduleForm((p) => ({ ...p, meetingLink: e.target.value }))}
                />
              </FormField>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 12, justifyContent: "flex-end" }}>
              <Btn label="Cancel" variant="ghost" onClick={() => { setShowScheduleModal(false); setSchedulingCandidate(null); }} />
              <Btn label="Save Schedule" onClick={handleSaveSchedule} />
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Panelist Modal */}
      <Modal open={!!assigningCandidate} onClose={() => setAssigningCandidate(null)} maxWidth={440}>
        <ModalHeader title="Assign Panelists" onClose={() => setAssigningCandidate(null)} />
        {assigningCandidate && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: T.canvas, borderRadius: 10, padding: 12, border: `1px solid ${T.border}`, marginBottom: 4 }}>
              <strong>{assigningCandidate.name}</strong>
              <div style={{ fontSize: 12, color: T.inkLight, marginTop: 2 }}>
                {assigningCandidate.role} · {getRoundOrdinal(assigningCandidate.activeRound)}
              </div>
            </div>

            <FormField label="Available Panel Members">
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                {panelists.map((p) => {
                  const isAssigned = (assigningCandidate.interview?.panel || []).includes(p.name);
                  return (
                    <div
                      key={p.name}
                      onClick={() => handleTogglePanelistForCandidate(p.name)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        border: `1.5px solid ${isAssigned ? T.primary : T.border}`,
                        borderRadius: 8,
                        background: isAssigned ? T.primaryLight : T.white,
                        cursor: "pointer",
                        transition: "all 0.1s",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isAssigned ? T.primary : T.ink }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: T.inkFaint }}>{p.email} · {p.phone}</div>
                      </div>
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: `2px solid ${isAssigned ? T.primary : T.borderMid}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: isAssigned ? T.primary : T.white,
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        {isAssigned ? "✓" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </FormField>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Btn label="Send Invite" onClick={() => setAssigningCandidate(null)} />
            </div>
          </div>
        )}
      </Modal>

      {/* Candidate Details Modal */}
      <Modal open={!!selectedAppDetail} onClose={() => setSelectedAppDetail(null)} maxWidth={640}>
        {selectedAppDetail && (
          <>
            <ModalHeader title="Shortlisted Candidate Details" onClose={() => setSelectedAppDetail(null)} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
                padding: 16,
                background: T.primaryLight,
                borderRadius: 12,
              }}
            >
              {avatar(selectedAppDetail.name, 56, 18)}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>{selectedAppDetail.name}</div>
                <div style={{ color: T.inkLight, fontSize: 13, marginTop: 2 }}>{selectedAppDetail.role}</div>
                <div style={{ marginTop: 6 }}>
                  <Badge label="Shortlisted" variant="primary" />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 20 }}>
              {[
                ["Application ID", selectedAppDetail.id],
                ["Experience", selectedAppDetail.exp],
                ["Qualification", selectedAppDetail.qualification],
                ["Referred By", selectedAppDetail.referredBy],
                ["Applied Date", selectedAppDetail.applied],
                ["Email", selectedAppDetail.email],
                ["Phone", selectedAppDetail.phone || "—"],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 14, color: T.ink }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Rounds History Log */}
            <div style={{ marginTop: 20, borderTop: `1.5px solid ${T.border}`, paddingTop: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: T.ink, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Interview Rounds History
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from({ length: selectedAppDetail.activeRound || 1 }, (_, i) => i + 1).map((r) => {
                  if (r > selectedAppDetail.activeRound) return null;

                  const roundInv = interviews.find(
                    (i) => i.candidate === selectedAppDetail.name && i.role === selectedAppDetail.role && i.round === r
                  );
                  if (!roundInv) {
                    return (
                      <div
                        key={r}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          background: T.canvas,
                          borderRadius: 8,
                          border: `1.5px dashed ${T.border}`,
                        }}
                      >
                        <span style={{ fontSize: 13, fontWeight: 800, color: T.ink }}>{getRoundOrdinal(r)}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.amber, background: T.amberLight, padding: "3px 10px", borderRadius: 99 }}>Pending Schedule</span>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={r}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        padding: 12,
                        background: T.primaryPale,
                        borderRadius: 8,
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: T.primary }}>{getRoundOrdinal(r)}</span>
                        <Badge label={roundInv.status} variant={statusVariant(roundInv.status)} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8, fontSize: 11, color: T.inkMid }}>
                        <div><strong>Date & Time:</strong> {roundInv.date ? `${roundInv.date} at ${roundInv.time}` : "Not Scheduled"}</div>
                        <div><strong>Mode:</strong> {roundInv.mode || "In-Person"}</div>
                        <div><strong>Panel:</strong> {roundInv.panel?.join(", ") || "None"}</div>
                        <div><strong>Score / Rec:</strong> {roundInv.score !== null ? `${roundInv.score}/100 (${roundInv.rec})` : "Not Evaluated"}</div>
                      </div>
                      {roundInv.remarks && (
                        <div style={{ fontSize: 11, color: T.inkLight, background: "#fff", padding: 6, borderRadius: 4, border: `1px solid ${T.border}` }}>
                          <strong>Remarks:</strong> {roundInv.remarks}
                        </div>
                      )}
                      {roundInv.meetingLink && (
                        <div style={{ fontSize: 11, marginTop: 2 }}>
                          <strong>Link:</strong>{" "}
                          <a
                            href={roundInv.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: T.primary, textDecoration: "none", fontWeight: 600 }}
                          >
                            {roundInv.meetingLink}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <Btn
                label="Give Offer"
                variant="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGiveOffer(selectedAppDetail);
                  setSelectedAppDetail(null);
                }}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Evaluation Modal */}
      <Modal open={!!evalInterview} onClose={() => setEvalInterview(null)} maxWidth={600}>
        {evalInterview && (
          <>
            <ModalHeader title={`Evaluate — ${evalInterview.candidate}`} onClose={() => setEvalInterview(null)} />
            <div style={{ background: T.canvas, borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: `1px solid ${T.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, color: T.inkMid }}>
                    <strong>{evalInterview.role}</strong> · {getRoundOrdinal(evalInterview.round)} · {evalInterview.date} at {evalInterview.time}
                  </div>
                  <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>Panel: {evalInterview.panel?.join(", ") || "None"}</div>
                </div>
                {modeCell(evalInterview.mode || "In-Person")}
              </div>
              {evalInterview.mode === "Online" && evalInterview.meetingLink && (
                <div style={{ marginTop: 10 }}>
                  <a
                    href={evalInterview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, color: T.primary, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    🔗 Join Meeting
                  </a>
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {criteria.map((c) => (
                <div key={c} style={{ background: T.canvas, borderRadius: 10, padding: "12px 14px", border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMid, marginBottom: 10 }}>{c}</div>
                  <div style={{ display: "flex", gap: isMobile ? 4 : 6, justifyContent: "space-between" }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <div
                        key={n}
                        onClick={() => setScores((prev) => ({ ...prev, [c]: n }))}
                        style={{
                          width: isMobile ? 26 : 36,
                          height: isMobile ? 26 : 36,
                          borderRadius: isMobile ? 6 : 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: isMobile ? 11 : 13,
                          fontWeight: 700,
                          cursor: "pointer",
                          background: scores[c] >= n ? T.primary : T.primaryLight,
                          color: scores[c] >= n ? "#fff" : T.primary,
                          border: `1.5px solid ${scores[c] >= n ? T.primary : T.border}`,
                          transition: "all 0.1s",
                        }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <FormField label="Overall Recommendation">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4, marginBottom: 12 }}>
                {["Selected", "Hold", "Rejected"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRecommendation(r)}
                    style={{
                      border: `1.5px solid ${recommendation === r ? T.primary : T.border}`,
                      borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 700,
                      background: recommendation === r ? T.primaryLight : T.canvas,
                      color: recommendation === r ? T.primary : T.inkMid,
                      cursor: "pointer",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Remarks">
              <textarea
                placeholder="Any additional remarks…"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ border: `1.5px solid ${T.border}`, borderRadius: 8, padding: 10, fontSize: 13, width: "100%", minHeight: 64, resize: "vertical", boxSizing: "border-box", outline: "none", color: T.ink }}
              />
            </FormField>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Btn label="Submit Evaluation" onClick={submitEvaluation} />
              <Btn label="Cancel" variant="ghost" onClick={() => setEvalInterview(null)} />
            </div>
          </>
        )}
      </Modal>

      {/* ── Add Panelist Modal ── */}
      {showAddPanelistModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
          onClick={closeAddPanelistModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 460,
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              overflow: "hidden",
              animation: "slideUp 0.22s ease",
            }}
          >
            {/* Modal header */}
            <div style={{
              background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryDark || T.primary} 100%)`,
              padding: "24px 24px 20px",
              position: "relative",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Interview Panel
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Add New Panelist</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
                Register a panel member who can evaluate candidates
              </div>
              <button
                onClick={closeAddPanelistModal}
                style={{
                  position: "absolute", top: 16, right: 16,
                  background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%",
                  width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleAddPanelist} style={{ padding: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Name field */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.inkMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Full Name <span style={{ color: T.red }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>👤</span>
                    <input
                      placeholder="e.g. Dr. Anitha Krishnan"
                      value={newPanelistName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      style={{
                        width: "100%", boxSizing: "border-box",
                        border: `1.5px solid ${panelistErrors.name ? T.red : T.border}`, borderRadius: 10,
                        padding: "11px 12px 11px 38px",
                        fontSize: 14, outline: "none", color: T.ink,
                        background: T.canvas,
                        transition: "border-color 0.15s",
                      }}
                    />
                  </div>
                  {panelistErrors.name && (
                    <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>{panelistErrors.name}</div>
                  )}
                </div>

                {/* Email field */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.inkMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Email Address <span style={{ color: T.red }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>✉️</span>
                    <input
                      type="email"
                      placeholder="e.g. anitha@school.edu"
                      value={newPanelistEmail}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      style={{
                        width: "100%", boxSizing: "border-box",
                        border: `1.5px solid ${panelistErrors.email ? T.red : T.border}`, borderRadius: 10,
                        padding: "11px 12px 11px 38px",
                        fontSize: 14, outline: "none", color: T.ink,
                        background: T.canvas,
                      }}
                    />
                  </div>
                  {panelistErrors.email && (
                    <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>{panelistErrors.email}</div>
                  )}
                </div>

                {/* Phone field */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: T.inkMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Phone Number <span style={{ color: T.red }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>📱</span>
                    <input
                      placeholder="e.g. +91 98765 43210"
                      value={newPanelistPhone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      required
                      style={{
                        width: "100%", boxSizing: "border-box",
                        border: `1.5px solid ${panelistErrors.phone ? T.red : T.border}`, borderRadius: 10,
                        padding: "11px 12px 11px 38px",
                        fontSize: 14, outline: "none", color: T.ink,
                        background: T.canvas,
                      }}
                    />
                  </div>
                  {panelistErrors.phone && (
                    <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 600 }}>{panelistErrors.phone}</div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={closeAddPanelistModal}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${T.border}`,
                    background: T.canvas, color: T.inkMid, fontSize: 14, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2, padding: "12px", borderRadius: 10, border: "none",
                    background: T.primary, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                    boxShadow: `0 4px 14px ${T.primary}44`,
                  }}
                >
                  ＋ Add Panelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      <Modal open={!!reminderCandidate} onClose={() => setReminderCandidate(null)} maxWidth={440}>
        <div style={{ padding: "8px 4px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%", margin: "0 auto 12px",
              background: "linear-gradient(135deg, #7B1FA2, #9C27B0)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
            }}>🔔</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.ink }}>Reminder Sent!</div>
            <div style={{ fontSize: 13, color: T.inkMid, marginTop: 4 }}>
              Interview reminder dispatched for{" "}
              <strong style={{ color: T.primary }}>{reminderCandidate?.role}</strong>
            </div>
          </div>

          {/* Recipients section */}
          <div style={{
            background: T.canvas, borderRadius: 12, border: `1px solid ${T.border}`,
            overflow: "hidden", marginBottom: 16,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 800, color: T.inkFaint, textTransform: "uppercase",
              letterSpacing: "0.1em", padding: "8px 14px", borderBottom: `1px solid ${T.border}`,
              background: T.surface,
            }}>
              📬 Recipients
            </div>

            {/* Candidate row */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 14px", borderBottom: `1px solid ${T.border}`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: "#fff",
              }}>
                {reminderCandidate?.name?.charAt(0) || "C"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>{reminderCandidate?.name}</div>
                <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 1 }}>{reminderCandidate?.email || "Candidate"}</div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "3px 9px",
                background: T.primaryLight, color: T.primary,
              }}>Candidate</div>
            </div>

            {/* Panelists rows */}
            {(reminderCandidate?.interview?.panel?.length > 0
              ? reminderCandidate.interview.panel
              : ["No panelist assigned"]
            ).map((p: string, idx: number) => (
              <div key={idx} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px",
                borderBottom: idx < (reminderCandidate?.interview?.panel?.length || 1) - 1
                  ? `1px solid ${T.border}` : "none",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: p === "No panelist assigned" ? T.border : "#EDE7F6",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800,
                  color: p === "No panelist assigned" ? T.inkFaint : "#6A1B9A",
                }}>
                  {p === "No panelist assigned" ? "?" : p.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: p === "No panelist assigned" ? T.inkFaint : T.ink, fontStyle: p === "No panelist assigned" ? "italic" : "normal" }}>{p}</div>
                  <div style={{ fontSize: 11, color: T.inkFaint, marginTop: 1 }}>
                    {p === "No panelist assigned" ? "Assign a panelist first" : "Interview Panelist"}
                  </div>
                </div>
                {p !== "No panelist assigned" && (
                  <div style={{
                    fontSize: 10, fontWeight: 700, borderRadius: 99, padding: "3px 9px",
                    background: "#EDE7F6", color: "#6A1B9A",
                  }}>Panelist</div>
                )}
              </div>
            ))}
          </div>

          {/* Interview details */}
          {reminderCandidate?.interview?.date && (
            <div style={{
              background: T.primaryLight, borderRadius: 10, padding: "10px 14px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 16, fontSize: 12, color: T.primary, fontWeight: 600,
            }}>
              <span>📅 {reminderCandidate.interview.date} · {reminderCandidate.interview.time}</span>
              <span style={{
                background: T.primary, color: "#fff", borderRadius: 6,
                padding: "2px 8px", fontSize: 10, fontWeight: 700,
              }}>{reminderCandidate.interview.mode || "In-Person"}</span>
            </div>
          )}

          <button
            onClick={() => {
              // Write reminderSentAt into the matching interview record
              if (setInterviews && reminderCandidate) {
                const sentAt = new Date().toISOString();
                setInterviews((prev: any[]) =>
                  prev.map((i: any) =>
                    i.candidate === reminderCandidate.name && i.role === reminderCandidate.role
                      ? { ...i, reminderSentAt: sentAt }
                      : i
                  )
                );
              }
              setReminderCandidate(null);
            }}
            style={{
              width: "100%", padding: "13px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #7B1FA2, #9C27B0)",
              color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(123,31,162,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            🔔 Send Reminder
          </button>
        </div>
      </Modal>
    </div>
  );
}
