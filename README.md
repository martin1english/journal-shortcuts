# Journal Shortcuts

Embed clickable action links in Foundry VTT journal entries that activate scenes, show images to players, display journal pages, share items, and set permissions — all in a single click.

Journal Shortcuts is a spiritual successor to [Journals Like a Script](https://github.com/claypooj21/journals-like-a-script), modernised for Foundry VTT v13 with vanilla JavaScript and new features.

## Quick Reference

Type these prefixes directly into a journal entry's text editor:

| Prefix | What It Does | Example |
|--------|-------------|---------|
| `@ActivateScene` | Activate a scene (GM) | `@ActivateScene[Scene.abc123]{Go to Tavern}` |
| `@ViewScene` | View a scene without activating | `@ViewScene[Scene.abc123]{Look at Tavern}` |
| `@ActivateImage` | Show an image to all players | `@ActivateImage[JournalEntry.xxx.JournalEntryPage.yyy]{Show Map}` |
| `@ActivatePage` | Show a journal page to all players | `@ActivatePage[JournalEntry.xxx.JournalEntryPage.yyy]{Read Note}` |
| `@ActivateItem` | Show an item to all players | `@ActivateItem[Item.abc123]{Magic Sword}` |

## How to Use

### Step 1 — Get the ID

Every link needs an ID inside the square brackets. The easiest way to get one:

1. Open a journal.
2. **Drag** the target (a scene, journal page, or item) into the editor
3. Foundry will insert something like `@UUID[Scene.abc123]{Scene Name}`, `@UUID[JournalEntry.xxx.JournalEntryPage.yyy]{Page Name}`, or `@UUID[Item.abc123]{Item Name}`

### Step 2 — Change the Prefix

Replace `@UUID` with the Journal Shortcuts prefix you want:

| You want to... | Change `@UUID` to |
|---------------|--------------------|
| Activate a scene | `@ActivateScene` | 
| Show an image | `@ActivateImage` | 
| Show a page | `@ActivatePage` | 
| Show an item | `@ActivateItem` |

example
@ActivateScene[Scene.8S8Gbw6ZmeGMNqLE]{El Profundo Ranch Exterior}


#### Permission Flags

`@ActivateImage`, `@ActivatePage`, and `@ActivateItem` support an optional permission flag. `|`:  (Shift |)

Add it between the prefix and the opening bracket. 

```
@ActivateImage|observer[uuid]{Label}
@ActivatePage|limited[uuid]{Label}
@ActivateItem|observer[uuid]{Label}

example
@ActivateImage|owner[JournalEntry.ELzutTZxysaj508G.JournalEntryPage.ZE6HY7AK00vbX12n]{Dasheill Hammett}
@ActivatePage|owner[JournalEntry.v0DGDWD6D9479f2B.JournalEntryPage.EeSF5aNuTNIIWW1X]{San Francisco in 1925}
@ActivateItem|owner[Item.zrVJgoy1DyMNugiN]{Webley MK IV}

```

| Flag | Effect |
|------|--------|
| `observer` | Players can view the page (default when a flag is used) |
| `limited` | Players get limited access |
| `owner` | Players get full ownership |
| `none` | No persistent access |

If no flag is specified, no ownership changes are made. For journal pages, permissions are set on the **JournalEntryPage only** — the GM must ensure the parent JournalEntry has at least Limited access for players to see its pages. For items, permissions are set on the **Item document**.

### Step 3 — Save

Save the journal entry. The text will render as a clickable link. Click it to trigger the action.

## Configuration

Find these settings under `Game Settings > Configure Settings > Journal Shortcuts`.

### Scene Link Visibility for Players

Controls what non-GM users see for `@ActivateScene` links (does not affect `@ViewScene` links):

- **Link** (default) — players see and can click the link
- **Text Only** — players see plain text, no clickable link
- **None** — the link is completely hidden from players

### Players Can View Scenes

When enabled, non-GM users clicking `@ActivateScene` links will view the associated scene. **Warning:** this may allow players to view scenes not shown in navigation tabs.

## Tips

- Use `Secret` paragraphs (`Format > Block > Secret`) to hide links from players until the right moment
- Use `@ViewScene` for player-facing navigation links, `@ActivateScene` for GM scripting
- Use `@ActivateImage` when you want a quick lightbox reveal, `@ActivatePage` when you want to open the full journal page
- You can use a scene's **name** instead of its ID: `@ActivateScene[Tavern]{Go to Tavern}`

## Compatibility

- **Verified:** Foundry VTT v13
