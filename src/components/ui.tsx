import React from "react";
import { T, shadow } from "../theme";
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
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 99,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
        display: "inline-block",
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
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      boxShadow: shadow.sm,
      width: "100%",
      overflow: "hidden",
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
}: {
  label: string;
  variant?: string;
  small?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
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
      style={{
        background: v.bg,
        color: v.color,
        border: `1.5px solid ${v.border}`,
        borderRadius: 8,
        padding: small ? "5px 12px" : "8px 18px",
        fontSize: small ? 12 : 13,
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
        lineHeight: 1.4,
        transition: "all 0.15s",
        minWidth: 0,
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
    style={{
      border: `1.5px solid ${T.border}`,
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 13,
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
}: {
  cols: string[];
  rows: React.ReactNode[][];
  onRowClick?: (rowIndex: number) => void;
  onRowDoubleClick?: (rowIndex: number) => void;
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
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              cursor: onRowClick ? "pointer" : "default",
            }}
          >
            {cols.map(
              (col, j) =>
                row[j] !== undefined && (
                  <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: T.inkFaint,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        minWidth: 90,
                        paddingTop: 2,
                      }}
                    >
                      {col}
                    </span>
                    <span style={{ fontSize: 13, color: T.ink, flex: 1 }}>{row[j]}</span>
                  </div>
                ),
            )}
          </div>
        ))}
        {rows.length === 0 && (
          <div style={{ padding: "40px 24px", textAlign: "center", color: T.inkFaint, fontSize: 13 }}>
            No records found.
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: T.canvas, borderBottom: `1px solid ${T.border}` }}>
            {cols.map((c) => (
              <th
                key={c}
                style={{
                  textAlign: "left",
                  padding: "10px 16px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.inkLight,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
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
              style={{
                borderBottom: `1px solid ${T.border}`,
                transition: "background 0.1s",
                cursor: onRowClick ? "pointer" : "default",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = T.canvas)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "13px 16px", verticalAlign: "middle", color: T.ink, whiteSpace: "normal", wordBreak: "break-word", maxWidth: 220 }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div style={{ padding: "40px 24px", textAlign: "center", color: T.inkFaint, fontSize: 13 }}>
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
            fontSize: bp === "mobile" ? 17 : 20,
            fontWeight: 800,
            color: T.ink,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: T.inkLight }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const Mono = ({ v }: { v: string }) => (
  <span
    style={{
      fontFamily: "monospace",
      fontSize: 12,
      color: T.primary,
      background: T.primaryLight,
      padding: "2px 6px",
      borderRadius: 5,
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
      resize: "vertical",
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
      <Card style={{ width: "100%", maxWidth: bp === "mobile" ? "100%" : maxWidth, padding: bp === "mobile" ? 16 : 24, maxHeight: "90vh", overflowY: "auto" }}>
        {children}
      </Card>
    </div>
  );
};

export const ModalHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: T.ink }}>{title}</h2>
    <button
      onClick={onClose}
      style={{ background: "none", border: "none", fontSize: 22, color: T.inkFaint, cursor: "pointer", lineHeight: 1 }}
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
        fontSize: 12,
        fontWeight: 700,
        color: T.inkLight,
        display: "block",
        marginBottom: 6,
      }}
    >
      {label}
      {required && <span style={{ color: T.red }}> *</span>}
    </label>
    {children}
  </div>
);
