import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchOverlayList } from "../src/components/search-overlay-list";
import { buildSearchOverlayItems } from "../src/lib/search-overlay-items";

describe("panoramic search list", () => {
  function render(showHistory: boolean, selectedIndex = -1) {
    return renderToStaticMarkup(
      <SearchOverlayList
        items={[
          {
            key: "h-1",
            label: "Eine sehr lange Suchanfrage mit Sonderzeichen <test>",
            source: "history",
          },
        ]}
        showHistory={showHistory}
        selectedIndex={selectedIndex}
        listRef={{ current: null }}
        onScroll={() => {}}
        onClearAll={() => {}}
        onSelect={() => {}}
      />,
    );
  }
  it("keeps full text, escapes markup and provides a history icon", () => {
    const html = render(true);
    expect(html).toContain("Eine sehr lange Suchanfrage mit Sonderzeichen &lt;test&gt;");
    expect(html).toContain("lucide-clock-3");
    expect(html).toContain("break-words");
  });
  it("keeps keyboard selection distinct and exposes stable item indices", () => {
    expect(render(true, 0)).toContain("bg-surface-soft text-fg");
    expect(render(true, 0)).toContain('data-item-index="0"');
  });
  it("merges matching history without duplicating server suggestions", () => {
    const items = buildSearchOverlayItems(
      "japon",
      [{ id: "1", term: "japon en train", searchedAt: 0 }],
      ["Japon en train", "japon documentaire"],
    );
    expect(items.map((item) => item.label)).toEqual(["japon en train", "japon documentaire"]);
  });
});
