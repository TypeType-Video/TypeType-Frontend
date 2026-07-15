# Contributing to TypeType Frontend

Thank you for helping improve the TypeType web client.

## Scope

This repository owns browser-facing TypeType behavior: routes, components, settings, client state, API integration, and the playback interface.

Open bug reports and feature requests in the [central TypeType issue tracker](https://github.com/TypeType-Video/TypeType/issues). Mention that the problem affects `TypeType-Frontend` and link the issue from your pull request.

Changes to the MSE and SABR engine belong in [TypeType-Player](https://github.com/TypeType-Video/TypeType-Player). API, extraction, authentication, and persistence changes belong in [TypeType-Server](https://github.com/TypeType-Video/TypeType-Server).

## Set up the project

Use Bun 1.3.14 and a running TypeType-Server.

```sh
git switch dev
bun install --frozen-lockfile
cp apps/web/.env.example apps/web/.env
bun run dev
```

The default frontend URL is `http://localhost:5173`. Set `VITE_API_URL` and `VITE_DEV_PROXY_TARGET` in `apps/web/.env` when the backend is not available at `http://localhost:8080`.

## Implementation expectations

- Follow the existing route, hook, API client, store, and component patterns.
- Keep backend access behind the TypeType HTTP API.
- Keep playback engine behavior inside `@typetype/mse`; this repository owns its UI integration.
- Reuse the existing design tokens, components, and icon library.
- Preserve keyboard access, visible focus states, semantic controls, and readable contrast.
- Check interface changes on mobile and desktop in both light and dark themes.
- Add focused tests for changed behavior and regressions.
- Keep unrelated formatting and refactors out of the pull request.

## Required checks

Run the same checks as CI before opening the pull request:

```sh
bun run check
bun run test
bun run knip
bun run sherif
bun run build
```

For a visible change, also verify the affected flow in the browser and include screenshots or a short recording in the pull request.

## Commits and pull requests

Create your branch from `dev` and open the pull request against `dev`.

Use commit messages in this form:

```text
type: short description
```

Common types are `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, and `style`. Use the imperative mood and keep the first line under 72 characters.

The pull request should explain what changed, why it changed, which issue it addresses, how it was tested, and whether a server or player change is also required.

Contributions to this repository are distributed under the [MIT License](LICENSE).
