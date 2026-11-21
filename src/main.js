import './style.css';
import { $typst } from '@myriaddreamin/typst.ts/contrib/all-in-one-lite';
import compilerWasmUrl from '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url';
import rendererWasmUrl from '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url';
import { templates } from './templates.js';

// Point the WASM runtime at the compiler/renderer binaries (separate packages).
$typst.setCompilerInitOptions({ getModule: () => compilerWasmUrl });
$typst.setRendererInitOptions({ getModule: () => rendererWasmUrl });

const tplSelect = document.getElementById('template');
const form = document.getElementById('form');
const downloadBtn = document.getElementById('download');
const statusEl = document.getElementById('status');

let current = templates[0];

// Populate the template picker.
for (const t of templates) {
  const opt = document.createElement('option');
  opt.value = t.id;
  opt.textContent = t.name;
  tplSelect.appendChild(opt);
}

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.classList.toggle('error', isError);
}

// Build the form from the active template's schema.
function renderForm() {
  form.innerHTML = '';
  for (const f of current.schema.fields) {
    const label = document.createElement('label');
    label.textContent = f.label + (f.required ? ' *' : '');

    const input = document.createElement('input');
    input.type = f.type === 'date' ? 'date' : 'text';
    input.name = f.key;
    input.placeholder = f.placeholder || '';
    input.autocomplete = 'off';

    form.append(label, input);
  }
}

// Serialize the filled form into a Typst source: the template (which defines
// `doc`) followed by a call with JSON-encoded argument values. JSON.stringify
// yields a valid Typst string literal for any user input.
function buildSource(tpl, values) {
  const args = tpl.schema.fields
    .map((f) => `  ${f.key}: ${JSON.stringify(String(values[f.key] ?? ''))},`)
    .join('\n');
  return `${tpl.typ}\n\n#doc(\n${args}\n)\n`;
}

async function exportPdf() {
  const values = {};
  for (const f of current.schema.fields) {
    values[f.key] = form.elements[f.key]?.value ?? '';
  }

  const source = buildSource(current, values);
  downloadBtn.disabled = true;
  setStatus('Компиляция PDF…');

  try {
    const pdf = await $typst.pdf({ mainContent: source });
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${current.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Готово — PDF скачан.');
  } catch (e) {
    console.error(e);
    setStatus('Ошибка компиляции: ' + (e?.message || e), true);
  } finally {
    downloadBtn.disabled = false;
  }
}

tplSelect.addEventListener('change', () => {
  current = templates.find((t) => t.id === tplSelect.value) || templates[0];
  renderForm();
});
downloadBtn.addEventListener('click', exportPdf);

renderForm();
