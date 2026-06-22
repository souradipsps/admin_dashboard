const MAROON = "#72102a";
const GOLD = "#c9a84c";
const CREAM = "#faf8f5";

export const T = {
  // Primary brand colors
  primary: MAROON,
  primaryMid: "#8B1F3A",
  primaryLight: "#F5E6EA",
  primaryPale: "#FDF5F7",

  // Accent colors
  accent: GOLD,
  accentLight: "#FDF8E8",
  accentDark: "#A68A3D",

  // Backgrounds
  white: "#FFFFFF",
  canvas: CREAM,
  surface: "#FFFFFF",
  cardBg: "#FFFFFF",

  // Borders
  border: "#E8E2D9",
  borderMid: "#D4CCC0",

  // Text
  ink: "#1A1A1A",
  inkMid: "#4A4A4A",
  inkLight: "#6B6B6B",
  inkFaint: "#9A9A9A",

  // Semantic colors
  green: "#059669",
  greenLight: "#ECFDF5",
  red: "#DC2626",
  redLight: "#FEF2F2",
  teal: "#008B8B",
  tealLight: "#E0F5F5",
  violet: "#6B21A8",
  violetLight: "#F3E8FF",
  sky: "#0369A1",
  skyLight: "#E0F2FE",

  // Legacy aliases for backwards compatibility
  blue: MAROON,
  blueMid: "#8B1F3A",
  blueLight: "#F5E6EA",
  bluePale: "#FDF5F7",
  gold: GOLD,
  goldLight: "#FDF8E8",
  goldDark: "#A68A3D",
  amber: "#B45309",
  amberLight: "#FFF7ED",
};

export const shadow = {
  sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)",
  lg: "0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
};

export const statusVariant = (s: string): string => {
  const map: Record<string, string> = {
    // Success states - green
    Approved: "green",
    Published: "green",
    Selected: "green",
    Completed: "green",
    Accepted: "green",
    Joined: "green",
    Active: "green",

    // Pending states - gold/accent
    Pending: "accent",
    Screening: "accent",
    Initiated: "accent",
    Draft: "accent",
    Hold: "accent",
    "Documents Pending": "accent",
    "Send Back": "accent",
    Inactive: "accent",

    // Error/negative states - red
    Rejected: "red",
    Unpublished: "red",
    Expired: "red",
    Terminate: "red",

    // In progress states
    Shortlisted: "primary",
    Applied: "sky",
    Interview: "violet",
    Sent: "teal",

    // Types
    "Full-time": "primary",
    "Part-time": "teal",
    Internal: "primary",
    External: "teal",

    // Other
    Inactive: "accent",
  };
  return map[s] || "gray";
};

export const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Active: { bg: T.greenLight, color: T.green, border: "#A7F3D0" },
  Inactive: { bg: T.amberLight, color: T.amber, border: "#FDE68A" },
  Terminate: { bg: T.redLight, color: T.red, border: "#FECACA" },
};
