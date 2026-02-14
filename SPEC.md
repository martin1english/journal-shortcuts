# Journal Shortcuts — Functional Specification

**Module ID:** `journal-shortcuts`
**Target Platform:** Foundry VTT v13
**Status:** Draft — awaiting review

---

## 1. Purpose

A Foundry VTT module that lets GMs embed clickable action links in journal entries. One click can activate a scene, show an image to all players, and set page permissions — turning journals into scripted runbooks for game sessions.

This module replaces and modernises "Journals Like a Script" (JLAS), which is verified only for Foundry v10 and uses deprecated patterns.

---

## 2. Features Overview

| Link Syntax | What It Does |
|-------------|-------------|
| `@ActivateScene[sceneId]{Label}` | Activates a scene and opens its notes (from JLAS) |
| `@ViewScene[sceneId]{Label}` | Views a scene and opens its notes (from JLAS) |
| `@ActivateImage\|permission[uuid]{Label}` | Shows an image to players and sets page ownership (**new**) |
| `@ActivatePage\|permission[uuid]{Label}` | Shows a journal page to players and sets page ownership (**new**) |

---

## 3. @ActivateScene (ported from JLAS)

### Syntax
```
@ActivateScene[sceneId]{Display Text}
```

### GM Behaviour
- **Click:** Activates the scene and opens the scene's journal notes
- **Ctrl+Click:** Views the scene (without activating) and opens journal notes

### Player Behaviour
Controlled by two module settings:

1. **@ActivateScene Link Visibility** (world setting)
   - `Link` (default): Players see the link and can click it
   - `Text Only`: Players see plain text, no link
   - `None`: The link and text are completely hidden from players

2. **Players Can View Scenes Using @ActivateScene Links** (world setting, default: off)
   - When enabled, player clicks will view the linked scene
   - WARNING: May allow players to view scenes not in navigation tabs

### Broken Links
If the scene ID doesn't resolve, the link renders with a broken style (red dashed border, unlink icon).

---

## 4. @ViewScene (ported from JLAS)

### Syntax
```
@ViewScene[sceneId]{Display Text}
```

### Behaviour
- **Click (any user):** Views the scene and opens scene journal notes
- Not affected by the @ActivateScene visibility setting
- Ctrl+click has no special behaviour

### Broken Links
Same broken-link styling as @ActivateScene.

---

## 5. @ActivateImage (new feature)

### Syntax
```
@ActivateImage[JournalEntry.<id>.JournalEntryPage.<id>]{Display Text}
@ActivateImage|permission[JournalEntry.<id>.JournalEntryPage.<id>]{Display Text}
```

### User Workflow

1. Open Journal B in edit mode
2. Drag an image page from Journal A into the editor
3. Foundry produces: `@UUID[JournalEntry.abc123.JournalEntryPage.def456]{Page Name}`
4. Change `@UUID` to `@ActivateImage` (or `@ActivateImage|observer` to set permissions)
5. Save — the link appears styled with an image icon

The permission flag sits between the enricher name and the opening bracket, keeping the display text clean and untouched from what Foundry generates.

### Click Behaviour

**GM only.** Non-GM users see the link but clicking shows an info notification and takes no action.

On GM click:

1. Resolve the UUID to a JournalEntryPage document
2. **Verify the page is an image page** (`page.type === "image"`)
   - If not an image page: show a warning notification and take no action
3. Open an ImagePopout (lightbox) displaying the image
4. Share the image to all connected players via `shareImage()`
5. Update the page's default ownership to the specified permission level

### Permission Flags

The permission flag goes after a `|` immediately following the enricher name, before the opening bracket. If omitted, defaults to `observer`.

| Flag | Foundry Level | Effect |
|------|--------------|--------|
| `observer` | OBSERVER (2) | Players can view the page (default) |
| `limited` | LIMITED (1) | Players get limited access |
| `owner` | OWNER (3) | Players get full ownership |
| `none` | NONE (0) | No persistent access — image shown via popout only |

Invalid flag values default to `observer` with a console warning.

### Permission Scope

- Permissions are set on the **JournalEntryPage** only, not the parent JournalEntry
- **Important:** Players can only access a page if they also have at least LIMITED on the parent JournalEntry. The GM must ensure the parent journal has appropriate permissions separately. This is intentional — it prevents the module from accidentally exposing other pages in the same journal.

### Broken Links

If the UUID doesn't resolve at render time, the link shows broken styling. If the document is deleted between render and click, a warning notification appears.

---

## 6. @ActivatePage (new feature)

### Syntax
```
@ActivatePage[JournalEntry.<id>.JournalEntryPage.<id>]{Display Text}
@ActivatePage|permission[JournalEntry.<id>.JournalEntryPage.<id>]{Display Text}
```

### User Workflow

1. Open Journal B in edit mode
2. Drag any page from Journal A into the editor
3. Foundry produces: `@UUID[JournalEntry.abc123.JournalEntryPage.def456]{Page Name}`
4. Change `@UUID` to `@ActivatePage` (or `@ActivatePage|observer` to set permissions)
5. Save — the link appears styled with a file icon

### Click Behaviour

**GM only.** Non-GM users see the link but clicking shows an info notification and takes no action.

On GM click:

1. Resolve the UUID to a JournalEntryPage document
2. Show the page to all connected players using `Journal.show(page, { force: true })`
3. Update the page's default ownership to the specified permission level

### Permission Flags

Same as @ActivateImage — see Section 5.

### Permission Scope

Same as @ActivateImage — page-level only, parent JournalEntry permissions are the GM's responsibility.

### Broken Links

Same behaviour as @ActivateImage.

### When to use @ActivatePage vs @ActivateImage

| Use case | Enricher |
|----------|----------|
| Show a handout image in a lightbox popout | `@ActivateImage` |
| Show a text page, PDF, or any other page type on screen | `@ActivatePage` |
| Show an image page but as a full journal page (not lightbox) | `@ActivatePage` |

---

## 7. Visual Design

All four link types render as inline styled anchors within journal text:

- **Scene links** (@ActivateScene, @ViewScene): Grey background (`#DDD`), scene sidebar icon
- **Image links** (@ActivateImage): Green-tinted background (`#D8E8D8`), image icon (`fas fa-image`)
- **Page links** (@ActivatePage): Blue-tinted background (`#D8D8E8`), file icon (`fas fa-file-lines`)
- **Broken links:** Red dashed border, unlink icon (`fas fa-unlink`)
- **Hover:** Subtle text shadow on all link types

---

## 8. Technical Approach

### Architecture
- Vanilla JavaScript, ES modules, no jQuery
- Custom text enrichers registered via `CONFIG.TextEditor.enrichers`
- Click handling via vanilla JS event delegation on `document.body`
- ImagePopout via Foundry v13's `foundry.applications.apps.ImagePopout` (ApplicationV2)

### File Structure
```
journal-shortcuts/
  module.json                         — Module manifest
  modules/
    journal-shortcuts.mjs             — Entry point (hooks, settings, registration)
    enrichers/
      activate-scene.mjs              — @ActivateScene enricher
      view-scene.mjs                  — @ViewScene enricher
      activate-image.mjs              — @ActivateImage enricher
      activate-page.mjs               — @ActivatePage enricher
    handlers/
      scene-handlers.mjs              — Scene click handlers
      image-handler.mjs               — Image click handler
      page-handler.mjs                — Page click handler
    lib/
      constants.mjs                   — Module ID, CSS classes, permission map
      utils.mjs                       — Shared helpers (link builder, permission parser)
  styles/
    journal-shortcuts.css             — All link styling
  README.md
  LICENSE
  changelog.md
```

### Key API Calls

**Showing an image to players:**
```js
const popout = new foundry.applications.apps.ImagePopout({
  src: page.src,
  uuid: page.uuid,
  window: { title: page.name }
});
await popout.render(true);
popout.shareImage();
```

**Showing a journal page to players:**
```js
Journal.show(page, { force: true });
```

**Updating page ownership:**
```js
await page.update({
  ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER }
});
```

**Resolving a UUID (in enricher, synchronous):**
```js
const page = fromUuidSync("JournalEntry.abc123.JournalEntryPage.def456");
```

---

## 9. Out of Scope

- Undo/revoke permissions (GM handles manually)
- Per-user permission targeting (always sets `default` for all players)
- Auto-setting parent JournalEntry permissions
- Video page support
- Player-triggered image sharing
- Scheduling or delayed actions

---

## 10. Open Questions

None currently — all decisions have been made. Ready for implementation on approval.

---

## 11. Testing Plan

Manual testing in a running Foundry v13 instance:

1. **Module loads** — enable module, verify console init message, no errors
2. **@ActivateScene** — link renders, GM click activates scene, ctrl+click views, notes open, player visibility settings all three modes, broken link styling
3. **@ViewScene** — link renders, click views scene, notes open, broken link styling
4. **@ActivateImage on image page** — link renders with image icon, GM click shows ImagePopout, image shared to connected players, page ownership updated (verify in Configure Permissions dialog)
5. **@ActivateImage on non-image page** — warning notification, no action taken
6. **@ActivatePage** — link renders with file icon, GM click shows page to all players, page ownership updated
7. **@ActivatePage on various page types** — test with text, image, PDF pages to confirm all work
8. **Permission flags** (both @ActivateImage and @ActivatePage) — test each: `observer`, `limited`, `owner`, `none`, invalid string (defaults to observer)
9. **Non-GM clicks** (@ActivateImage and @ActivatePage) — info notification, no action taken
10. **Edge cases** — deleted documents after link created, invalid UUIDs, rapid double-click
