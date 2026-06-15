import React from "react";

export function SkeletonBlock({
  width = "100%",
  height = "20px",
  borderRadius = "8px",
  style = {}
}: {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "1rem", minHeight: "130px" }}>
      <SkeletonBlock width="40%" height="16px" />
      <SkeletonBlock width="80%" height="32px" borderRadius="10px" />
      <SkeletonBlock width="60%" height="14px" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="dash-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "350px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SkeletonBlock width="35%" height="24px" />
        <SkeletonBlock width="15%" height="20px" />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "1rem", padding: "1rem 0" }}>
        <SkeletonBlock width="10%" height="40%" />
        <SkeletonBlock width="10%" height="75%" />
        <SkeletonBlock width="10%" height="55%" />
        <SkeletonBlock width="10%" height="90%" />
        <SkeletonBlock width="10%" height="30%" />
        <SkeletonBlock width="10%" height="65%" />
        <SkeletonBlock width="10%" height="80%" />
        <SkeletonBlock width="10%" height="45%" />
        <SkeletonBlock width="10%" height="70%" />
        <SkeletonBlock width="10%" height="85%" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="dash-card" style={{ padding: "1.5rem 0" }}>
      <div style={{ padding: "0 1.5rem 1rem 1.5rem", display: "flex", justifyContent: "space-between" }}>
        <SkeletonBlock width="25%" height="24px" />
        <SkeletonBlock width="20%" height="36px" borderRadius="10px" />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid var(--dash-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "2rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 2 }}>
              <SkeletonBlock width="40px" height="40px" borderRadius="50%" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <SkeletonBlock width="70%" height="16px" />
                <SkeletonBlock width="40%" height="12px" />
              </div>
            </div>
            <SkeletonBlock width="20%" height="16px" style={{ flex: 1 }} />
            <SkeletonBlock width="15%" height="16px" style={{ flex: 1 }} />
            <SkeletonBlock width="10%" height="24px" borderRadius="12px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border)", backgroundColor: "white" }}>
          <SkeletonBlock width="100%" height="200px" borderRadius="0" />
          <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <SkeletonBlock width="30%" height="20px" borderRadius="999px" />
            <SkeletonBlock width="90%" height="18px" />
            <SkeletonBlock width="70%" height="18px" />
            <SkeletonBlock width="50%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PartnersSkeleton() {
  return (
    <div style={{ display: "flex", gap: "2rem", overflow: "hidden", padding: "1.5rem 0" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonBlock key={i} width="120px" height="56px" borderRadius="12px" style={{ flexShrink: 0 }} />
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="card" style={{ height: "500px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SkeletonBlock width="20%" height="24px" />
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <SkeletonBlock width="80px" height="32px" borderRadius="20px" />
          <SkeletonBlock width="80px" height="32px" borderRadius="20px" />
          <SkeletonBlock width="80px" height="32px" borderRadius="20px" />
        </div>
      </div>
      <div style={{ flex: 1, position: "relative" }}>
        <SkeletonBlock width="100%" height="100%" borderRadius="12px" />
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "var(--text-secondary)",
          fontWeight: 600
        }}>
          Memuat Peta Interaktif...
        </div>
      </div>
    </div>
  );
}
