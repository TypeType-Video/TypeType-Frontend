# Subscription group manager

Desktop implementation of [TypeType #172](https://github.com/TypeType-Video/TypeType/issues/172), based on the contributor's two prototypes and the maintainer's feedback. Compact mobile composition is deferred by request.

## Direction contract

**THESIS:** One shared channel library, with groups as filters and selection independent of the current view. Users organize subscriptions without losing context.

**OWN-WORLD:** Inherit TypeType's neutral surface, foreground, border and accent tokens, existing type, channel avatars and Lucide icons. Support its light and dark themes.

**STORY:** Open Manage groups from Channels, find a channel or group, edit one row or select channels across filters, apply changes, and inspect the result. Grouping remains optional.

**FIRST VIEWPORT:** A compact title and return link above a two-column workspace. Group filters and inline creation on the left; search, membership scope and a sticky selection/action toolbar above channel rows on the right. Editing replaces the row's membership display with one compact combobox and adjacent Save/Cancel buttons.

**FORM:** The user-approved desktop prototype; no concept seed needed for this specified extension. Clicking a row outside its channel-name link and editor controls toggles its checkbox and highlights the row. Exactly one selected channel shows the inline editor; multiple selections show membership chips and use the bulk toolbar. Selection count includes channels hidden by filters. The original two-arrow Invert button remains a one-click toggle beside Select results; its label shows the current view, In group or Not in group. It is disabled for All channels, Ungrouped and Show selected. Selection survives toggling, and counts disclose hidden selections. Removing all memberships and deleting a group require confirmation.

**INLINE EDITOR:** Match the [original GIF](https://github.com/TypeType-Video/TypeType/issues/172#issuecomment-5433024163) and the token-input interaction in [ROCKNIX DB filters](https://rocknix-steamdb.pages.dev/). Selected groups are removable chips inside the field. Available groups appear as plain options in a searchable, scrollable dropdown; there is no expanded checkbox grid. Choosing an option keeps the field ready for another group. Drafts survive filtering and temporary multiple selection while their channel remains selected. Successful Save or Cancel clears selection; Cancel discards the draft. Escape closes the dropdown first, then cancels editing on a second press. Opening the editor preserves focus on the checkbox or search control so keyboard selection and filtering remain usable.

**FINISH:** Desktop behavior, keyboard interactions, light/dark rendering and error recovery verified within the scope recorded below. The manager extends the inherited system without new raster assets.

## Integration

- `/subscriptions/groups` is the dedicated manager. Videos and Channels expose ordinary group filters.
- Read group definitions and the complete channel membership projection separately. Existing shared subscription payloads remain compatible.
- Batch membership changes in chunks of at most 500 channels per group. Multi-group operations can partially succeed; refetch actual state and retain failed work for retry.
- Preserve current filters after mutations. Selection survives search and group changes; selecting results adds to the selection.
- Selecting a named sidebar group defaults the bulk Add/Remove target to that group. Users can override it; searching, changing row selection and toggling In group/Not in group preserve that override. Changing sidebar groups resets the target to the new group; All channels and Ungrouped start without a target.
- Import completion may offer an optional link into the same manager.

## Inherited visual system

The existing [subscription header](../apps/web/src/components/subscriptions-header.tsx) and [group preview](../apps/web/src/components/subscription-groups-preview.tsx) are the visual references. [Theme tokens](../apps/web/src/styles/theme.css), imported by [index.css](../apps/web/src/index.css), remain the source of truth. These notes apply to the subscription group manager.

| Element | Inherited treatment in the finished manager |
| --- | --- |
| Colors | `app` and `surface` provide the neutral canvas; `surface-strong` marks selection and hover. `fg`, `fg-muted`, `border` and `border-strong` preserve the existing hierarchy. Light mode uses the existing zinc-token remapping. |
| Actions and feedback | Foreground-filled Add and Save buttons use app-colored text, matching the preview's primary actions. The enabled membership toggle has a filled surface, prominent border and pointer cursor in both states; Not in group uses foreground fill to distinguish the active state. Accent color marks checkboxes and keyboard focus; danger color marks errors and destructive actions. |
| Typography | The existing font stack is inherited. The page title matches the subscription header (24 px, semibold, tight tracking). Channel names and standard fields use 14 px type; controls, chips, the combobox and supporting counts use 12 px type. |
| Surfaces and shapes | Rectangular bordered panels, controls and chips follow the preview. Border and surface tone separate content; the manager adds no shadows. The confirmation dialog uses a dimmed backdrop. |
| Channel identity | Existing `ChannelAvatar` and `ChannelRouteLink` components carry channel identity; Lucide supplies the small action icons. Avatars remain 36 px in channel rows. |
| Density and layout | The desktop workspace uses a 220 px group column, a flexible channel column and a 16 px gap within a 1440 px maximum width. The group sidebar and action toolbar stay visible while scrolling. Rows retain compact spacing and wrap membership chips. |

The [manager stylesheet](../apps/web/src/styles/subscription-groups.css) consolidates the local button, chip and menu treatments. Shared action buttons have a 36 px minimum height; keyboard focus uses a 2 px accent outline with a 3 px offset. The combobox outlines the entire field with a 2 px offset and suppresses the inner input outline. Search fields and native selects share the bordered input treatment. Compact mobile composition remains deferred.

## Verification scope

- Final automated checks after defaulting the bulk target from the sidebar: 343 tests passed; `check`, `knip`, `sherif`, the production build and `git diff --check` passed.
- Bulk-target browser checks confirmed Tech and Science sidebar selections populate the target, a manual Music override survives inversion and search, and All channels/Ungrouped reset the target. Existing channel selections were preserved throughout.
- Row-selection checks covered background clicks, checkbox keyboard activation, highlighted rows in both themes, one/two/21 selections, hidden selections, retained drafts across filtering and multiple selection, Cancel, successful Save, and failed-save retry. Exactly one globally selected channel exposed an editor when visible. The local fixture's original memberships were restored after testing.
- The restored two-arrow toggle was compared with the original bulk-edit GIF and inspected in light and dark themes. Clicking switched Tech from 5 members to 16 non-members; Enter switched back. The selected channel and hidden-selection count survived both views. The control was disabled for All channels, Ungrouped and Show selected.
- The button visibility refinement was inspected in both states and themes, with click and keyboard toggling verified. `check`, the production build and the whitespace check passed after the styling change.
- Desktop browser checks used a disposable local API fixture in the in-app browser (Chromium). The corrected combobox was inspected in light and dark themes. At a 1280 × 800 CSS viewport, the ordinary inline form remained 36 px high without horizontal overflow; a bottom-row dropdown opened above the field and fit the viewport.
- The implementer and an independent reviewer compared the corrected editor with frames from the original #172 GIF. The reviewer also inspected fresh 2560 × 1440 desktop captures and found no material issues.
- Large-group checks used 107 groups: the dropdown contained 106 unselected plain options and zero group checkboxes, with 3816 px of content scrolling inside a 222 px viewport. With 21 selected chips, the chip region stayed capped at 96 px while its 326 px content scrolled; the input remained visible after adding a chip.
- Corrected-editor interactions: Enter added a group; Escape closed the dropdown, then cancelled editing on a second press; Cancel restored the original Tech membership. A failed Save preserved the Science draft and allowed retry; retry saved Science and Tech successfully. The fixture's original Tech membership was then restored.
- Earlier manager checks covered group creation, rename and deletion; bulk selection across filters; partial-failure retry; confirmations; preserved subscriptions; rename focus restoration; empty Show selected recovery; and clearing stale errors.
- Firefox, WebKit and live-backend integration were not checked. Mobile composition was explicitly deferred. The checks above do not establish complete browser or accessibility coverage.
