"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = "G-J2PL8ZK042";

// Anonymous per-tab session token (resets when the tab closes).
function getSession(): string {
  try {
    let s = sessionStorage.getItem("simad_sid");
    if (!s) {
      s = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("simad_sid", s);
    }
    return s;
  } catch {
    return "";
  }
}

// Anonymous per-device token used only to tell "new" vs "returning" visitors.
// Not an identity, not an IP — just a random string in this browser.
function getVisitor(): { visitor: string; isNew: boolean } {
  try {
    let v = localStorage.getItem("simad_vid");
    const isNew = !v;
    if (!v) {
      v = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("simad_vid", v);
    }
    return { visitor: v, isNew };
  } catch {
    return { visitor: "", isNew: true };
  }
}

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const url = query ? `${pathname}?${query}` : pathname;

    // 1) Google Analytics 4
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: url,
        page_location: window.location.href,
        page_title: document.title,
      });
    }

    // 2) Our own traffic store (powers the dashboard)
    const { visitor, isNew } = getVisitor();
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, session: getSession(), visitor, isNew }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, searchParams]);

  return null;
}

export default function Analytics() {
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}
