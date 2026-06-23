const MAROON = "#72102a";
const GOLD = "#c9a84c";
const CREAM = "#faf8f5";

export const T = {
  // Primary brand colors
  primary: MAROON,
  primaryMid: "#8B1F3A",
  primaryLight: "#F5E6EA",
  primaryPale: "#FDF5F7",
  primaryDark: "#5C0C21",

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
  tealDark: "#006666",
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

/* ── Shadow System ── */
export const shadow = {
  sm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)",
  lg: "0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
  xl: "0 16px 48px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.05)",
  // Colored shadows for premium feel
  primary: "0 8px 24px rgba(114, 16, 42, 0.15), 0 4px 8px rgba(114, 16, 42, 0.08)",
  accent: "0 8px 24px rgba(201, 168, 76, 0.2), 0 4px 8px rgba(201, 168, 76, 0.1)",
  teal: "0 8px 24px rgba(0, 139, 139, 0.15), 0 4px 8px rgba(0, 139, 139, 0.08)",
  inner: "inset 0 2px 4px rgba(0,0,0,0.04)",
};

/* ── Font System ── */
export const font = {
  heading: "'Outfit', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  // Font sizes
  xs: 10,
  sm: 11,
  base: 13,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
  '4xl': 34,
  // Font weights
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

/* ── Border Radius ── */
export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

/* ── Transitions ── */
export const transition = {
  fast: "all 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
  medium: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
  slow: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
  spring: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
};

/* ── Spacing Scale ── */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
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
    Initiated: "accent",
    Draft: "accent",
    Hold: "accent",
    "Documents Pending": "accent",
    "Sent Back": "accent",
    Inactive: "accent",

    // Error/negative states - red
    Rejected: "red",
    Unpublished: "red",
    Expired: "red",
    Terminate: "red",

    // In progress states
    Shortlisted: "primary",
    Applied: "sky",
    Sent: "teal",

    // Types
    "Full-time": "primary",
    "Part-time": "teal",
    Internal: "primary",
    External: "teal",

  };
  return map[s] || "gray";
};

export const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  Active: { bg: T.greenLight, color: T.green, border: "#A7F3D0" },
  Inactive: { bg: T.amberLight, color: T.amber, border: "#FDE68A" },
  Terminate: { bg: T.redLight, color: T.red, border: "#FECACA" },
};
