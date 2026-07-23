import { createFileRoute, redirect } from "@tanstack/react-router";

// The old guides page held placeholder articles that were never written.
// Point it at the real education content instead.
export const Route = createFileRoute("/guides")({
  beforeLoad: () => {
    throw redirect({ to: "/learn" });
  },
});
