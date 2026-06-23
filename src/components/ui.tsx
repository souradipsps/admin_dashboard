import React from "react";
import { T, shadow, font, radius, transition } from "../theme";
import { useBreakpoint } from "../hooks";

export const Badge = ({ label, variant = "gray" }: { label: string; variant?: string }) => {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    green: { bg: T.greenLight, color: T.green, border: "#A7F3D0" },
    red: { bg: T.redLight, color: T.red, border: "#FECACA" },
    amber: { bg: T.amberLight, color: T.amber, border: "#FDE68A" },
    accent: { bg: T.accentLight, color: T.accentDark, border: "#E8D5A8" },
    gold: { bg: T.accentLight, color: T.accentDark, border: "#E8D5A8" },
    primary: { bg: T.primaryLight, color: T.primary, border: "#E8D0D8" },
    blue: { bg: T.primaryLight, color: T.primary, border: "#E8D0D8" },
    teal: { bg: T.tealLight, color: T.teal, border: "#99E6E6" },
    violet: { bg: T.violetLight, color: T.violet, border: "#DDD6FE" },
    sky: { bg: T.skyLight, color: T.sky, border: "#BAE6FD" },
    gray: { bg: "#F5F5F5", color: T.inkLight, border: T.border },
  };
  const s = styles[variant] || styles.gray;
  return (
    <span
      className="animate-fade-in"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: radius.full,
        padding: "3px 10px",
        fontSize: font.sm,
        fontWeight: font.bold,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
        display: "inline-block",
        fontFamily: font.body,
        transition: transition.fast,
      }}
    >
      {label}
    </span>
  );
};

export const Card = ({
  children,
  style = {},
  onClick,
  hover = true,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  hover?: boolean;
  className?: string;
}) => (
  <div
    onClick={onClick}
    className={`${hover ? "card-hover" : ""} ${className || ""}`.trim() || undefined}
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: radius.lg,
      boxShadow: shadow.sm,
      width: "100%",
      overflow: "hidden",
      transition: transition.medium,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Btn = ({
  label,
  variant = "primary",
  small = false,
  onClick,
  style = {},
  className = "",
}: {
  label: string;
  variant?: string;
  small?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const variants: Record<string, { bg: string; color: string; border: string }> = {
    primary: { bg: T.primary, color: "#fff", border: T.primary },
    accent: { bg: T.accent, color: "#fff", border: T.accent },
    teal: { bg: T.teal, color: "#fff", border: T.teal },
    gold: { bg: T.accent, color: "#fff", border: T.accent },
    outline: { bg: "#fff", color: T.primary, border: T.primary },
    ghost: { bg: "transparent", color: T.inkLight, border: T.border },
    danger: { bg: T.redLight, color: T.red, border: "#FECACA" },
    success: { bg: T.greenLight, color: T.green, border: "#A7F3D0" },
    amber: { bg: T.amberLight, color: T.amber, border: "#FDE68A" },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      onClick={onClick}
      className={`btn-hover ${className}`}
      style={{
        background: v.bg,
        color: v.color,
        border: `1.5px solid ${v.border}`,
        borderRadius: radius.md,
        padding: small ? "5px 12px" : "8px 18px",
        fontSize: small ? font.sm + 1 : font.base,
        fontWeight: font.bold,
        fontFamily: font.body,
        cursor: "pointer",
        whiteSpace: "nowrap",
        lineHeight: 1.4,
        transition: transition.fast,
        minWidth: 0,
        letterSpacing: "0.01em",
        ...style,
      }}
    >
      {label}
    </button>
  );
};

export const Input = ({
  placeholder,
  value,
  onChange,
  style = {},
  type = "text",
}: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
  type?: string;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="input-focus"
    style={{
      border: `1.5px solid ${T.border}`,
      borderRadius: radius.md,
      padding: "9px 13px",
      fontSize: font.base,
      fontFamily: font.body,
      color: T.ink,
      background: "#fff",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      transition: transition.fast,
      letterSpacing: "-0.01em",
      ...style,
    }}
  />
);

export const Select = ({
  value,
  onChange,
  options,
  placeholder,
  style = {},
}: {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  style?: React.CSSProperties;
}) => (
  <select
    value={value}
    onChange={onChange}
    className="select-focus"
    style={{
      border: `1.5px solid ${T.border}`,
      borderRadius: radius.md,
      padding: "9px 13px",
      fontSize: font.base,
      fontFamily: font.body,
      color: value ? T.ink : T.inkFaint,
      background: "#fff",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      cursor: "pointer",
      appearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B6B6B' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 12px center",
      paddingRight: 32,
      transition: transition.fast,
      letterSpacing: "-0.01em",
      ...style,
    }}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

export const Table = ({
  cols,
  rows,
  onRowClick,
  onRowDoubleClick,
  bordered = false,
  widths,
}: {
  cols: string[];
  rows: React.ReactNode[][];
  onRowClick?: (rowIndex: number) => void;
  onRowDoubleClick?: (rowIndex: number) => void;
  bordered?: boolean;
  widths?: string[];
}) => {
  const bp = useBreakpoint();
  if (bp === "mobile") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {rows.map((row, i) => (
          <div
            key={i}
            onClick={() => onRowClick && onRowClick(i)}
            onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(i)}
            className="animate-fade-in-up"
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              cursor: onRowClick ? "pointer" : "default",
              animationDelay: `${i * 0.03}s`,
              transition: transition.fast,
            }}
          >
            {cols.map(
              (col, j) =>
                row[j] !== undefined && (
                  <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: font.xs,
                        fontWeight: font.bold,
                        fontFamily: font.body,
                        color: T.inkFaint,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        minWidth: 90,
                        paddingTop: 2,
                      }}
                    >
                      {col}
                    </span>
                    <span style={{ fontSize: font.base, fontFamily: font.body, color: T.ink, flex: 1 }}>{row[j]}</span>
                  </div>
                ),
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ padding: "40px 24px", textAlign: "center", color: T.inkFaint, fontSize: font.base, fontFamily: font.body }}>
            No records found.
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: font.base, fontFamily: font.body, border: bordered ? `1px solid ${T.border}` : "none" }}>
        <thead>
          <tr style={{ background: T.canvas, borderBottom: `1.5px solid ${T.border}` }}>
            {cols.map((c, j) => (
              <th
                key={c}
                style={{
                  textAlign: j === 0 || j === 7 || j === 8 ? "center" : "left",
                  padding: "12px 16px",
                  fontSize: font.xs,
                  fontWeight: font.bold,
                  fontFamily: font.body,
                  color: T.inkLight,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                  borderRight: (bordered && j < cols.length - 1) ? `1px solid ${T.border}` : "none",
                  width: widths ? widths[j] : undefined,
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick && onRowClick(i)}
              onDoubleClick={() => onRowDoubleClick && onRowDoubleClick(i)}
              className="row-hover"
              style={{
                borderBottom: `1px solid ${T.border}`,
                cursor: onRowClick ? "pointer" : "default",
              }}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "13px 16px",
                    verticalAlign: "middle",
                    color: T.ink,
                    fontFamily: font.body,
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    maxWidth: widths ? undefined : 220,
                    borderRight: (bordered && j < row.length - 1) ? `1px solid ${T.border}` : "none",
                    width: widths ? widths[j] : undefined,
                    textAlign: j === 0 || j === 7 || j === 8 ? "center" : "left",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div style={{ padding: "40px 24px", textAlign: "center", color: T.inkFaint, fontSize: font.base, fontFamily: font.body }}>
          No records found.
        </div>
      )}
    </div>
  );
};

export const SectionTitle = ({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) => {
  const bp = useBreakpoint();
  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: bp === "mobile" ? "flex-start" : "center",
        flexDirection: bp === "mobile" ? "column" : "row",
        gap: bp === "mobile" ? 12 : 0,
        marginBottom: 24,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: bp === "mobile" ? font.xl : font['2xl'],
            fontWeight: font.extrabold,
            fontFamily: font.heading,
            color: T.ink,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>
        {sub && (
          <p style={{
            margin: "6px 0 0",
            fontSize: font.base,
            fontFamily: font.body,
            color: T.inkLight,
            letterSpacing: "-0.01em",
          }}>
            {sub}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const Mono = ({ v }: { v: string }) => (
  <span
    style={{
      fontFamily: font.mono,
      fontSize: font.sm + 1,
      fontWeight: font.semibold,
      color: T.primary,
      background: T.primaryLight,
      padding: "2px 7px",
      borderRadius: radius.sm,
      letterSpacing: "0.02em",
    }}
  >
    {v}
  </span>
);

export const Textarea = ({
  value,
  onChange,
  placeholder,
  rows = 4,
  style = {},
}: {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  style?: React.CSSProperties;
}) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="input-focus"
    style={{
      border: `1.5px solid ${T.border}`,
      borderRadius: radius.md,
      padding: "9px 13px",
      fontSize: font.base,
      fontFamily: font.body,
      color: T.ink,
      background: "#fff",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      resize: "vertical",
      transition: transition.fast,
      letterSpacing: "-0.01em",
      ...style,
    }}
  />
);

export const Modal = ({
  open,
  onClose,
  children,
  maxWidth = 600,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}) => {
  const bp = useBreakpoint();
  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: bp === "mobile" ? 12 : 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card
        hover={false}
        className="modal-content"
        style={{
          width: "100%",
          maxWidth: bp === "mobile" ? "100%" : maxWidth,
          padding: bp === "mobile" ? 16 : 24,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: shadow.xl,
          animation: "scaleIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        {children}
      </Card>
    </div>
  );
};

export const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
    <h2 style={{
      margin: 0,
      fontSize: font.xl,
      fontWeight: font.extrabold,
      fontFamily: font.heading,
      color: T.ink,
      letterSpacing: "-0.02em",
    }}>
      {title}
    </h2>
    <button
      onClick={onClose}
      className="close-btn"
      style={{
        background: T.canvas,
        border: `1px solid ${T.border}`,
        borderRadius: radius.md,
        width: 34,
        height: 34,
        fontSize: 20,
        fontWeight: "bold",
        color: T.inkFaint,
        cursor: "pointer",
        lineHeight: 1,
        padding: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: transition.fast,
      }}
    >
      ×
    </button>
  </div>
);

export const FormRow = ({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      gap: 14,
      marginBottom: 14,
      width: "100%",
    }}
  >
    {children}
  </div>
);

export const FormField = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label
      style={{
        fontSize: font.sm + 1,
        fontWeight: font.bold,
        fontFamily: font.body,
        color: T.inkLight,
        display: "block",
        marginBottom: 6,
        letterSpacing: "0.02em",
        textTransform: "uppercase" as const,
      }}
    >
      {label}
      {required && <span style={{ color: T.red }}> *</span>}
    </label>
    {children}
  </div>
);
