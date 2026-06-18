# Forms and error handling

## Labels

Every input has a **`<label>`** with `htmlFor` matching `id`, or the input is wrapped in a label. Placeholder is **not** a label.

## Required fields

Mark **required** in code (`required` attribute) and indicate visually (asterisk + text in legend or label). Screen readers announce required state.

## Errors

- Associate error text with the field via **`aria-describedby`** pointing to the error element’s `id`.
- Do not rely on **color alone** for error state—use text, icon + text, or borders **with** text.
- On submit, move **focus** to the first invalid field or its error summary.

## Error summary

For multiple errors, a **summary** at the top with links to fields helps everyone; ensure the summary is announced (`role="alert"` or focus move to summary—pick one pattern and test).

## Grouping

Use **`fieldset` + `legend`** for related groups (e.g. radio groups, address blocks).

## Autocomplete

Use appropriate **`autocomplete`** values where applicable (email, name, tel) to help users and assistive tech.
