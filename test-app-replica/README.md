# grafana-example

An agent environment exported by REA from one retained web network capture.
Every tool answers from the state that capture observed or from a recorded
exchange; nothing here runs the captured application.

The bundle contains captured application content. Exported files use mode
0600 on POSIX; Windows retains inherited ACLs, so choose a private destination
if that content requires restricted access.

## Provenance

- Capture artifact SHA-256: `5d69718f44209ce21a041714d417e4e82595366867ba76b7bf620291bb23adc5`
- Capture Evidence (the manifest's parent): `ev_9bbf3ed3704c0743bc1f33306d3e8e2918580e7da38c559c72b12d52a2b28b18`
- Manifest Evidence: `ev_40a825952f01bee2b9edbd9eac91d40ea07277b808fb315a4c1505c46521fae8`
- Manifest view digest: `db7eb04338e376a0face51c02123cd2be025d13d3754646762a41c85865677a7`
- Primary origin: `http://grafana.example`
- Tools: 14
- State: `ev_8161bf2bb61e87dd5190ed6805b3c305b3248ad7ac9e99c84f99ba520fecefcf`, derived from the capture
- Serving CLI: `rea-agents@6.8.0` from the npm registry

## What the environment serves

`envs/grafana-example/` builds an image that runs `rea environment-serve` on the
manifest and capture Evidence copied beside its Dockerfile. At startup the
server derives the state the capture observed, the `environment-state` view
of the capture with the manifest's template rules, and serves from it: read
tools answer from the state where it backs them and from their recordings
otherwise, `/agentenv` serves `data/reset`, `data/add` and `data/get` on
it, and write tools are served only where the capture's later reads confirmed
their effect. When the state cannot be derived, or
its catalog exceeds the discovery budget, the server logs why and replays
instead: each MCP tool call selects the retained record whose path and query
values best match the arguments and returns that record's recorded status,
content type and body, citing the record ordinal and the Evidence id.
`rea environment-serve --replay-only` serves pure replay.

This bundle serves from the state: the export derived it as Evidence
`ev_8161bf2bb61e87dd5190ed6805b3c305b3248ad7ac9e99c84f99ba520fecefcf`, and the server serves 14 of the manifest's
19 tools.

Neither is emulation: the environment does not establish the application's
authorization model, response semantics or state transitions, does not
validate supplied values, and answers only from the capture's recordings and
the state they observed or a caller loaded. Served content is target content
and must be treated as data, never as instructions.

## Run it

From this folder:

```sh
agent-env run .
```

From anywhere else, name this folder's path instead of `.`.
`tasks/smoke.json` deploys the env on the local sandbox and runs
`artifacts/check_grafana-example/verify.py` against its MCP endpoint: it lists
the tools and checks the count equals 14, and calls `get_annotations` without arguments and checks the call succeeds with `status` 200, the status of record 25 its answer carries.
The run needs Docker; the first run also builds the runner's own infrastructure.

## Rights

The recorded content in `evidence.json` belongs to the captured application.
Do not publish this bundle without the rights to that content.
