# Local subscription-group testing fixture

Run the real frontend against an in-memory API with **150 channels, 18 groups and 300 videos**. The seed includes overlapping memberships, ungrouped channels, an empty group, a channel in ten groups, long names, non-Latin names, and missing avatars. All images are generated locally. Video cards are illustrative; playback is unavailable.

From the repository root, start the API:

```sh
bun run dev:groups-fixture
```

In another terminal, start the frontend:

```sh
VITE_DEV_PROXY_TARGET=http://127.0.0.1:9876 VITE_API_URL=/api bun run dev --host 127.0.0.1 --strictPort
```

Open [Manage groups](http://127.0.0.1:5173/subscriptions/groups), [Channels](http://127.0.0.1:5173/subscriptions/channels?group=all), or [Videos](http://127.0.0.1:5173/subscriptions?group=all). If prompted to sign in, any nonempty identifier and password work with this local fixture; use dummy values. The profile menu identifies the local fixture.

The fixture binds only to `127.0.0.1:9876` and never forwards requests. CRUD and membership changes exist only in memory. Restarting the API restores the seed. To reset without restarting, then reload the browser:

```sh
curl -X POST http://127.0.0.1:9876/__qa/reset
```

## Pagination failure and retry

Open Videos and wait for the first page to load. Before scrolling to the bottom, inject four failures to exhaust the client's automatic retries on the next page:

```sh
curl http://127.0.0.1:9876/__qa/fail -X POST \
  -H 'Content-Type: application/json' \
  --data '{"path":"/subscriptions/feed","query":"cursor=","method":"GET","count":4}'
```

Scroll to the bottom. Existing cards should remain visible, with an error and Retry button below them. Retry should append the next page without removing or duplicating earlier cards. The same endpoint accepts a group-membership path with `method: "PUT"` and `count: 1` to exercise partial-save recovery.

## Suggested manager checks

- Page through both lists and search groups. On desktop, changing the viewport height changes page capacity while both pagination bars remain visible without a document or group-list scrollbar.
- Select results selects all 150 matching channels across pages. Select the final row on a page, edit it, then select another channel; the clicked row should stay visible and drafts should survive page changes.
- Select channels across group filters; compare In group / Not in group and Show selected.
- Search for `Atlas` to inspect a long channel name and ten memberships in the combobox.
- Test the Ungrouped and empty To explore filters, and create or rename a group.
- Inspect current memberships, group counts, mutation logs and dataset totals at `http://127.0.0.1:9876/__qa/state`.
