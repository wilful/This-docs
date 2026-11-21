// Template registry. Add a new template by dropping a `.typ` (function `doc(..)`)
// and a sidecar `.schema.json` into /templates and appending an entry here.
//
// Two schema shapes are supported:
//  - Grouped (production): { id, name, groups: [ { id, title, repeatable?,
//    fields: [ { key, label, type, required?, placeholder?, options?,
//    autocomplete? } ] } ] }. The renderer builds a step per group; repeatable
//    groups allow multiple parties (add/remove). The compiled Typst call is
//    `doc(data: (<group_id>: <dict|array>, ...))`.
//  - Legacy flat: { id, name, fields: [...] }. Rendered as a single step with
//    the call `doc(key: "value", ...)`.
import salesTyp from "../templates/sales-contract.typ?raw";
import salesSchema from "../templates/sales-contract.schema.json";
import carTyp from "../templates/car-contract.typ?raw";
import carSchema from "../templates/car-contract.schema.json";

export const templates = [
  {
    id: salesSchema.id,
    name: salesSchema.name,
    typ: salesTyp,
    schema: salesSchema,
  },
  {
    id: carSchema.id,
    name: carSchema.name,
    typ: carTyp,
    schema: carSchema,
  },
];
