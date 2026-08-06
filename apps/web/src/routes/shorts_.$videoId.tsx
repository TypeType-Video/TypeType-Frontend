import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { shortsPathRedirectSearch } from "../lib/shorts-route";

export const Route = createFileRoute("/shorts_/$videoId")({
  beforeLoad: ({ params }) => {
    const search = shortsPathRedirectSearch(params.videoId);
    if (!search) throw notFound();
    throw redirect({ to: "/shorts", search, replace: true });
  },
});
