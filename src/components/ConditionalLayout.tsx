"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import FloatingButtons from "./FloatingButtons";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main style={{ flex: 1, paddingTop: "80px" }}>
        {children}
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
