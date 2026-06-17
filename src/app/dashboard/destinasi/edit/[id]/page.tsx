"use client";
import { useParams } from "next/navigation";
import DestinasiForm from "@/components/admin/DestinasiForm";
export default function EditDestinasiPage() {
  const { id } = useParams() as { id: string };
  return <DestinasiForm mode="edit" editId={id} />;
}
