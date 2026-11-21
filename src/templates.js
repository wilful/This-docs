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
import carTyp from "../templates/car-contract.typ?raw";
import carSchema from "../templates/car-contract.schema.json";
import rentTyp from "../templates/rent-contract.typ?raw";
import rentSchema from "../templates/rent-contract.schema.json";

export const templates = [
  {
    id: carSchema.id,
    name: carSchema.name,
    typ: carTyp,
    schema: carSchema,
  },
  {
    id: rentSchema.id,
    name: rentSchema.name,
    typ: rentTyp,
    schema: rentSchema,
  },
];
