# Localization

TypeType stores interface translations in `apps/web/messages`.
English is the source catalog. The Weblate component is scoped to
`apps/web/messages/*.json`; it must never import or edit the generated files in
`apps/web/src/paraglide`.

## For Contributors

Use [Weblate](https://translate.typetype.video/engage/typetype/) to translate
without writing code. Select a language, translate the available messages, and
submit the proposed changes there. Weblate sends the resulting catalog changes
back as a pull request targeting `dev`, where the normal checks validate keys,
placeholders, and the frontend build.

The [translation status badge](https://translate.typetype.video/engage/typetype/)
in the README is supplied by Weblate. For a local, reproducible snapshot, run:

```sh
bun run localization:report -- --markdown
```

The report distinguishes complete key coverage from values that differ from
English. The latter is only an indicator because product names and technical
labels can intentionally remain identical.

To add a language:

1. Add its BCP 47 code to `locales` in `apps/web/project.inlang/settings.json`.
2. Add a matching JSON catalog in `apps/web/messages`.
3. Translate existing values without changing their keys or parameters.
4. Add the language to the interface selector.
5. Run `bun run build`, `bun test`, and `bun run check` from the repository root.

Missing messages fall back to English. Keep product names, protocol names, and
provider names unchanged unless their official localization differs. Never edit
`apps/web/src/paraglide` by hand; regenerate it with `bun run localize`.
