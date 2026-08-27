import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const messagesDir = path.join(root, "apps/web/messages");
const source = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));
const sourceKeys = Object.keys(source).filter((key) => key !== "$schema");
const localeFiles = fs
  .readdirSync(messagesDir)
  .filter((file) => file.endsWith(".json") && file !== "en.json")
  .sort();

function percentage(value, total) {
  return total === 0 ? 100 : Math.round((value / total) * 1000) / 10;
}

const rows = localeFiles.map((file) => {
  const locale = JSON.parse(fs.readFileSync(path.join(messagesDir, file), "utf8"));
  const present = sourceKeys.filter((key) => typeof locale[key] === "string" && locale[key].trim());
  const differsFromEnglish = present.filter((key) => locale[key] !== source[key]);
  return {
    locale: path.basename(file, ".json"),
    total: sourceKeys.length,
    present: present.length,
    differsFromEnglish: differsFromEnglish.length,
    coverage: percentage(present.length, sourceKeys.length),
    distinctCoverage: percentage(differsFromEnglish.length, sourceKeys.length),
  };
});

if (process.argv.includes("--markdown")) {
  console.log("## Translation status\n");
  console.log(
    "The catalog check measures key coverage. `Different from English` is only a hint because proper names and technical labels can be intentionally identical.\n",
  );
  console.log("| Locale | Keys | Present | Different from English | Key coverage |");
  console.log("| --- | ---: | ---: | ---: | ---: |");
  for (const row of rows) {
    console.log(
      `| ${row.locale} | ${row.total} | ${row.present} | ${row.differsFromEnglish} | ${row.coverage}% |`,
    );
  }
  process.exit(0);
}

console.log(JSON.stringify({ sourceKeys: sourceKeys.length, locales: rows }, null, 2));
