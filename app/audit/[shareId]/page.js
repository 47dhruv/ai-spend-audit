// app/audit/[shareId]/page.js
// Share link handler — not yet implemented.
// Redirects to the audit form until share functionality is built.

import { redirect } from "next/navigation";

export default function SharePage({ params }) {
  // TODO: Implement shared audit report retrieval by shareId
  // For now, redirect to the main audit form
  redirect("/");
}
