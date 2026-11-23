// Self-hosted Cyrillic-first family: serif for the document's voice,
// sans for what the user types, mono for the tool (labels, steps, status).
import "@fontsource/pt-serif/cyrillic-400.css";
import "@fontsource/pt-serif/cyrillic-700.css";
import "@fontsource/pt-serif/latin-400.css";
import "@fontsource/pt-serif/latin-700.css";
import "@fontsource/pt-sans/cyrillic-400.css";
import "@fontsource/pt-sans/cyrillic-700.css";
import "@fontsource/pt-sans/latin-400.css";
import "@fontsource/pt-sans/latin-700.css";
import "@fontsource/pt-mono/cyrillic-400.css";
import "@fontsource/pt-mono/latin-400.css";
import "./style.css";
import { $typst } from "@myriaddreamin/typst.ts/contrib/all-in-one-lite";
import compilerWasmUrl from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";
import rendererWasmUrl from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";
import { templates } from "./templates.js";

// Point the WASM runtime at the compiler/renderer binaries (separate packages).
$typst.setCompilerInitOptions({ getModule: () => compilerWasmUrl });
$typst.setRendererInitOptions({ getModule: () => rendererWasmUrl });

const PARTY_PREFIX = "docbuilder:parties:";

// Version of the app, shown quietly in the footer. Bump it together with
// `version` in package.json on every commit (see AGENTS.md → Versioning).
const APP_VERSION = "0.3.0";

const els = {
  tpl: document.getElementById("template"),
  steps: document.getElementById("steps"),
  progress: document.getElementById("progress"),
  brandTitle: document.getElementById("brand-title"),
  brandSubtitle: document.getElementById("brand-subtitle"),
  startScreen: document.getElementById("start-screen"),
  editorScreen: document.getElementById("editor-screen"),
  templateCards: document.getElementById("template-cards"),
  tplMeta: document.getElementById("tpl-meta"),
  step: document.getElementById("step"),
  status: document.getElementById("status"),
  back: document.getElementById("back"),
  next: document.getElementById("next"),
  save: document.getElementById("save"),
  sendSample: document.getElementById("send-sample"),
  home: document.getElementById("home"),
  restart: document.getElementById("restart"),
  clearData: document.getElementById("clear-data"),
  exportData: document.getElementById("export-data"),
  importData: document.getElementById("import-data"),
  importFile: document.getElementById("import-file"),
  appVersion: document.getElementById("app-version"),
  toolsMenu: document.querySelector(".tools-menu"),
};

// ---- saved documents (localStorage) ----

// Everything the app persists lives under this prefix, so a full backup is a
// snapshot of that slice of localStorage (saved documents, drafts, parties).
const STORAGE_PREFIX = "docbuilder:";
const BACKUP_APP = "typst-docs";
const BACKUP_VERSION = 1;

const DOCS_KEY = "docbuilder:docs";
const draftKey = (id) => `docbuilder:draft:${id}`;

function loadDocs() {
  try {
    return JSON.parse(localStorage.getItem(DOCS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveDocs(list) {
  // Keep the most recent versions so storage stays bounded.
  localStorage.setItem(DOCS_KEY, JSON.stringify(list.slice(-50)));
}

function cloneData(o) {
  return JSON.parse(JSON.stringify(o ?? {}));
}

// Persist the current in-progress document so a reload restores it.
function saveDraft() {
  try {
    localStorage.setItem(
      draftKey(current.id),
      JSON.stringify({ stepIndex, data: cloneData(data) })
    );
  } catch {}
}

function loadDraft(tpl) {
  try {
    const raw = localStorage.getItem(draftKey(tpl.id));
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o && o.data) return o;
  } catch {}
  return null;
}

// Save a filled version of the document (all versions are kept).
function addDoc(tpl, values) {
  const list = loadDocs();
  const now = new Date();
  const stamp = now.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  list.push({
    id: "doc_" + now.getTime() + "_" + Math.random().toString(36).slice(2, 7),
    templateId: tpl.id,
    templateName: tpl.schema.name,
    name: `${tpl.schema.name} — ${stamp}`,
    savedAt: now.toISOString(),
    data: cloneData(values),
  });
  saveDocs(list);
  renderSavedDocs();
  return list[list.length - 1];
}

function deleteDoc(id) {
  saveDocs(loadDocs().filter((d) => d.id !== id));
  renderSavedDocs();
}

function loadDoc(id) {
  const doc = loadDocById(id);
  if (!doc) return;
  const tpl = templates.find((t) => t.id === doc.templateId) || current;
  current = tpl;
  els.tpl.value = tpl.id;
  data = cloneData(doc.data);
  stepIndex = 0;
  showEditor();
  renderStep();
  setStatus("Документ загружен из сохранённых.");
}

function loadDocById(id) {
  return loadDocs().find((d) => d.id === id);
}

// One place where a Blob is handed to the browser as a download.
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderSavedDocs() {
  const body = document.getElementById("docs-body");
  if (!body) return;
  const docs = loadDocs();
  body.innerHTML = "";
  if (!docs.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Сохранённых документов пока нет — заполните и нажмите «Сохранить документ».";
    body.appendChild(p);
    return;
  }
  const sel = document.createElement("select");
  sel.id = "doc-list";
  const ph = document.createElement("option");
  ph.value = "";
  ph.textContent = "Выберите сохранённый документ…";
  ph.disabled = true;
  ph.selected = true;
  sel.appendChild(ph);
  docs.forEach((d) => {
    const o = document.createElement("option");
    o.value = d.id;
    o.textContent = d.name;
    sel.appendChild(o);
  });
  const loadBtn = document.createElement("button");
  loadBtn.type = "button";
  loadBtn.className = "btn-sm";
  loadBtn.textContent = "Загрузить";
  loadBtn.addEventListener("click", () => {
    if (sel.value) loadDoc(sel.value);
  });
  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "btn-sm btn-danger";
  delBtn.textContent = "Удалить";
  delBtn.addEventListener("click", () => {
    if (sel.value) deleteDoc(sel.value);
  });
  const row = document.createElement("div");
  row.className = "saved";
  row.append(sel, loadBtn, delBtn);
  body.appendChild(row);
}

// Russian plural forms: plural(2, ["раздел", "раздела", "разделов"]) -> "раздела".
function plural(n, forms) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

// Count sections and fields in a schema (grouped or legacy flat).
function schemaSize(tpl) {
  const groups = getGroups(tpl);
  return {
    sections: groups.length,
    fields: groups.reduce((n, g) => n + g.fields.length, 0),
  };
}

function templateFacts(tpl) {
  const { sections, fields } = schemaSize(tpl);
  return [
    `${sections} ${plural(sections, ["раздел", "раздела", "разделов"])}`,
    `${fields} ${plural(fields, ["поле", "поля", "полей"])}`,
  ].join(", ");
}

function catalogMeta() {
  const totals = templates.reduce(
    (acc, tpl) => {
      const { sections, fields } = schemaSize(tpl);
      return { sections: acc.sections + sections, fields: acc.fields + fields };
    },
    { sections: 0, fields: 0 }
  );
  const n = templates.length;
  return (
    `${n} ${plural(n, ["шаблон", "шаблона", "шаблонов"])}, ` +
    `${totals.sections} ${plural(totals.sections, ["раздел", "раздела", "разделов"])}, ` +
    `${totals.fields} ${plural(totals.fields, ["поле", "поля", "полей"])}. Данные остаются в браузере.`
  );
}

function renderTemplateCards() {
  els.templateCards.innerHTML = "";
  for (const tpl of templates) {
    const draft = loadDraft(tpl);
    const card = document.createElement("div");
    card.className = "template-card";

    const main = document.createElement("button");
    main.type = "button";
    main.className = "template-card-main";
    main.setAttribute(
      "aria-label",
      `${tpl.schema.name}${draft ? ", продолжить черновик" : ", начать заполнение"}`
    );

    const copy = document.createElement("span");
    copy.className = "template-card-copy";
    const name = document.createElement("strong");
    name.textContent = tpl.schema.name;
    const hint = document.createElement("small");
    hint.textContent = tpl.schema.description || "Пошаговое заполнение и готовый PDF.";
    const meta = document.createElement("span");
    meta.className = "template-card-meta";
    meta.textContent = templateFacts(tpl);
    copy.append(name, hint, meta);

    const side = document.createElement("span");
    side.className = "template-card-side";
    if (draft) {
      const cta = document.createElement("span");
      cta.className = "template-card-cta draft";
      cta.textContent = "черновик";
      side.appendChild(cta);
    }
    const arrow = document.createElement("span");
    arrow.className = "template-card-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    side.appendChild(arrow);

    main.append(copy, side);
    main.addEventListener("click", () => openTemplate(tpl));

    const footer = document.createElement("div");
    footer.className = "template-card-actions";
    const sample = document.createElement("button");
    sample.type = "button";
    sample.className = "btn-sm";
    sample.textContent = "Отправить пример";
    sample.addEventListener("click", () => sendSample(tpl, sample));
    footer.appendChild(sample);

    card.append(main, footer);
    els.templateCards.appendChild(card);
  }
}

function showEditor() {
  els.startScreen.hidden = true;
  els.editorScreen.hidden = false;
  els.home.hidden = false;
}

function showStartScreen() {
  els.editorScreen.hidden = true;
  els.startScreen.hidden = false;
  els.home.hidden = true;
  els.brandTitle.textContent = "Конструктор документов";
  els.brandSubtitle.textContent = "Договоры и заявления — заполнить и скачать PDF";
  if (els.tplMeta) els.tplMeta.textContent = catalogMeta();
  els.toolsMenu.open = false;
  els.status.hidden = !els.status.textContent;
  renderTemplateCards();
}

function openTemplate(tpl) {
  if (!els.editorScreen.hidden) {
    writeStep(getWizardGroups(current)[stepIndex]);
    saveDraft();
  }
  current = tpl;
  els.tpl.value = tpl.id;
  const draft = loadDraft(tpl);
  data = draft ? cloneData(draft.data) : emptyData(tpl);
  stepIndex = draft ? Math.min(draft.stepIndex || 0, getWizardGroups(tpl).length - 1) : 0;
  showEditor();
  els.status.hidden = false;
  setStatus("");
  renderStep();
  setStatus(draft ? "Черновик восстановлен." : "Заполните поля документа.");
}

function showSourceDump(source) {
  const d = document.createElement("details");
  d.className = "src-dump";
  const s = document.createElement("summary");
  s.textContent = "Показать сгенерированный Typst-исходник";
  const pre = document.createElement("pre");
  pre.textContent = source;
  d.append(s, pre);
  els.step.prepend(d);
}

let current = templates[0];
let stepIndex = 0;
let data = {};

// ---- schema helpers (contract-agnostic) ----

// A template is either grouped (schema.groups) or a legacy flat list
// (schema.fields). Both are supported; grouped is the production format.
function getGroups(tpl) {
  if (tpl.schema.groups) return tpl.schema.groups;
  return [
    {
      id: "fields",
      title: tpl.schema.name || "Поля",
      fields: tpl.schema.fields,
    },
  ];
}

function getWizardGroups(tpl) {
  return [
    ...getGroups(tpl),
    { id: "_signatures", title: "Подписи сторон", signatures: true, fields: [] },
  ];
}

function isGrouped(tpl) {
  return !!tpl.schema.groups;
}

function emptyData(tpl) {
  const d = {};
  for (const g of getGroups(tpl)) d[g.id] = g.repeatable ? [] : {};
  return d;
}

// ---- input type mapping (drives mobile keyboards) ----

function inputAttrs(f) {
  switch (f.type) {
    case "tel":
      return { el: "input", type: "text", inputmode: "tel", autocomplete: f.autocomplete || "tel" };
    case "email":
      return { el: "input", type: "text", inputmode: "email", autocomplete: f.autocomplete || "email" };
    case "number":
      return { el: "input", type: "text", inputmode: "decimal", autocomplete: f.autocomplete || "off" };
    case "date":
      return { el: "input", type: "date", autocomplete: f.autocomplete || "off" };
    case "textarea":
      return { el: "textarea", autocomplete: f.autocomplete || "off" };
    case "select":
      return { el: "select", autocomplete: f.autocomplete || "off" };
    default:
      return {
        el: "input",
        type: "text",
        inputmode: f.inputmode || "text",
        autocomplete: f.autocomplete || keyAuto(f.key),
      };
  }
}

// ---- Russian formatting & validation ----

// Today as YYYY-MM-DD (native <input type="date"> value).
function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Convert YYYY-MM-DD to Russian DD.MM.YYYY for the document body.
function ruDateDisplay(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v).trim());
  if (!m) return v;
  return `${m[3]}.${m[2]}.${m[1]}`;
}

// Map common field keys to HTML autocomplete tokens.
function keyAuto(key) {
  if (key === "fio") return "name";
  if (key === "address") return "street-address";
  if (key === "phone") return "tel";
  if (key === "email") return "email";
  return "off";
}

// Normalize a Russian phone to "+7 (XXX) XXX-XX-XX".
function fmtPhone(raw) {
  const s = String(raw).replace(/\D/g, "");
  if (s.length === 11 && (s[0] === "8" || s[0] === "7"))
    return `+7 (${s.slice(1, 4)}) ${s.slice(4, 7)}-${s.slice(7, 9)}-${s.slice(9)}`;
  if (s.length === 10) return `+7 (${s.slice(0, 3)}) ${s.slice(3, 6)}-${s.slice(6, 8)}-${s.slice(8)}`;
  return String(raw).trim();
}

// Russian internal passport: 10 digits -> "XX XX XXXXXX".
function fmtPassport(raw) {
  const s = String(raw).replace(/\D/g, "");
  if (s.length === 10) return `${s.slice(0, 2)} ${s.slice(2, 4)} ${s.slice(4)}`;
  return String(raw).trim();
}

// Cadastral number: 13 digits -> "XX:XX:XXXXXXX:XX".
function fmtCadastral(raw) {
  const s = String(raw).replace(/\D/g, "");
  if (s.length === 13) return `${s.slice(0, 2)}:${s.slice(2, 4)}:${s.slice(4, 11)}:${s.slice(11)}`;
  return String(raw).trim();
}

// Group thousands with spaces (Russian style).
function fmtNumber(raw) {
  const s = String(raw).replace(/[^\d.,]/g, "").replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(s)) return String(raw).trim();
  const [int, dec] = s.split(".");
  const g = (x) => x.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec ? `${g(int)}.${dec}` : g(int);
}

// Normalize a field value for Russian conventions.
function formatValue(f, raw) {
  const v = String(raw ?? "").trim();
  if (!v) return v;
  if (f.key === "phone" || f.type === "tel") return fmtPhone(v);
  if (f.key === "passport") return fmtPassport(v);
  if (f.key === "cadastral") return fmtCadastral(v);
  if (f.type === "number" || f.key === "price" || f.key === "area") return fmtNumber(v);
  return v;
}

// Validate a single field's format. Returns an error message or null.
function validateValue(f, raw) {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  if (f.key === "phone" || f.type === "tel") {
    const s = v.replace(/\D/g, "");
    if (s.length === 10) return null;
    if (s.length === 11 && (s[0] === "8" || s[0] === "7")) return null;
    return "Телефон в формате +7 (XXX) XXX-XX-XX";
  }
  if (f.key === "passport") {
    if (v.replace(/\D/g, "").length === 10) return null;
    return "Паспорт: 10 цифр (XX XX XXXXXX)";
  }
  if (f.key === "cadastral") {
    if (/^\d{2}:\d{2}:\d{7}:\d{2}$/.test(v)) return null;
    return "Кадастр: XX:XX:XXXXXXX:XX";
  }
  if (f.type === "email") {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null;
    return "Введите корректный e-mail";
  }
  if (f.type === "date") {
    if ((/^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v))) || /^\d{2}\.\d{2}\.\d{4}$/.test(v))
      return null;
    return "Дата в формате ДД.ММ.ГГГГ";
  }
  return null;
}

// ---- field element builder ----

function buildField(f, value) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  const id = "f_" + Math.random().toString(36).slice(2);

  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = f.label;
  if (f.required) {
    const s = document.createElement("span");
    s.className = "req";
    s.textContent = " *";
    label.appendChild(s);
  }
  wrap.appendChild(label);

  const a = inputAttrs(f);
  let initial = value ?? "";
  if (f.type === "date" && !initial && f.defaultToday) initial = todayISO();
  let control;
  if (a.el === "textarea") {
    control = document.createElement("textarea");
    control.rows = 3;
  } else if (a.el === "select") {
    control = document.createElement("select");
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = f.placeholder || "—";
    ph.disabled = true;
    ph.selected = true;
    control.appendChild(ph);
    for (const opt of f.options || []) {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      control.appendChild(o);
    }
  } else {
    control = document.createElement("input");
    if (a.type) control.type = a.type;
    if (a.inputmode) control.inputMode = a.inputmode;
  }
  control.id = id;
  control.dataset.key = f.key;
  control.value = initial;
  if (f.placeholder && a.el !== "select") control.placeholder = f.placeholder;
  control.autocomplete = a.autocomplete || "off";

  // Datalist suggestions (autocomplete) for free-text fields with options.
  if (a.el !== "select" && Array.isArray(f.options) && f.options.length) {
    const dl = document.createElement("datalist");
    dl.id = "dl_" + id;
    for (const opt of f.options) {
      const o = document.createElement("option");
      o.value = opt;
      dl.appendChild(o);
    }
    control.setAttribute("list", dl.id);
    wrap.appendChild(dl);
  }

  // Auto-format on leave, validate live (Russian conventions).
  control.addEventListener("blur", () => {
    const formatted = formatValue(f, control.value);
    if (formatted !== control.value) control.value = formatted;
    setFieldError(wrap, validateValue(f, control.value));
  });
  control.addEventListener("input", () => {
    if (wrap.classList.contains("invalid")) setFieldError(wrap, validateValue(f, control.value));
  });

  wrap.appendChild(control);

  const err = document.createElement("div");
  err.className = "err";
  err.textContent = "Заполните поле";
  wrap.appendChild(err);
  return wrap;
}

// ---- repeatable group ("party") rendering + saved-parties store ----

function partyKey(id) {
  return PARTY_PREFIX + id;
}

function loadParties(id) {
  try {
    return JSON.parse(localStorage.getItem(partyKey(id)) || "[]");
  } catch {
    return [];
  }
}

function partyLabel(p) {
  return p.fio || p.name || p.phone || p.address || "Сторона";
}

function saveParty(g, repEl) {
  const o = {};
  for (const f of g.fields) {
    const el = repEl.querySelector(`[data-key="${f.key}"]`);
    o[f.key] = el ? el.value.trim() : "";
  }
  const list = loadParties(g.id);
  list.push(o);
  localStorage.setItem(partyKey(g.id), JSON.stringify(list));
  setStatus("Сторона сохранена — можно повторить в любом договоре.");
}

function buildSavedLoader(g) {
  const saved = loadParties(g.id);
  if (!saved.length) return document.createDocumentFragment();

  const wrap = document.createElement("div");
  wrap.className = "saved";

  const sel = document.createElement("select");
  sel.id = "saved_" + g.id;
  const ph = document.createElement("option");
  ph.value = "";
  ph.textContent = "Повторить сохранённую сторону…";
  ph.disabled = true;
  ph.selected = true;
  sel.appendChild(ph);
  saved.forEach((p, i) => {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = partyLabel(p);
    sel.appendChild(o);
  });

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-sm";
  btn.textContent = "Загрузить";
  btn.addEventListener("click", () => {
    const i = sel.value;
    if (i === "") return;
    data[g.id].push({ ...saved[Number(i)] });
    renderStep();
  });

  wrap.append(sel, btn);
  return wrap;
}

function buildRep(g, index, values) {
  values._partyId ||= `party_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const rep = document.createElement("div");
  rep.className = "rep";
  rep.dataset.rep = index;
  rep.dataset.partyId = values._partyId;

  const head = document.createElement("div");
  head.className = "rep-head";
  const t = document.createElement("span");
  t.textContent = `${g.title} №${index + 1}`;
  head.appendChild(t);

  const actions = document.createElement("div");
  actions.className = "rep-actions";
  const save = document.createElement("button");
  save.type = "button";
  save.className = "btn-sm";
  save.textContent = "Сохранить";
  save.addEventListener("click", () => saveParty(g, rep));
  const del = document.createElement("button");
  del.type = "button";
  del.className = "btn-sm btn-danger";
  del.textContent = "Удалить";
  del.addEventListener("click", () => {
    data[g.id].splice(index, 1);
    renderStep();
  });
  actions.append(save, del);
  head.appendChild(actions);
  rep.appendChild(head);

  for (const f of g.fields) rep.appendChild(buildField(f, values?.[f.key]));
  return rep;
}

// ---- step rendering ----

function renderStep() {
  const groups = getWizardGroups(current);
  const g = groups[stepIndex];

  els.brandTitle.textContent = current.schema.name;
  els.brandSubtitle.textContent = "Конструктор документов";
  els.progress.textContent = `Шаг ${stepIndex + 1} из ${groups.length}`;

  els.step.innerHTML = "";
  const card = document.createElement("div");
  card.className = "card";

  const title = document.createElement("h2");
  title.className = "group-title";
  title.textContent = g.title;
  card.appendChild(title);

  if (g.signatures) {
    renderSignatureStep(card);
  } else if (g.repeatable) {
    const reps = data[g.id] || [];
    if (reps.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Пока нет — добавьте сторону кнопкой ниже.";
      card.appendChild(empty);
    }
    reps.forEach((rep, i) => card.appendChild(buildRep(g, i, rep)));
    card.appendChild(buildSavedLoader(g));
    const add = document.createElement("button");
    add.type = "button";
    add.className = "btn-add";
    add.textContent = "+ Добавить сторону";
    add.addEventListener("click", () => {
      data[g.id].push({});
      renderStep();
    });
    card.appendChild(add);
  } else {
    const obj = data[g.id] || {};
    for (const f of g.fields) card.appendChild(buildField(f, obj[f.key]));
  }

  els.step.appendChild(card);
  renderSteps(groups);
  renderActions(groups);
  els.step.scrollTop = 0;
  saveDraft();
}

// Group ids whose values are people: the signature step offers a pad per party.
const PARTY_GROUP_IDS = ["sellers", "buyers", "landlords", "tenants"];

function renderSignatureStep(card) {
  const intro = document.createElement("p");
  intro.className = "muted signature-note";
  intro.textContent = "При желании нарисуйте подпись пальцем или мышью. Она будет добавлена в PDF как изображение; это не криптографическая электронная подпись. Подпись необязательна.";
  card.appendChild(intro);

  const partyGroups = getGroups(current).filter((g) => PARTY_GROUP_IDS.includes(g.id));
  for (const g of partyGroups) {
    const parties = g.repeatable
      ? (data[g.id] || []).map((party, index) => ({ party, index }))
      : data[g.id]
        ? [{ party: data[g.id], index: null }]
        : [];
    if (!parties.length) continue;
    const heading = document.createElement("h3");
    heading.className = "signature-group-title";
    heading.textContent = g.title;
    card.appendChild(heading);

    parties.forEach(({ party, index }) => {
      const item = document.createElement("section");
      item.className = "signature-item";
      const label = document.createElement("h4");
      label.textContent = `${g.title}${index === null ? "" : ` №${index + 1}`}${party.fio ? ` — ${party.fio}` : ""}`;
      item.appendChild(label);

      if (party.signature) {
        const preview = document.createElement("div");
        preview.className = "signature-current";
        const previewLabel = document.createElement("span");
        previewLabel.textContent = "Текущая подпись в документе";
        const image = document.createElement("img");
        image.src = `data:image/svg+xml,${encodeURIComponent(party.signature)}`;
        image.alt = `Подпись ${party.fio || `${g.title}${index === null ? "" : ` №${index + 1}`}`}`;
        preview.append(previewLabel, image);
        item.appendChild(preview);
        const replaceNote = document.createElement("p");
        replaceNote.className = "muted signature-replace-note";
        replaceNote.textContent = "Чтобы заменить подпись, нажмите «Изменить подпись» и сохраните новый вариант.";
        item.appendChild(replaceNote);
      }

      const actions = document.createElement("div");
      actions.className = "signature-actions";
      const draw = document.createElement("button");
      draw.type = "button";
      draw.className = "btn-sm signature-open";
      draw.textContent = party.signature ? "Изменить подпись" : "Развернуть и подписать";
      draw.addEventListener("click", () => openSignaturePad(g.id, index, party.fio || `${g.title}${index === null ? "" : ` №${index + 1}`}`));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn-sm btn-danger";
      remove.textContent = "Убрать подпись из PDF";
      remove.hidden = !party.signature;
      remove.addEventListener("click", () => {
        if (index === null) data[g.id].signature = "";
        else data[g.id][index].signature = "";
        saveDraft();
        renderStep();
      });
      actions.append(draw, remove);
      item.appendChild(actions);
      card.appendChild(item);
    });
  }
}

async function openSignaturePad(groupId, partyIndex, partyName) {
  const overlay = document.createElement("section");
  overlay.className = "signature-pad";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", `Подпись: ${partyName}`);

  const header = document.createElement("header");
  header.className = "signature-pad-head";
  const title = document.createElement("div");
  title.className = "signature-pad-title";
  const heading = document.createElement("strong");
  heading.textContent = `Подпись: ${partyName}`;
  const hint = document.createElement("span");
  hint.className = "signature-pad-hint";
  hint.textContent = "Поверните телефон горизонтально и распишитесь пальцем";
  title.append(heading, hint);

  const canvas = document.createElement("canvas");
  canvas.className = "signature-canvas signature-pad-canvas";
  canvas.width = 1200;
  canvas.height = 400;
  canvas.setAttribute("aria-label", `Поле для рисования подписи: ${partyName}`);

  const actions = document.createElement("footer");
  actions.className = "signature-pad-actions";
  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "btn btn-ghost";
  clear.textContent = "Очистить";
  clear.disabled = true;
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "btn btn-ghost";
  cancel.textContent = "Отмена";
  const save = document.createElement("button");
  save.type = "button";
  save.className = "btn btn-primary";
  save.textContent = "Сохранить подпись";
  save.disabled = true;
  actions.append(clear, cancel, save);
  overlay.append(header, canvas, actions);
  document.body.appendChild(overlay);

  const close = async () => {
    overlay.remove();
    try {
      if (document.fullscreenElement === overlay) await document.exitFullscreen();
    } catch {}
    try {
      screen.orientation?.unlock?.();
    } catch {}
  };
  cancel.addEventListener("click", close);
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  save.addEventListener("click", async () => {
    const svg = signatureSvg(strokes, canvas.width, canvas.height);
    if (!svg) return;
    const group = getGroups(current).find((item) => item.id === groupId);
    const party = group?.repeatable ? data[groupId]?.[partyIndex] : data[groupId];
    if (!party) return;
    party.signature = svg;
    saveDraft();
    await close();
    renderStep();
    setStatus("Подпись сохранена в черновике этого документа.");
  });

  const strokes = attachSignatureCanvas(canvas, { clearButton: clear, saveButton: save });

  try {
    if (overlay.requestFullscreen) await overlay.requestFullscreen();
  } catch {}
  try {
    if (screen.orientation?.lock) await screen.orientation.lock("landscape");
  } catch {}
  cancel.focus();
}

function signatureSvg(strokes, width, height) {
  const paths = strokes.filter((stroke) => stroke.length).map((stroke) => {
    const [first, ...rest] = stroke;
    const end = rest.map((point) => `L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    return `<path d="M ${first.x.toFixed(1)} ${first.y.toFixed(1)} ${end || `L ${(first.x + 0.1).toFixed(1)} ${(first.y + 0.1).toFixed(1)}`}"/>`;
  });
  if (!paths.length) return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><g fill="none" stroke="#282828" stroke-width="${Math.max(4, width / 300)}" stroke-linecap="round" stroke-linejoin="round">${paths.join("")}</g></svg>`;
}

function attachSignatureCanvas(canvas, { clearButton, saveButton }) {
  const ctx = canvas.getContext("2d");
  const strokes = [];
  let activeStroke = null;

  const pointFromEvent = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    activeStroke = pointFromEvent(event);
    strokes.push([activeStroke]);
    ctx.beginPath();
    ctx.moveTo(activeStroke.x, activeStroke.y);
    ctx.strokeStyle = "#282828";
    ctx.lineWidth = Math.max(4, canvas.width / 300);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!activeStroke) return;
    const point = pointFromEvent(event);
    if (Math.hypot(point.x - activeStroke.x, point.y - activeStroke.y) < 2.5) return;
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    activeStroke = point;
    strokes[strokes.length - 1].push(point);
    clearButton.disabled = false;
    saveButton.disabled = false;
  });
  const finish = () => { activeStroke = null; };
  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointercancel", finish);
  clearButton.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.length = 0;
    clearButton.disabled = true;
    saveButton.disabled = true;
  });
  canvas.addEventListener("pointerdown", () => {
    clearButton.disabled = false;
    saveButton.disabled = false;
  });
  return strokes;
}

function renderSteps(groups) {
  els.steps.setAttribute("aria-label", `Разделы документа, шаг ${stepIndex + 1} из ${groups.length}`);
  els.steps.innerHTML = "";
  groups.forEach((g, i) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "step-chip";
    const no = document.createElement("span");
    no.className = "step-no";
    no.setAttribute("aria-hidden", "true");
    no.textContent = String(i + 1).padStart(2, "0");
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = g.title;
    chip.append(no, title);
    chip.setAttribute("aria-label", `Раздел: ${g.title}`);
    if (i === stepIndex) chip.setAttribute("aria-current", "step");
    else if (i < stepIndex) chip.classList.add("done");
    chip.addEventListener("click", () => gotoStep(i));
    els.steps.appendChild(chip);
  });
  const active = els.steps.querySelector('[aria-current="step"]');
  if (active) {
    const left = active.offsetLeft;
    const right = left + active.offsetWidth;
    if (left < els.steps.scrollLeft) els.steps.scrollLeft = left;
    else if (right > els.steps.scrollLeft + els.steps.clientWidth)
      els.steps.scrollLeft = right - els.steps.clientWidth;
  }
}

function renderActions(groups) {
  const last = stepIndex === groups.length - 1;
  els.back.disabled = stepIndex === 0;
  els.next.textContent = last ? "Скачать PDF" : "Далее";
}

// ---- navigation ----

function gotoStep(target) {
  if (target === stepIndex) return;
  const groups = getWizardGroups(current);
  if (target > stepIndex && !validateStep(groups[stepIndex])) return;
  writeStep(groups[stepIndex]);
  stepIndex = target;
  renderStep();
}

els.next.addEventListener("click", () => {
  const groups = getWizardGroups(current);
  if (!validateStep(groups[stepIndex])) return;
  writeStep(groups[stepIndex]);
  if (stepIndex < groups.length - 1) {
    stepIndex++;
    renderStep();
  } else {
    exportPdf();
  }
});

els.back.addEventListener("click", () => {
  if (stepIndex === 0) return;
  writeStep(getWizardGroups(current)[stepIndex]);
  stepIndex--;
  renderStep();
});

els.home.addEventListener("click", () => {
  writeStep(getWizardGroups(current)[stepIndex]);
  saveDraft();
  setStatus("");
  showStartScreen();
});

els.restart.addEventListener("click", () => {
  els.toolsMenu.open = false;
  if (!window.confirm("Очистить черновики и начать заново? Сохранённые документы останутся.")) return;
  for (const tpl of templates) localStorage.removeItem(draftKey(tpl.id));
  data = emptyData(current);
  stepIndex = 0;
  showStartScreen();
  setStatus("Черновики очищены. Выберите шаблон, чтобы начать заново.");
});

els.clearData.addEventListener("click", () => {
  els.toolsMenu.open = false;
  if (!window.confirm("Удалить все сохранённые документы, черновики и данные сторон? Это действие нельзя отменить.")) return;
  localStorage.removeItem(DOCS_KEY);
  for (const tpl of templates) localStorage.removeItem(draftKey(tpl.id));
  for (const groupId of new Set(templates.flatMap((tpl) => getGroups(tpl).filter((g) => g.repeatable).map((g) => g.id)))) {
    localStorage.removeItem(partyKey(groupId));
  }
  current = templates[0];
  data = emptyData(current);
  stepIndex = 0;
  renderSavedDocs();
  showStartScreen();
  setStatus("Все сохранённые данные удалены. Шаблоны доступны.");
});

els.save.addEventListener("click", () => {
  addDoc(current, data);
  setStatus("Документ сохранён в «Мои документы» (все версии).");
});

els.sendSample.addEventListener("click", () => {
  sendSample(current, els.sendSample);
});

// ---- backup: export / import all locally stored data ----

// Read back a stored value without assuming it is JSON.
function parseStored(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

// Snapshot of every key the app owns, as plain parsed values.
function collectStorage() {
  const entries = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
    entries[key] = parseStored(localStorage.getItem(key));
  }
  return entries;
}

function storageTotals() {
  let docs = 0;
  let parties = 0;
  let drafts = 0;
  for (const [key, value] of Object.entries(collectStorage())) {
    if (key === DOCS_KEY) docs = Array.isArray(value) ? value.length : 0;
    else if (key.startsWith(PARTY_PREFIX)) parties += Array.isArray(value) ? value.length : 0;
    else drafts++;
  }
  return { docs, parties, drafts };
}

function backupFilename() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `docbuilder-backup-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}

// Download a single JSON file holding all saved documents, drafts and parties.
function exportAllData() {
  els.toolsMenu.open = false;
  const entries = collectStorage();
  if (!Object.keys(entries).length) {
    setStatus("Пока нечего выгружать — нет сохранённых документов, сторон или черновиков.", true);
    return;
  }
  const payload = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    entries,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  downloadBlob(blob, backupFilename());
  setStatus("Файл с сохранёнными данными скачан. Его можно загрузить на другом устройстве.");
}

// Accept both our own wrapper and a bare { "docbuilder:...": ... } object.
function readBackup(payload) {
  if (!payload || typeof payload !== "object") return null;
  const raw = payload.entries && typeof payload.entries === "object" ? payload.entries : payload;
  const entries = {};
  for (const [key, value] of Object.entries(raw)) {
    if (key.startsWith(STORAGE_PREFIX)) entries[key] = value;
  }
  return entries;
}

// Merge saved documents by id so importing never duplicates versions.
function mergeDocs(incoming) {
  const byId = new Map();
  for (const d of loadDocs()) if (d && d.id) byId.set(d.id, d);
  for (const d of incoming) if (d && d.id && !byId.has(d.id)) byId.set(d.id, d);
  return [...byId.values()];
}

// Merge saved parties, skipping exact duplicates.
function mergeList(current, incoming) {
  const seen = new Set(current.map((p) => JSON.stringify(p)));
  const out = [...current];
  for (const p of incoming) {
    const k = JSON.stringify(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

function applyBackup(entries) {
  for (const [key, value] of Object.entries(entries)) {
    if (key === DOCS_KEY) {
      if (Array.isArray(value)) saveDocs(mergeDocs(value));
    } else if (key.startsWith(PARTY_PREFIX)) {
      if (!Array.isArray(value)) continue;
      const current = loadParties(key.slice(PARTY_PREFIX.length));
      localStorage.setItem(key, JSON.stringify(mergeList(current, value)));
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}

async function importAllData(file) {
  let payload;
  try {
    payload = JSON.parse(await file.text());
  } catch {
    setStatus("Не удалось прочитать файл: это не корректный JSON.", true);
    return;
  }
  const entries = readBackup(payload);
  const keys = entries ? Object.keys(entries) : [];
  if (!keys.length) {
    setStatus("В файле нет данных конструктора — возможно, выбран не тот файл.", true);
    return;
  }
  if (
    !window.confirm(
      "Добавить данные из файла к текущим? Сохранённые документы и стороны объединятся, черновики обновятся."
    )
  )
    return;
  applyBackup(entries);
  renderSavedDocs();
  renderTemplateCards();
  const totals = storageTotals();
  setStatus(
    `Данные загружены. Документов: ${totals.docs}, сохранённых сторон: ${totals.parties}, черновиков: ${totals.drafts}.`
  );
}

els.exportData.addEventListener("click", exportAllData);

els.importData.addEventListener("click", () => {
  els.toolsMenu.open = false;
  els.importFile.click();
});

els.importFile.addEventListener("change", () => {
  const file = els.importFile.files && els.importFile.files[0];
  els.importFile.value = "";
  if (file) importAllData(file);
});

// ---- read / write current step to state ----

function writeStep(g) {
  if (g.signatures) return;
  if (g.repeatable) {
    const reps = [...els.step.querySelectorAll("[data-rep]")];
    const existing = data[g.id] || [];
    data[g.id] = reps.map((rep) => {
      const o = {};
      const previous = existing.find((party) => party._partyId === rep.dataset.partyId);
      o._partyId = rep.dataset.partyId;
      if (previous?.signature) o.signature = previous.signature;
      for (const f of g.fields) {
        const el = rep.querySelector(`[data-key="${f.key}"]`);
        o[f.key] = el ? el.value : "";
      }
      return o;
    });
  } else {
    const o = {};
    if (data[g.id]?.signature) o.signature = data[g.id].signature;
    for (const f of g.fields) {
      const el = els.step.querySelector(`[data-key="${f.key}"]`);
      o[f.key] = el ? el.value : "";
    }
    data[g.id] = o;
  }
}

// ---- validation ----

function setFieldError(wrap, msg) {
  const err = wrap.querySelector(".err");
  if (msg) {
    wrap.classList.add("invalid");
    if (err) err.textContent = msg;
  } else {
    wrap.classList.remove("invalid");
    if (err) err.textContent = "Заполните поле";
  }
}

function markInvalid(scope, key, msg) {
  const el = scope.querySelector(`[data-key="${key}"]`);
  if (!el) return;
  const fld = el.closest(".field");
  if (!fld) return;
  setFieldError(fld, msg || "Заполните поле");
  el.addEventListener("input", () => setFieldError(fld, null), { once: true });
}

function validateStep(g) {
  let ok = true;
  let firstInvalid = null;

  const check = (scope, f) => {
    const el = scope.querySelector(`[data-key="${f.key}"]`);
    const v = el ? el.value : "";
    if (f.required && !v.trim()) {
      markInvalid(scope, f.key, "Заполните поле");
      ok = false;
      if (!firstInvalid) firstInvalid = el;
      return;
    }
    const msg = validateValue(f, v);
    if (msg) {
      markInvalid(scope, f.key, msg);
      ok = false;
      if (!firstInvalid) firstInvalid = el;
    }
  };

  if (g.repeatable) {
    const reps = [...els.step.querySelectorAll("[data-rep]")];
    if (g.fields.some((f) => f.required) && reps.length === 0) {
      setStatus(`Добавьте хотя бы одну сторону в разделе «${g.title}».`, true);
      return false;
    }
    reps.forEach((rep) => g.fields.forEach((f) => check(rep, f)));
  } else {
    g.fields.forEach((f) => check(els.step, f));
  }

  if (!ok) {
    setStatus("Заполните обязательные поля и проверьте формат (отмечены *).", true);
    if (firstInvalid) firstInvalid.focus();
  }
  return ok;
}

function validateData(tpl) {
  for (const g of getGroups(tpl)) {
    if (g.repeatable) {
      const reps = data[g.id] || [];
      if (g.fields.some((f) => f.required) && reps.length === 0)
        return `Добавьте сторону в раздел «${g.title}».`;
      for (const rep of reps) {
        for (const f of g.fields) {
          if (f.required && !(rep[f.key] || "").trim())
            return `Заполните обязательное поле в «${g.title}».`;
          const msg = validateValue(f, rep[f.key] || "");
          if (msg) return `${g.title}: ${msg}.`;
        }
      }
    } else {
      const o = data[g.id] || {};
      for (const f of g.fields) {
        if (f.required && !(o[f.key] || "").trim())
          return `Заполните обязательное поле «${f.label}».`;
        const msg = validateValue(f, o[f.key] || "");
        if (msg) return `${f.label}: ${msg}.`;
      }
    }
  }
  return null;
}

// ---- Typst source generation ----

function typstStr(v) {
  let s = String(v ?? "");
  // Drop control characters that Typst string literals cannot represent.
  // \t \n \r are kept and re-emitted as Typst-legal escapes below.
  s = s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
  // Build the string manually so we NEVER emit a JS-style \uXXXX escape,
  // which Typst's parser rejects (it only knows \" \\ \n \r \t). This makes
  // the generated source safe for any user input, including random text.
  let out = '"';
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp >= 0xd800 && cp <= 0xdfff) continue; // drop lone surrogates
    if (ch === '"') out += '\\"';
    else if (ch === "\\") out += "\\\\";
    else if (ch === "\n") out += "\\n";
    else if (ch === "\r") out += "\\r";
    else if (ch === "\t") out += "\\t";
    else out += ch;
  }
  return out + '"';
}

function buildFieldTypeMap(tpl) {
  const m = {};
  for (const g of getGroups(tpl)) for (const f of g.fields) if (!(f.key in m)) m[f.key] = f;
  return m;
}

function typstDict(o, typeMap) {
  const parts = Object.entries(o).filter(([k]) => k !== "_partyId").map(([k, v]) => {
    const f = typeMap?.[k];
    let val = v;
    if (f && f.type === "date" && v) val = ruDateDisplay(v);
    return `${k}: ${typstStr(val)}`;
  });
  return `( ${parts.join(", ")} )`;
}

// `specimen: true` marks a compiled example: templates that know the flag
// render a small "образец" note, templates that do not simply ignore it.
function buildSource(tpl, values, { specimen = false } = {}) {
  const fieldTypeMap = buildFieldTypeMap(tpl);
  if (isGrouped(tpl)) {
    const entries = getGroups(tpl).map((g) => {
      let val;
      if (g.repeatable) {
        const dicts = ((values[g.id]) || []).map((r) => typstDict(r, fieldTypeMap));
        // Always emit a tuple so the doc function can iterate it, even with a
        // single party: a lone parenthesised dict parses as a dict, not an
        // array. A trailing comma forces a 1-tuple.
        val = dicts.length
          ? `( ${dicts.join(", ")}${dicts.length === 1 ? "," : ""} )`
          : "( )";
      } else {
        val = typstDict(values[g.id] || {}, fieldTypeMap);
      }
      return `  ${g.id}: ${val}`;
    });
    if (specimen) entries.push("  _specimen: true");
    return `${tpl.typ}\n\n#doc(\n  data: (\n${entries.join(",\n")}\n  )\n)\n`;
  }
  // Legacy flat schema: named parameters.
  const args = tpl.schema.fields
    .map((f) => {
      let v = values.fields?.[f.key] ?? "";
      if (f.type === "date" && v) v = ruDateDisplay(v);
      return `  ${f.key}: ${typstStr(v)}`;
    })
    .join(",\n");
  return `${tpl.typ}\n\n#doc(\n${args}\n)\n`;
}

function pdfFilename(tpl, values, label = "") {
  const terms = values.terms || {};
  const date = ruDateDisplay(terms.date || todayISO());
  const vehicle = values.vehicle?.model?.trim();
  const subject = tpl.id === "car-contract" && vehicle ? ` — ${vehicle}` : "";
  const tag = label ? ` (${label})` : "";
  const raw = `${tpl.schema.name}${subject}${tag} — ${date}`;
  return raw
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[. ]+$/g, "") + ".pdf";
}

// ---- example ("образец") document: fill a template with sample data ----

// Plausible values so any template can be shown filled in. Groups whose fields
// include `fio` are treated as parties and filled from SAMPLE_PARTIES; every
// other group falls back to its group entry, the field placeholder, then to a
// type-appropriate default. A value may be a function, evaluated on use.
const SAMPLE_PARTIES = [
  {
    fio: "Иванов Иван Иванович",
    birthdate: "1990-05-14",
    passport_series: "4509",
    passport_number: "123456",
    passport_issued: "ОВД Кировского района г. Москвы",
    passport_code: "770-001",
    passport_date: "2010-06-20",
    address: "г. Москва, ул. Ленина, д. 10, кв. 5",
    phone: "+7 (916) 123-45-67",
  },
  {
    fio: "Петрова Мария Сергеевна",
    birthdate: "1985-11-02",
    passport_series: "5011",
    passport_number: "654321",
    passport_issued: "ОУФМС России по г. Санкт-Петербургу",
    passport_code: "780-002",
    passport_date: "2012-03-15",
    address: "г. Санкт-Петербург, Невский проспект, д. 20, кв. 7",
    phone: "+7 (921) 987-65-43",
  },
];

const SAMPLE_GROUPS = {
  vehicle: {
    plate: "А123ВС 77",
    vin: "XTA210990Y1234567",
    model: "Lada Vesta",
    type: "легковой автомобиль",
    category: "B",
    year: "2020",
    engine: "21179, 1234567",
    chassis: "отсутствует",
    body: "1234567890",
    color: "белый",
    power: "106 кВт / 143 л. с.",
    displacement: "1774",
    eco_class: "Евро-5",
    max_mass: "1700",
    individual_features: "отсутствуют",
    pts: "77 ТС 123456",
    pts_issued: "ООО «Авто-Сервис», 12.01.2020",
    sts: "77 ТС 654321",
    sts_issued: "ОГИБДД УМВД России по г. Москве, 15.01.2020",
  },
  housing: {
    housing_type: "Квартира",
    address: "г. Санкт-Петербург, Невский проспект, д. 20, кв. 7",
    area: "54,3",
    living_area: "38,1",
    rooms: "2",
    floor: "5 из 9",
    cadastral: "78:31:0001234:56",
    ownership: "выписка из ЕГРН от 01.01.2024",
    encumbrances: "Отсутствуют",
  },
  terms: {
    place: "Москва",
    date: todayISO,
    price: "1500000",
    price_words: "один миллион пятьсот тысяч рублей 00 копеек",
    start_date: todayISO,
    end_date: () => isoFromToday(330),
    notice_days: "30",
    rent: "40000",
    rent_words: "сорок тысяч рублей 00 копеек",
    deposit: "40000",
    payment_terms: "не позднее 5-го числа каждого месяца, наличными или переводом на карту",
    utilities: "коммунальные платежи включены в арендную плату, кроме электроэнергии",
    condition: "Помещение в удовлетворительном состоянии, выполнен косметический ремонт",
    property: "диван, шкаф, стол, стулья, холодильник, стиральная машина, плита",
    residents: "Отсутствуют",
    pets: "Не допускаются",
    repairs: "текущий ремонт — за счёт Арендатора; перепланировка — только по письменному согласию Арендодателя",
    additional: "Арендатор освобождает Помещение и снимается с учёта не позднее 14 дней после окончания аренды",
    appendices: "акт приёма-передачи Помещения, опись имущества",
  },
};

// Per-template corrections where a shared group needs its own wording.
const SAMPLE_OVERRIDES = {
  "rent-contract": { terms: { place: "Санкт-Петербург" } },
};

// Today + N days as YYYY-MM-DD.
function isoFromToday(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function isPartyGroup(g) {
  return (g.fields || []).some((f) => f.key === "fio");
}

// First value that is actually filled in (skips undefined, null and "").
function firstFilled(...values) {
  for (const v of values) if (v !== undefined && v !== null && v !== "") return v;
  return "";
}

function sampleDefault(f) {
  if (f.type === "select") return (f.options || [])[0] || "";
  if (f.type === "date") return todayISO();
  return "";
}

// Sample values for any template, shaped like emptyData(): a list of parties
// for repeatable groups, a dictionary otherwise.
function sampleData(tpl) {
  const out = {};
  let partyIndex = 0;
  for (const g of getGroups(tpl)) {
    const overrides = (SAMPLE_OVERRIDES[tpl.id] || {})[g.id] || {};
    const byGroup = SAMPLE_GROUPS[g.id] || {};
    const party = isPartyGroup(g) ? SAMPLE_PARTIES[partyIndex++ % SAMPLE_PARTIES.length] : {};
    const valueOf = (f) => {
      const v = firstFilled(
        overrides[f.key],
        byGroup[f.key],
        party[f.key],
        f.placeholder,
        sampleDefault(f)
      );
      return typeof v === "function" ? v() : v;
    };
    const dict = Object.fromEntries(g.fields.map((f) => [f.key, valueOf(f)]));
    out[g.id] = g.repeatable ? [dict] : dict;
  }
  return out;
}

function canShareFile(file) {
  try {
    return !!(
      file &&
      navigator.canShare &&
      navigator.share &&
      navigator.canShare({ files: [file] })
    );
  } catch {
    return false;
  }
}

// Compile a filled example of `tpl` and offer it for preliminary review: the
// native share sheet when the browser can send files, a plain download when
// it cannot (or when sharing fails).
async function sendSample(tpl, button) {
  const values = sampleData(tpl);
  const source = buildSource(tpl, values, { specimen: true });
  const filename = pdfFilename(tpl, values, "образец");
  if (button) button.disabled = true;
  setStatus("Собираем пример договора…");
  try {
    const pdf = await $typst.pdf({ mainContent: source });
    const blob = new Blob([pdf], { type: "application/pdf" });
    const file = new File([blob], filename, { type: "application/pdf" });
    if (canShareFile(file)) {
      try {
        await navigator.share({
          files: [file],
          title: `Образец: ${tpl.schema.name}`,
          text: `Пример заполненного документа «${tpl.schema.name}» — на предварительное ознакомление.`,
        });
        setStatus("Пример отправлен на предварительное ознакомление.");
        return;
      } catch (e) {
        if (e && e.name === "AbortError") {
          setStatus("Отправка отменена — пример можно собрать заново.");
          return;
        }
        // Sharing is unavailable for another reason: fall back to a download.
      }
    }
    downloadBlob(blob, filename);
    setStatus("Пример готов и скачан — отправьте файл в мессенджере, почте или облаке.");
  } catch (e) {
    console.error(e);
    console.error("[typst source]\n" + source);
    window.__lastTypstSource = source;
    setStatus("Не удалось собрать пример — проверьте консоль (F12).", true);
  } finally {
    if (button) button.disabled = false;
  }
}

// ---- PDF export ----

async function exportPdf() {
  writeStep(getWizardGroups(current)[stepIndex]);
  const err = validateData(current);
  if (err) {
    setStatus(err, true);
    return;
  }

  const source = buildSource(current, data);
  els.next.disabled = true;
  els.back.disabled = true;
  setStatus("Компиляция PDF…");

  try {
    const pdf = await $typst.pdf({ mainContent: source });
    const blob = new Blob([pdf], { type: "application/pdf" });
    downloadBlob(blob, pdfFilename(current, data));
    addDoc(current, data);
    setStatus("Готово — PDF скачан и сохранён в «Мои документы».");
  } catch (e) {
    console.error(e);
    // Dump the exact source we tried to compile so the failure is diagnosable.
    // Check the console (F12): if you see `str(n) + ". "` in the template,
    // the new code is live; if you still see `[#(n). ]`, the build is stale.
    console.error("[typst source]\n" + source);
    window.__lastTypstSource = source;
    showSourceDump(source);
    setStatus("Ошибка компиляции — исходник показан ниже (раскройте «Показать Typst-исходник»).", true);
  } finally {
    els.next.disabled = false;
    els.back.disabled = false;
  }
}

// ---- status helper ----

function setStatus(msg, isError = false) {
  els.status.textContent = msg || "";
  els.status.hidden = !msg;
  els.status.classList.toggle("error", !!isError);
}

// ---- template picker ----

function initPicker() {
  // Footer template links: same action as the cards, but real anchors so the
  // document names stay crawlable in the static HTML.
  for (const link of document.querySelectorAll(".foot-links a[data-tpl]")) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tpl = templates.find((t) => t.id === link.dataset.tpl);
      if (tpl) openTemplate(tpl);
    });
  }

  for (const t of templates) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name;
    els.tpl.appendChild(opt);
  }
  els.tpl.value = current.id;
  els.tpl.addEventListener("change", () => {
    const tpl = templates.find((t) => t.id === els.tpl.value) || templates[0];
    openTemplate(tpl);
  });
  renderSavedDocs();
  renderTemplateCards();
}

if (els.appVersion) els.appVersion.textContent = APP_VERSION;

initPicker();
data = emptyData(current);
showStartScreen();
