# Localization

TypeType stores interface translations in `apps/web/messages`.
English is the source catalog and every translation stays in this repository.
No hosted translation account is required.

To add a language:

1. Add its BCP 47 code to `locales` in `apps/web/project.inlang/settings.json`.
2. Add a matching JSON catalog in `apps/web/messages`.
3. Translate existing values without changing their keys or parameters.
4. Add the language to the interface selector.
5. Run `bun run build`, `bun test`, and `bun run check` from the repository root.

Missing messages fall back to English. Keep product names, protocol names, and
provider names unchanged unless their official localization differs.
