import React, { useState, useRef } from "react";
import { T } from "../theme";
import { statusVariant } from "../theme";
import { useBreakpoint } from "../hooks";
import { Card, SectionTitle, Table, Mono, Badge, Btn, Modal, ModalHeader, FormField, Select, Input } from "../components/ui";

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
  setJobApplications,
  generalApplications = [],
  setGeneralApplications,
  jobPostings = [],
  interviews = [],
  setInterviews,
  panelists = [],
  setPanelists,
}: {
  jobApplications?: any[];
  setJobApplications?: React.Dispatch<React.SetStateAction<any[]>>;
  generalApplications?: any[];
  setGeneralApplications?: React.Dispatch<React.SetStateAction<any[]>>;
  jobPostings?: any[];
  interviews?: any[];
  setInterviews?: React.Dispatch<React.SetStateAction<any[]>>;
  panelists?: any[];
  setPanelists?: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const [search, setSearch] = useState("");
  const [selectedPostingId, setSelectedPostingId] = useState<string | null>(null);
  const [roundFilter, setRoundFilter] = useState<number | null>(null);
  const [evalInterview, setEvalInterview] = useState<any>(null);
  const [scores, setScores] = useState<ScoreState>({});
  const [recommendation, setRecommendation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingCandidate, setSchedulingCandidate] = useState<any>(null);
  const [assigningCandidate, setAssigningCandidate] = useState<any>(null);
  const [selectedAppDetail, setSelectedAppDetail] = useState<any>(null);
  const [showAddPanelistModal, setShowAddPanelistModal] = useState(false);

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

  const scrollRef = useRef<HTMLDivElement>(null);
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
        referredBy: a.referredBy || "None",
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

  // Unique rounds available in the current job-filtered set
  const availableRounds = [...new Set(jobFilteredCandidates.map((c) => c.activeRound))].sort((a, b) => a - b);

  const filteredCandidates = jobFilteredCandidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    const matchesRound = roundFilter === null || c.activeRound === roundFilter;

    return matchesSearch && matchesRound;
  });

  const isAllSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((c) => selectedCandidateKeys.includes(candidateKey(c)));

  const toggleSelectCandidate = (c: any) => {
    const key = candidateKey(c);
    setSelectedCandidateKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCandidateKeys([]);
    } else {
      setSelectedCandidateKeys(filteredCandidates.map(candidateKey));
    }
  };

  const handleAdvanceSelectedRounds = () => {
    if (selectedCandidateKeys.length === 0) {
      alert("Select at least one candidate to advance their round.");
      return;
    }
    setActiveRoundOverrides((prev) => {
      const next = { ...prev };
      filteredCandidates.forEach((c) => {
        const key = candidateKey(c);
        if (selectedCandidateKeys.includes(key)) {
          next[key] = Math.min(5, c.activeRound + 1);
        }
      });
      return next;
    });
  };

  const handleIncrementCandidateRound = (c: any, currentRound: number) => {
    const newRound = Math.min(5, currentRound + 1);
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
    if (!newPanelistName || !newPanelistEmail || !newPanelistPhone) {
      alert("Please fill all panelist fields.");
      return;
    }
    if (!setPanelists) return;
    setPanelists((prev) => [
      ...prev,
      { name: newPanelistName, email: newPanelistEmail, phone: newPanelistPhone },
    ]);
    setNewPanelistName("");
    setNewPanelistEmail("");
    setNewPanelistPhone("");
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
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  const selectPosting = (id: string | null) => {
    setSelectedPostingId((prev) => (prev === id ? null : id));
    setSearch("");
    setRoundFilter(null); // reset round filter when job changes
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

  const actionBtnStyle = (variant: "primary" | "secondary" | "success" | "amber" | "reschedule") => ({
    border: "none",
    background:
      variant === "primary"
        ? T.primaryLight
        : variant === "success"
          ? T.greenLight
          : variant === "amber"
            ? T.accentLight
            : variant === "reschedule"
              ? "#FFF3E0"
              : T.skyLight,
    color:
      variant === "primary"
        ? T.primary
        : variant === "success"
          ? T.green
          : variant === "amber"
            ? T.accentDark
            : variant === "reschedule"
              ? "#E65100"
              : T.sky,
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 700 as const,
    fontSize: 11,
    whiteSpace: "nowrap" as const,
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

  const meetingLinkCell = (link: string, mode: string) => {
    if (mode === "In-Person") {
      return <span style={{ fontSize: 12, color: T.inkFaint, fontStyle: "italic" }}>On-site</span>;
    }
    if (link) {
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 16,
            color: T.primary,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            cursor: "pointer",
            transition: "all 0.2s",
            background: "transparent",
            border: `1.5px solid ${T.primary}44`,
          }}
          title="Open meeting link"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = T.primaryLight;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          🔗
        </a>
      );
    }
    return <span style={{ fontSize: 11, color: T.inkFaint }}>—</span>;
  };

  const tableCols = isMobile
    ? ["Select", "Candidate", "Round", "Date & Time", "Actions"]
    : [
      "Select",
      "Candidate",
      "Role",
      "Round",
      "Assigned Panelists",
      "Mode",
      "Date & Time",
      "Meeting Link",
      "Score",
      "Rec",
      "Status",
      "Actions",
    ];

  const tableRows = filteredCandidates.map((c) => {
    const i = c.interview;
    const rnd = c.activeRound;

    if (isMobile) {
      return [
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={selectedCandidateKeys.includes(candidateKey(c))}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelectCandidate(c);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 16, height: 16 }}
          />
          {avatar(c.name, 28, 10)}
          <div>
            <strong style={{ color: T.ink, fontSize: 13 }}>{c.name}</strong>
            <div style={{ fontSize: 10, color: T.inkFaint }}>{c.role}</div>
          </div>
        </div>,
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", alignItems: "center", gap: 4 }}
        >
          <button
            onClick={() => handleDecrementCandidateRound(c, rnd)}
            disabled={rnd <= 1}
            style={{
              width: 18, height: 18, borderRadius: 4, border: "none",
              background: rnd <= 1 ? T.border : T.primary, color: "#fff",
              cursor: rnd <= 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: "bold"
            }}
          >
            -
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, minWidth: 50, textAlign: "center" }}>
            {getRoundOrdinal(rnd)}
          </span>
          <button
            onClick={() => handleIncrementCandidateRound(c, rnd)}
            disabled={rnd >= 5}
            style={{
              width: 18, height: 18, borderRadius: 4, border: "none",
              background: rnd >= 5 ? T.border : T.primary, color: "#fff",
              cursor: rnd >= 5 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: "bold"
            }}
          >
            +
          </button>
        </div>,
        <div>
          {i.date ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.ink }}>{i.date}</div>
              <div style={{ fontSize: 10, color: T.inkFaint }}>{i.time}</div>
            </>
          ) : (
            <span style={{ fontSize: 11, color: T.inkFaint, fontStyle: "italic" }}>Not scheduled</span>
          )}
        </div>,
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {!i.date ? (
            <button
              onClick={(e) => { e.stopPropagation(); handleOpenSchedule(c); }}
              style={actionBtnStyle("primary")}
            >
              📅 Schedule
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); handleOpenSchedule(c); }}
              style={actionBtnStyle("reschedule")}
              title={`Currently: ${i.date} at ${i.time}`}
            >
              🔄 Reschedule
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setAssigningCandidate(c); }}
            style={actionBtnStyle("amber")}
          >
            Panelist
          </button>
        </div>,
      ];
    }

    return [
      <input
        type="checkbox"
        checked={selectedCandidateKeys.includes(candidateKey(c))}
        onChange={(e) => {
          e.stopPropagation();
          toggleSelectCandidate(c);
        }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: 16, height: 16 }}
      />,
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {avatar(c.name, 32, 11)}
        <div>
          <strong style={{ color: T.ink }}>{c.name}</strong>
          <div style={{ fontSize: 11, color: T.inkFaint }}>{c.email}</div>
        </div>
      </div>,
      c.role,
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
      >
        <button
          onClick={() => handleDecrementCandidateRound(c, rnd)}
          disabled={rnd <= 1}
          style={{
            width: 20, height: 20, borderRadius: 4, border: "none",
            background: rnd <= 1 ? T.border : T.primary,
            color: "#fff", fontWeight: "bold", cursor: rnd <= 1 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11
          }}
        >
          -
        </button>
        <span style={{ fontSize: 12, fontWeight: 700, minWidth: 65, textAlign: "center" }}>
          {getRoundOrdinal(rnd)}
        </span>
        <button
          onClick={() => handleIncrementCandidateRound(c, rnd)}
          disabled={rnd >= 5}
          style={{
            width: 20, height: 20, borderRadius: 4, border: "none",
            background: rnd >= 5 ? T.border : T.primary,
            color: "#fff", fontWeight: "bold", cursor: rnd >= 5 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11
          }}
        >
          +
        </button>
      </div>,
      <div style={{ fontSize: 12, color: T.inkMid }}>
        {i.panel && i.panel.length > 0 ? i.panel.join(", ") : <span style={{ color: T.inkFaint, fontStyle: "italic" }}>TBD</span>}
      </div>,
      modeCell(i.mode || "In-Person"),
      <div>
        {i.date ? (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{i.date}</div>
            <div style={{ fontSize: 11, color: T.inkFaint }}>{i.time}</div>
          </>
        ) : (
          <span style={{ fontSize: 12, color: T.inkFaint, fontStyle: "italic" }}>Not scheduled</span>
        )}
      </div>,
      meetingLinkCell(i.meetingLink || "", i.mode),
      i.score !== null ? (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            background: i.score >= 80 ? T.greenLight : i.score >= 60 ? T.amberLight : T.redLight,
            color: i.score >= 80 ? T.green : i.score >= 60 ? T.amber : T.red,
          }}
        >
          {i.score}
        </div>
      ) : (
        <span style={{ color: T.inkFaint }}>—</span>
      ),
      i.rec !== "—" ? <Badge label={i.rec} variant={statusVariant(i.rec)} /> : <span style={{ color: T.inkFaint }}>—</span>,
      <Badge label={i.status} variant={statusVariant(i.status)} />,
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {!i.date ? (
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenSchedule(c); }}
            style={actionBtnStyle("primary")}
          >
            📅 Schedule
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenSchedule(c); }}
            style={{
              ...actionBtnStyle("reschedule"),
              display: "flex", alignItems: "center", gap: 4,
            }}
            title={`Currently scheduled: ${i.date} at ${i.time}${i.mode ? " · " + i.mode : ""}`}
          >
            🔄 Reschedule
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setAssigningCandidate(c); }}
          style={actionBtnStyle("amber")}
        >
          Panelist
        </button>
      </div>,
    ];
  });

  return (
    <div>
      <SectionTitle
        title="Interview Panel"
        sub="Manage shortlisted candidates, schedule interviews, and assign panel members"
        action={
          <button
            onClick={() => setShowAddPanelistModal(true)}
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

      {/* Job filter carousel */}
      {enrichedPostings.length > 0 && (
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
                    <div style={{ fontSize: 15, fontWeight: 800, color: !selectedPostingId ? T.primary : T.ink }}>All Shortlisted</div>
                    <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 2 }}>{shortlistedCandidates.length} total candidates</div>
                  </div>
                  {!selectedPostingId && (
                    <div style={{ background: T.primary, color: "#fff", borderRadius: 99, padding: "4px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Active</div>
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
          )}
        </div>
      )}

      {/* Round Filter Pills — shown below carousel, depends on selected job */}
      {availableRounds.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 2 }}>Round:</span>
          <button
            onClick={() => setRoundFilter(null)}
            style={{
              background: roundFilter === null ? T.primary : T.white,
              color: roundFilter === null ? "#fff" : T.ink,
              border: `1.5px solid ${roundFilter === null ? T.primary : T.border}`,
              borderRadius: 999,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            All Rounds
            <span style={{ marginLeft: 5, opacity: 0.7 }}>({jobFilteredCandidates.length})</span>
          </button>
          {availableRounds.map((rnd) => {
            const count = jobFilteredCandidates.filter((c) => c.activeRound === rnd).length;
            const isActive = roundFilter === rnd;
            return (
              <button
                key={rnd}
                onClick={() => setRoundFilter(isActive ? null : rnd)}
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
                id="candidate-mobile-scroll"
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
                {filteredCandidates.map((c, idx) => {
                  const i = c.interview;
                  const rnd = c.activeRound;
                  const isScheduled = !!i.date;
                  return (
                    <div
                      key={`${c.name}-${c.role}-${rnd}`}
                      style={{
                        flexShrink: 0,
                        width: "100%",
                        scrollSnapAlign: "center",
                        background: T.surface,
                        borderRadius: 18,
                        border: `1.5px solid ${T.border}`,
                        overflow: "hidden",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      }}
                    >
                      {/* Card header — candidate info */}
                      <div
                        style={{
                          background: `linear-gradient(135deg, ${T.primaryLight} 0%, ${T.canvas} 100%)`,
                          padding: "16px 18px 14px",
                          borderBottom: `1px solid ${T.border}`,
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedAppDetail(c)}
                      >
                        {avatar(c.name, 48, 16)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, lineHeight: 1.2 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: T.inkFaint, marginTop: 3 }}>{c.role}</div>
                          <div style={{ fontSize: 11, color: T.inkLight, marginTop: 2 }}>{c.email}</div>
                        </div>
                        <div style={{ fontSize: 11, color: T.inkFaint, flexShrink: 0 }}>
                          {idx + 1}/{filteredCandidates.length}
                        </div>
                      </div>

                      {/* Round + schedule info row */}
                      <div style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}` }}>
                        {/* Round stepper */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Round</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDecrementCandidateRound(c, rnd); }}
                              disabled={rnd <= 1}
                              style={{
                                width: 24, height: 24, borderRadius: 6, border: "none",
                                background: rnd <= 1 ? T.border : T.primary, color: "#fff",
                                cursor: rnd <= 1 ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: "bold",
                              }}
                            >−</button>
                            <span style={{
                              fontSize: 13, fontWeight: 800, color: T.primary,
                              background: T.primaryLight, borderRadius: 8, padding: "3px 10px",
                              minWidth: 70, textAlign: "center",
                            }}>
                              {getRoundOrdinal(rnd)}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleIncrementCandidateRound(c, rnd); }}
                              disabled={rnd >= 5}
                              style={{
                                width: 24, height: 24, borderRadius: 6, border: "none",
                                background: rnd >= 5 ? T.border : T.primary, color: "#fff",
                                cursor: rnd >= 5 ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: "bold",
                              }}
                            >+</button>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div style={{
                          fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "4px 10px",
                          background: i.status === "Completed" ? T.greenLight : isScheduled ? T.amberLight : T.canvas,
                          color: i.status === "Completed" ? T.green : isScheduled ? T.amber : T.inkFaint,
                          border: `1px solid ${i.status === "Completed" ? T.green + "44" : isScheduled ? T.amber + "44" : T.border}`,
                        }}>
                          {i.status === "Completed" ? "✓ Done" : isScheduled ? "● Scheduled" : "○ Pending"}
                        </div>
                      </div>

                      {/* Date / Mode / Panel info */}
                      <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: 8, borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date & Time</span>
                          {isScheduled ? (
                            <span style={{ fontSize: 13, fontWeight: 700, color: T.ink }}>
                              {i.date} · {i.time}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: T.inkFaint, fontStyle: "italic" }}>Not scheduled</span>
                          )}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Mode</span>
                          {modeCell(i.mode || "In-Person")}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Panelists</span>
                          <span style={{ fontSize: 12, color: i.panel?.length > 0 ? T.ink : T.inkFaint, fontStyle: i.panel?.length > 0 ? "normal" : "italic", textAlign: "right", maxWidth: "60%" }}>
                            {i.panel?.length > 0 ? i.panel.join(", ") : "Not assigned"}
                          </span>
                        </div>
                        {i.score !== null && (
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: T.inkFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Score / Rec</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 800,
                                background: i.score >= 80 ? T.greenLight : i.score >= 60 ? T.amberLight : T.redLight,
                                color: i.score >= 80 ? T.green : i.score >= 60 ? T.amber : T.red,
                              }}>{i.score}</div>
                              {i.rec && i.rec !== "—" && (
                                <span style={{
                                  fontSize: 11, fontWeight: 700, borderRadius: 99, padding: "3px 10px",
                                  background: i.rec === "Selected" ? T.greenLight : i.rec === "Rejected" ? T.redLight : T.amberLight,
                                  color: i.rec === "Selected" ? T.green : i.rec === "Rejected" ? T.red : T.amber,
                                }}>{i.rec}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div style={{ padding: "14px 18px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {!isScheduled ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenSchedule(c); }}
                            style={{
                              flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                              background: T.primaryLight, color: T.primary,
                              fontSize: 13, fontWeight: 700, cursor: "pointer",
                            }}
                          >📅 Schedule</button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenSchedule(c); }}
                            style={{
                              flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                              background: "#FFF3E0", color: "#E65100",
                              fontSize: 13, fontWeight: 700, cursor: "pointer",
                            }}
                          >🔄 Reschedule</button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setAssigningCandidate(c); }}
                          style={{
                            flex: 1, padding: "10px 0", borderRadius: 10, border: "none",
                            background: T.accentLight, color: T.accentDark,
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                          }}
                        >👥 Panelist</button>
                        {isScheduled && i.status === "Pending" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setEvalInterview(i); }}
                            style={{
                              width: "100%", padding: "10px 0", borderRadius: 10, border: "none",
                              background: T.greenLight, color: T.green,
                              fontSize: 13, fontWeight: 700, cursor: "pointer",
                            }}
                          >⭐ Evaluate</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dot indicators */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
                {filteredCandidates.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      const el = document.getElementById("candidate-mobile-scroll");
                      if (el) {
                        const cards = el.children;
                        if (cards[idx]) (cards[idx] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                      }
                    }}
                    style={{
                      width: 6, height: 6, borderRadius: 99,
                      background: T.border,
                      cursor: "pointer", transition: "all 0.2s",
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

          <Table
            cols={tableCols}
            onRowClick={(index) => setSelectedAppDetail(filteredCandidates[index])}
            rows={tableRows}
          />
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
              <Input
                type="date"
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm((p) => ({ ...p, date: e.target.value }))}
              />
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
                {[1, 2, 3, 4, 5].map((r) => {
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
                          padding: "8px 12px",
                          background: T.canvas,
                          borderRadius: 8,
                          border: `1.5px dashed ${T.border}`,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.inkLight }}>{getRoundOrdinal(r)}</span>
                        <span style={{ fontSize: 11, color: T.inkFaint, fontStyle: "italic" }}>Not scheduled</span>
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
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, color: T.inkMid }}>
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

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <Btn label="Close" onClick={() => setSelectedAppDetail(null)} />
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
                  <div style={{ display: "flex", gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <div
                        key={n}
                        onClick={() => setScores((prev) => ({ ...prev, [c]: n }))}
                        style={{
                          width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, cursor: "pointer",
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
          onClick={() => { setShowAddPanelistModal(false); setNewPanelistName(""); setNewPanelistEmail(""); setNewPanelistPhone(""); }}
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
                onClick={() => { setShowAddPanelistModal(false); setNewPanelistName(""); setNewPanelistEmail(""); setNewPanelistPhone(""); }}
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
            <form onSubmit={(e) => { handleAddPanelist(e); setShowAddPanelistModal(false); }} style={{ padding: 24 }}>
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
                      onChange={(e) => setNewPanelistName(e.target.value)}
                      required
                      style={{
                        width: "100%", boxSizing: "border-box",
                        border: `1.5px solid ${T.border}`, borderRadius: 10,
                        padding: "11px 12px 11px 38px",
                        fontSize: 14, outline: "none", color: T.ink,
                        background: T.canvas,
                        transition: "border-color 0.15s",
                      }}
                    />
                  </div>
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
                      onChange={(e) => setNewPanelistEmail(e.target.value)}
                      required
                      style={{
                        width: "100%", boxSizing: "border-box",
                        border: `1.5px solid ${T.border}`, borderRadius: 10,
                        padding: "11px 12px 11px 38px",
                        fontSize: 14, outline: "none", color: T.ink,
                        background: T.canvas,
                      }}
                    />
                  </div>
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
                      onChange={(e) => setNewPanelistPhone(e.target.value)}
                      required
                      style={{
                        width: "100%", boxSizing: "border-box",
                        border: `1.5px solid ${T.border}`, borderRadius: 10,
                        padding: "11px 12px 11px 38px",
                        fontSize: 14, outline: "none", color: T.ink,
                        background: T.canvas,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => { setShowAddPanelistModal(false); setNewPanelistName(""); setNewPanelistEmail(""); setNewPanelistPhone(""); }}
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
    </div>
  );
}
