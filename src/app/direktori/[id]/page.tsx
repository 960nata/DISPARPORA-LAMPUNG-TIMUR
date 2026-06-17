"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DirRedirect() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  useEffect(() => { router.replace(`/destinasi/${id}`); }, [id, router]);
  return null;
}
