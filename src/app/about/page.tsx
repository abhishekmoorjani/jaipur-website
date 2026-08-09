import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Redirect stub to a homepage anchor, not a page of its own. Kept out of the
// index so it cannot compete with the homepage as a thin duplicate.
export const metadata: Metadata = { robots: { index: false, follow: true } };

export default function AboutPage() {
  redirect("/#about");
}
