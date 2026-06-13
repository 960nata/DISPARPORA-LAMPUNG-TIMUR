"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ChartSkeleton } from "./Skeleton";

// Dynamic import of ApexCharts
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <ChartSkeleton />
});

interface DashboardChartProps {
  options: any;
  series: any[];
  type: "line" | "area" | "bar" | "pie" | "donut" | "radialBar";
  height?: number | string;
}

export default function DashboardChart({ options, series, type, height = 350 }: DashboardChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ChartSkeleton />;
  }

  return (
    <ReactApexChart
      options={options}
      series={series}
      type={type}
      height={height}
    />
  );
}
