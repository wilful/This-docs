import "./style.css";
import { $typst } from "@myriaddreamin/typst.ts/contrib/all-in-one-lite";
import compilerWasmUrl from "@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url";
import rendererWasmUrl from "@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url";
import { templates } from "./templates.js";

// Point the WASM runtime at the compiler/renderer binaries (separate packages).
$typst.setCompilerInitOptions({ getModule: () => compilerWasmUrl });
$typst.setRendererInitOptions({ getModule: () => rendererWasmUrl });

const PARTY_PREFIX = "docbuilder:parties:";

const els = {
  tpl: document.getElementById("template"),
  steps: document.getElementById("steps"),
  step: document.getElementById("step"),
  status: document.getElementById("status"),
  back: document.getElementById("back"),
  next: document.getElementById("next"),
};

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
        autocomplete: f.autocomplete || "off",
      };
  }
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
  control.value = value ?? "";
  if (f.placeholder && a.el !== "select") control.placeholder = f.placeholder;
  control.autocomplete = a.autocomplete || "off";
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
  const rep = document.createElement("div");
  rep.className = "rep";
  rep.dataset.rep = index;

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
  const groups = getGroups(current);
  const g = groups[stepIndex];

  els.step.innerHTML = "";
  const card = document.createElement("div");
  card.className = "card";

  const title = document.createElement("h2");
  title.className = "group-title";
  title.textContent = g.title;
  card.appendChild(title);

  if (g.repeatable) {
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
}

function renderSteps(groups) {
  els.steps.innerHTML = "";
  groups.forEach((g, i) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "step-chip";
    const num = document.createElement("span");
    num.className = "num";
    num.textContent = String(i + 1);
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = g.title;
    chip.append(num, title);
    if (i === stepIndex) chip.setAttribute("aria-current", "step");
    else if (i < stepIndex) chip.classList.add("done");
    chip.addEventListener("click", () => gotoStep(i));
    els.steps.appendChild(chip);
  });
}

function renderActions(groups) {
  const last = stepIndex === groups.length - 1;
  els.back.disabled = stepIndex === 0;
  els.next.textContent = last ? "Скачать PDF" : "Далее";
}

// ---- navigation ----

function gotoStep(target) {
  if (target === stepIndex) return;
  if (target > stepIndex && !validateStep(getGroups(current)[stepIndex])) return;
  writeStep(getGroups(current)[stepIndex]);
  stepIndex = target;
  renderStep();
}

els.next.addEventListener("click", () => {
  const groups = getGroups(current);
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
  writeStep(getGroups(current)[stepIndex]);
  stepIndex--;
  renderStep();
});

// ---- read / write current step to state ----

function writeStep(g) {
  if (g.repeatable) {
    const reps = [...els.step.querySelectorAll("[data-rep]")];
    data[g.id] = reps.map((rep) => {
      const o = {};
      for (const f of g.fields) {
        const el = rep.querySelector(`[data-key="${f.key}"]`);
        o[f.key] = el ? el.value : "";
      }
      return o;
    });
  } else {
    const o = {};
    for (const f of g.fields) {
      const el = els.step.querySelector(`[data-key="${f.key}"]`);
      o[f.key] = el ? el.value : "";
    }
    data[g.id] = o;
  }
}

// ---- validation ----

function markInvalid(scope, key) {
  const el = scope.querySelector(`[data-key="${key}"]`);
  if (!el) return;
  const fld = el.closest(".field");
  if (!fld) return;
  fld.classList.add("invalid");
  el.addEventListener("input", () => fld.classList.remove("invalid"), { once: true });
}

function validateStep(g) {
  let ok = true;
  let firstInvalid = null;

  if (g.repeatable) {
    const reps = [...els.step.querySelectorAll("[data-rep]")];
    if (g.fields.some((f) => f.required) && reps.length === 0) {
      setStatus(`Добавьте хотя бы одну сторону в разделе «${g.title}».`, true);
      return false;
    }
    reps.forEach((rep) => {
      for (const f of g.fields) {
        if (f.required) {
          const el = rep.querySelector(`[data-key="${f.key}"]`);
          if (!el || !el.value.trim()) {
            markInvalid(rep, f.key);
            ok = false;
            if (!firstInvalid) firstInvalid = el;
          }
        }
      }
    });
  } else {
    for (const f of g.fields) {
      if (f.required) {
        const el = els.step.querySelector(`[data-key="${f.key}"]`);
        if (!el || !el.value.trim()) {
          markInvalid(els.step, f.key);
          ok = false;
          if (!firstInvalid) firstInvalid = el;
        }
      }
    }
  }

  if (!ok) {
    setStatus("Заполните обязательные поля (отмечены *).", true);
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
        }
      }
    } else {
      const o = data[g.id] || {};
      for (const f of g.fields) {
        if (f.required && !(o[f.key] || "").trim())
          return `Заполните обязательное поле «${f.label}».`;
      }
    }
  }
  return null;
}

// ---- Typst source generation ----

function typstStr(v) {
  return JSON.stringify(String(v ?? ""));
}

function typstDict(o) {
  const parts = Object.entries(o).map(([k, v]) => `${k}: ${typstStr(v)}`);
  return `( ${parts.join(", ")} )`;
}

function buildSource(tpl, values) {
  if (isGrouped(tpl)) {
    const entries = getGroups(tpl).map((g) => {
      const val = g.repeatable
        ? `( ${((values[g.id]) || []).map((r) => typstDict(r)).join(", ")} )`
        : typstDict(values[g.id] || {});
      return `  ${g.id}: ${val}`;
    });
    return `${tpl.typ}\n\n#doc(\n  data: (\n${entries.join(",\n")}\n  )\n)\n`;
  }
  // Legacy flat schema: named parameters.
  const args = tpl.schema.fields
    .map((f) => `  ${f.key}: ${typstStr(values.fields?.[f.key] ?? "")}`)
    .join(",\n");
  return `${tpl.typ}\n\n#doc(\n${args}\n)\n`;
}

// ---- PDF export ----

async function exportPdf() {
  writeStep(getGroups(current)[stepIndex]);
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${current.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Готово — PDF скачан.");
  } catch (e) {
    console.error(e);
    setStatus("Ошибка компиляции: " + (e?.message || e), true);
  } finally {
    els.next.disabled = false;
    els.back.disabled = false;
  }
}

// ---- status helper ----

function setStatus(msg, isError = false) {
  els.status.textContent = msg || "";
  els.status.classList.toggle("error", !!isError);
}

// ---- template picker ----

function initPicker() {
  for (const t of templates) {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.name;
    els.tpl.appendChild(opt);
  }
  els.tpl.value = current.id;
  els.tpl.addEventListener("change", () => {
    current = templates.find((t) => t.id === els.tpl.value) || templates[0];
    stepIndex = 0;
    data = emptyData(current);
    renderStep();
  });
}

initPicker();
data = emptyData(current);
renderStep();
