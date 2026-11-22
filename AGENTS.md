# AGENTS.md — Typst Doc Studio

Agent-facing notes for working in this repository. The app is a **static,
client-only document constructor**: the user picks a Typst template, fills in
fields step by step, and downloads a compiled PDF — all in the browser via
Typst compiled to WebAssembly. There is **no backend**.

## What the product is

A Typst document constructor. The UI is a plain, dark form wizard: the user
picks a template, fills grouped sections step by step, and exports a PDF. The
visual identity is the **Gruvbox** color scheme (dark, warm-retro palette:
bg0–bg4 surfaces, cream foreground, and the red/green/yellow/blue/purple/aqua/
orange accents). Technical UI bits (step numbers, labels, status) use a
monospace face to lean into Gruvbox's terminal heritage.

## Layout of the code

- `index.html` — page shell. Keep the IDs the script reads: `template`,
  `steps`, `step`, `status`, `back`, `next`. The `.sub` element is a plain
  descriptive subtitle only.
- `src/main.js` — all behavior. Schema-agnostic: supports **grouped** schemas
  (`schema.groups`) and legacy **flat** schemas (`schema.fields`). Renders
  repeatable groups as "voices" (add/remove/save parties), builds the Typst
  source, and compiles PDF via `$typst.pdf(...)`.
- `src/style.css` — the Gruvbox visual identity. Tokens live in `:root`.
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

## Data backup (export / import)

The tools menu (`⋮` in the masthead) can dump **all** locally stored data to a
single JSON file and load it back on another device/browser. Everything the app
persists lives under the `docbuilder:` localStorage prefix, so a backup is just
a snapshot of that slice (saved documents, drafts, saved parties). Keep new
storage keys under that prefix or they will not travel with the backup.
Import merges documents by id and parties by value (no duplicates); drafts are
overwritten. Export/import logic is `exportAllData()` / `importAllData()` in
`src/main.js`.

## Versioning

The app has one version, shown subtly in the footer (`<span id="app-version">`,
filled from `APP_VERSION` in `src/main.js`) so a deployed copy can be traced.

- `version` in `package.json` is the source of truth; mirror it in
  `APP_VERSION` (`src/main.js`) and in `package-lock.json` (top-level and
  `packages[""].version`).
- **Bump the version on every commit** — patch for fixes, minor for features.
- The backup file records the app version (`appVersion`) alongside the format
  version (`version: 1`).

## Encoding (important)

`index.html` is served as-is, so it is kept **100% ASCII**: Cyrillic and
typographic characters are written as numeric character references
(`&#x41A;`), and the JSON-LD block uses `\uXXXX` escapes. A charset declared by
the web server or a preview proxy in a `Content-Type` header beats
`<meta charset>`, which is what turns Russian text into mojibake in a preview;
character references survive any declared charset, so the page stays readable.

- When editing `index.html`, write non-ASCII characters as references
  (`&#x41A;` = А). Everything else — app strings, schemas, `.typ` templates —
  stays plain UTF-8; JS modules are always decoded as UTF-8, so they need no
  escaping.
- `@charset "UTF-8";` must stay the first line of `src/style.css`: for CSS that
  rule wins over the response headers.

## Conventions

- Keep behavior in `main.js`; do not split logic into new files unless asked.
- Preserve `localStorage` party storage and the two schema formats.
- Visual changes must stay within the Gruvbox identity (tokens in `:root`).
- Write copy in Russian, sentence case, plain verbs (e.g. "Скачать PDF").
