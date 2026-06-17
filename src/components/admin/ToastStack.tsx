"use client";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToast, ToastType } from "@/contexts/ToastContext";

const CFG: Record<ToastType, { icon: React.ReactNode; color: string; bg: string; bar: string; border: string }> = {
  success: {
    icon: <CheckCircle2 size={19} />,
    color: "#059669", bg: "#f0fdf4", bar: "#34d399", border: "#bbf7d0",
  },
  error: {
    icon: <XCircle size={19} />,
    color: "#dc2626", bg: "#fef2f2", bar: "#f87171", border: "#fecaca",
  },
  warning: {
    icon: <AlertTriangle size={19} />,
    color: "#d97706", bg: "#fffbeb", bar: "#fbbf24", border: "#fde68a",
  },
  info: {
    icon: <Info size={19} />,
    color: "#6d28d9", bg: "#f5f3ff", bar: "#a78bfa", border: "#ddd6fe",
  },
};

export default function ToastStack() {
  const { toasts, dismiss } = useToast();
  if (!toasts.length) return null;

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(calc(100% + 24px)); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toast-bar {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .toast-item {
          animation: toast-slide-in 0.32s cubic-bezier(0.34, 1.4, 0.64, 1) both;
        }
        .toast-close:hover { background: rgba(0,0,0,0.06) !important; }
      `}</style>

      <div style={{
        position: "fixed",
        top: "76px",
        right: "20px",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "340px",
        pointerEvents: "none",
      }}>
        {toasts.map(t => {
          const c = CFG[t.type];
          return (
            <div
              key={t.id}
              className="toast-item"
              style={{
                pointerEvents: "all",
                background: "var(--dash-card, #fff)",
                borderRadius: "16px",
                border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${c.color}`,
                boxShadow: "0 12px 40px -8px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.06)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 12px 16px 16px" }}>
                {/* Icon bubble */}
                <div style={{
                  flexShrink: 0,
                  width: "36px", height: "36px",
                  borderRadius: "10px",
                  background: c.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: c.color,
                }}>
                  {c.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: "1px" }}>
                  <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700, color: "var(--dash-text, #0f172a)", lineHeight: 1.35 }}>
                    {t.title}
                  </p>
                  {t.message && (
                    <p style={{ margin: "5px 0 0", fontSize: "0.78rem", color: "var(--dash-text-muted, #64748b)", lineHeight: 1.5 }}>
                      {t.message}
                    </p>
                  )}
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => dismiss(t.id)}
                  className="toast-close"
                  style={{
                    flexShrink: 0,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--dash-text-muted, #94a3b8)",
                    padding: "4px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "-2px",
                    transition: "background 0.15s",
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Progress bar */}
              {t.duration > 0 && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: c.border }}>
                  <div style={{
                    height: "100%",
                    background: c.bar,
                    borderRadius: "0 0 16px 16px",
                    animation: `toast-bar ${t.duration}ms linear forwards`,
                  }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
