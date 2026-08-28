import { createFileRoute } from "@tanstack/react-router";
import { DataPortabilityPage } from "../components/data-portability-page";

export const Route = createFileRoute("/export")({
  component: () => <DataPortabilityPage mode="export" />,
});
