// Template registry. Add a new template by dropping a `.typ` (function `doc(..)`)
// and a sidecar `.schema.json` into /templates and appending an entry here.
import exampleTyp from '../templates/example.typ?raw';
import exampleSchema from '../templates/example.schema.json';

export const templates = [
  {
    id: exampleSchema.id,
    name: exampleSchema.name,
    typ: exampleTyp,
    schema: exampleSchema,
  },
];
