import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionGroupsPreview } from "../components/subscription-groups-preview";

export const Route = createFileRoute("/subscription-groups-preview")({
  component: SubscriptionGroupsPreview,
});
