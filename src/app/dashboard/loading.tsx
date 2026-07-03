"use client";

import { SkeletonBlock, StatCardSkeleton, TableSkeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Title block */}
      <div>
        <SkeletonBlock width="180px" height="28px" borderRadius="6px" />
        <SkeletonBlock width="320px" height="16px" borderRadius="4px" style={{ marginTop: "8px" }} />
      </div>

      {/* Grid of Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={5} />
    </div>
  );
}
