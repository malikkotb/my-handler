# Keyboard and focus

## Tab order

Tab order should follow **visual reading order** (usually top-to-bottom, left-to-right in LTR). Avoid positive `tabIndex` except rare cases; **`tabIndex={0}`** inserts in natural order; **`tabIndex={-1}`** makes focusable programmatically but not in tab sequence.

## Focus visible

Do not remove **`outline`** without a **visible** replacement (`:focus-visible`). Custom focus rings must meet contrast against adjacent colors.

## Modals and overlays

When a dialog opens:

- **Trap focus** inside the dialog (Tab cycles within).
- **Escape** closes (unless destructive—confirm pattern).
- On close, **return focus** to the element that opened the dialog.

Prefer primitives/libraries that implement **focus trap** and **restore** (e.g. Radix Dialog, Mantine Modal) over ad-hoc `useEffect` unless you match the same behavior.

## Menus and composite widgets

For toolbars, tab lists, and menus: follow **roving tabindex** or the library’s keyboard model (Arrow keys, Home/End). Do not require mouse for any exposed action.

## Keyboard shortcuts

If you add **global shortcuts**, document them and avoid clashing with browser/OS defaults where possible; ensure there is a **non-keyboard** path to the same action.

## Page changes

After **client navigation**, avoid leaving focus on a detached node—move focus to **`h1`** or `main` when appropriate (framework-dependent; align with **view-transitions** if focus must wait for transition end).
