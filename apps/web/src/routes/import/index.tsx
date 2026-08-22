import { createFileRoute } from "@tanstack/react-router";
import { DataPortabilityPage } from "../../components/data-portability-page";

export const Route = createFileRoute("/import/")({
  component: () => <DataPortabilityPage mode="import" />,
});
