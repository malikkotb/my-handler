# Page Builder Section (Plop)

- **Generator**: "Page Builder Section". Creates a new page builder section (e.g. hero -> heroSection).
- **Prompt**: `name` — section name; names are suffixed with "Section" (e.g. cta -> ctaSection).
- **Creates**: Schema in `sanity/schemas/page-sections/{{kebabCase name}}.tsx`; updates `sanity/schemas/page-sections/index.ts` (import + export); component in `features/page-builder/sections/{{kebabCase name}}.tsx`; updates `features/page-builder/page-sections.tsx` (dynamic import + registry). Runs `npm run sanity:typegen` and format.
- **Templates**: `templates/page-builder-section/schema.tsx.hbs`, `component.tsx.hbs`. Component fetches section by `docId` and `sectionKey` with a query on `pageBuilder.sectionsArray`.
- Reuse an existing section type when it fits; do not scaffold a new one without need.
