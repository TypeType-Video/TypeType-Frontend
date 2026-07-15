# TypeType Frontend

> **Repository migration in progress**
>
> TypeType repositories and container images are moving to the
> [TypeType-Video organization](https://github.com/TypeType-Video). Existing GitHub links and
> clones continue to work through GitHub redirects. Current `ghcr.io/priveetee/*` images remain
> available during the transition, while new builds move to `ghcr.io/typetype-video/*`.

This repository contains the TypeType React web client and its nginx container. Full-stack
installation, releases and issue tracking stay in the
[TypeType repository](https://github.com/TypeType-Video/TypeType).

## Development

Requirements:

- [Bun 1.3.14](https://bun.sh/)
- a running [TypeType Server](https://github.com/TypeType-Video/TypeType-Server)

```sh
bun install --frozen-lockfile
cp apps/web/.env.example apps/web/.env
bun run dev
```

The development server is available at `http://localhost:5173` by default.

Run the project checks:

```sh
bun run check
bun run test
bun run knip
bun run sherif
bun run build
```

Build the frontend container:

```sh
docker build -t typetype-frontend .
```

## Project Links

- [TypeType](https://github.com/TypeType-Video/TypeType): installation, releases and issues
- [TypeType Server](https://github.com/TypeType-Video/TypeType-Server): Kotlin API backend
- [TypeType Player](https://github.com/TypeType-Video/TypeType-Player): MSE playback package
- [TypeType Token](https://github.com/TypeType-Video/TypeType-Token): YouTube token service
- [TypeType Downloader](https://github.com/TypeType-Video/TypeType-Downloader): download service
- [Documentation](https://typetype-video.github.io/Docs-TypeType/)

## License

TypeType Frontend is licensed under the [MIT License](LICENSE). It is not affiliated with,
authorized by or endorsed by YouTube, Google, NicoNico, BiliBili or their affiliates. Trademarks
and other intellectual property belong to their respective owners.
