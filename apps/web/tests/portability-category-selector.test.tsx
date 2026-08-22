import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { PortabilityCategorySelector } from "../src/components/portability-category-selector";

test("shows complete, partial, and unavailable portability categories", () => {
  const markup = renderToStaticMarkup(
    <PortabilityCategorySelector
      available={new Set(["subscriptions", "history"])}
      selected={new Set(["subscriptions"])}
      fidelity={{ subscriptions: "complete", history: "partial" }}
      onToggle={() => undefined}
    />,
  );

  expect(markup).toContain('aria-label="Supported"');
  expect(markup).toContain('aria-label="Partial support"');
  expect(markup).toContain('aria-label="Not supported"');
  expect(markup).toContain("disabled");
});
