import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { SettingsYoutubeBuffer } from "../src/settings/settings-youtube-buffer";

test("YouTube buffer exposes an accessible slider with exactly four stops", () => {
  const html = renderToStaticMarkup(<SettingsYoutubeBuffer />);
  expect(html).toContain('type="range"');
  expect(html).toContain('name="youtube-buffer"');
  expect(html).toContain('min="0"');
  expect(html).toContain('max="3"');
  expect(html).toContain('step="1"');
  expect(html).toMatch(/<input[^>]*name="youtube-buffer"[^>]*value="1"/);
  expect(html).toContain("--color-zinc-500) 33.3333");
  expect(html).toContain("aria-labelledby=");
  expect(html).toContain("aria-describedby=");
  expect(html).toContain("aria-valuetext=");
  expect(html).toContain("accent-fg-soft");
  expect(html.match(/<option /g)).toHaveLength(4);
  expect(html).not.toContain('type="radio"');
});
