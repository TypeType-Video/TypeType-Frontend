import type { Locale } from "../../paraglide/runtime.js";
import { EnglishFlag } from "./english-flag";
import { FrenchFlag } from "./french-flag";
import { GermanFlag } from "./german-flag";
import { SimplifiedChineseFlag } from "./simplified-chinese-flag";

export function LanguageFlag({ locale }: { locale: Locale }) {
  if (locale === "zh-Hans-CN") return <SimplifiedChineseFlag />;
  if (locale === "fr") return <FrenchFlag />;
  if (locale === "de") return <GermanFlag />;
  return <EnglishFlag />;
}
