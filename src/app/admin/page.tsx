import { redirect } from "next/navigation";

// Pintu masuk admin. Akses login dashboard hanya lewat /admin.
export default function AdminEntry() {
  redirect("/dashboard");
}
