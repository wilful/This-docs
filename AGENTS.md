# AGENTS.md — Groovebox · Doc Studio

Agent-facing notes for working in this repository. The app is a **static,
client-only document constructor**: the user picks a Typst template, fills in
fields step by step, and downloads a compiled PDF — all in the browser via
Typst compiled to WebAssembly. There is **no backend**.

## What the product is

A "groovebox" styled document machine. The UI metaphor (decided with the user)
is a piece of music hardware: the **sequencer strip** is the list of document
sections (steps), each field is a panel control, and the two bottom **transport
pads** (Back / Next→PDF) drive the flow. Keep this identity when changing the UI:
dark chassis, acid-lime primary, cyan "screen" accents, magenta for required
fields. Do not revert to a generic light/document theme.

## Layout of the code

- `index.html` — page shell. Keep the IDs the script reads: `template`,
  `steps`, `step`, `status`, `back`, `next`. The `.power-led`, `.brand`,
  `.model`, `.sub` elements are decorative device chrome only.
- `src/main.js` — all behavior. Schema-agnostic: supports **grouped** schemas
  (`schema.groups`) and legacy **flat** schemas (`schema.fields`). Renders
  repeatable groups as "voices" (add/remove/save parties), builds the Typst
  source, and compiles PDF via `$typst.pdf(...)`.
- `src/style.css` — the Groove Box visual identity. Tokens live in `:root`.
- `src/templates.js` — registry. Import each `.typ?raw` + sidecar
  `.schema.json`, push an entry `{ id, name, typ, schema }`.
- `templates/*.typ` — a `doc(..)` function. Grouped schemas receive
  `doc(data: (<group_id>: <dict|array>, ...))`; flat schemas receive named
  args `doc(key: "value", ...)`.
- `templates/*.schema.json` — field definitions (see "Schemas" below).
- `vite.config.js` — static build to `dist/` with relative base for GitHub
  Pages. WASM binaries are kept as separate files (`assetsInlineLimit: 0`).

## Schemas

Grouped (production format):
```json
{ "id", "name",
  "groups": [ { "id", "title", "repeatable"?,
    "fields": [ { "key", "label", "type", "required"?, "placeholder"?,
                  "options"?, "autocomplete"? } ] } ] }
```
- `repeatable` groups allow multiple parties (buyers/sellers). Their values are
  arrays; the app stores saved parties in `localStorage` under
  `docbuilder:parties:<group.id>` and can reload them into any contract.
- `type` drives the mobile control/keyboard: `text | tel | email | date |
  number | textarea | select`.

## How a PDF is produced

1. User fills steps; `writeStep()` copies DOM values into `data`.
2. `validateData()` checks required fields across all groups.
3. `buildSource()` emits the `#doc(...)` Typst call (grouped or flat).
4. `$typst.pdf({ mainContent: source })` compiles WASM → `Blob` → download.

## Adding a template

1. `templates/my-doc.typ` with a `doc(..)` function.
2. `templates/my-doc.schema.json` describing groups/fields.
3. Import both and append an entry in `src/templates.js`.

## Commands (Node / Vite stack)

```bash
npm install
npm run dev       # local preview
npm run build     # static build → dist/
npm run preview   # preview the build
```

> Note: the sandbox sometimes cannot reach the npm registry (TLS cert error),
> which leaves `vite` uninstalled and `npm run build` unable to start. In that
> case the app code is still valid — verify JS with `node --check` and review
> CSS by hand. Do not attempt to bypass TLS or install system packages.

## Conventions

- Keep behavior in `main.js`; do not split logic into new files unless asked.
- Preserve `localStorage` party storage and the two schema formats.
- Visual changes must stay within the Groove Box identity (tokens in `:root`).
- Write copy in Russian, sentence case, plain verbs (e.g. "Скачать PDF").
