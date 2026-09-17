# TypeType frontend

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product purpose

TypeType's browser client supports watching videos and managing channel subscriptions. Subscription groups organize the same shared subscription library and filter its channel list and video feed.

## Capabilities and constraints

- Users can put a channel in multiple groups or leave it ungrouped.
- Group membership is independent of subscription status. Deleting a group or removing memberships must preserve subscriptions.
- Subscription group UX follows the contributor's prototypes and the project maintainer's feedback in [TypeType #172](https://github.com/TypeType-Video/TypeType/issues/172#issuecomment-5433024163).
- The user approved a dedicated manager and desktop-first implementation. Compact mobile composition is deferred until the desktop version is finalized.
- This PR delivers desktop management using the existing unpaged API. Server pagination/search and large-library optimization are deferred; client pagination only controls the visible layout.
- Organizing only the channels added by an import is deferred. The post-import link opens the full library and does not implement that workflow.
- Browser behavior belongs in this repository. Persistence and membership contracts belong to TypeType-Server.

## Evidence and scope

The current feature brief and implementation direction are recorded in [Subscription group manager](docs/subscription-groups-ux.md). This record captures the confirmed subscription-group scope; broader audience research and product positioning remain unspecified.
