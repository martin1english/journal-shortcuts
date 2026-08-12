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
| `@PlayPlaylist` | Restart a playlist for all players (GM) | `@PlayPlaylist[Tavern Music]{Start Music}` |
| `@ActivateScene\|scene-transitions` | Activate a scene behind a transition (GM) | `@ActivateScene\|scene-transitions[Scene.abc123]{Go to Tavern}` |

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
| Start a playlist | `@PlayPlaylist` |

example
@ActivateScene[Scene.8S8Gbw6ZmeGMNqLE]{El Profundo Ranch Exterior}


#### Permission Flags

`@ActivateImage`, `@ActivatePage`, and `@ActivateItem` support an optional permission flag. `|`:  (Shift |)

Add it between the prefix and the opening bracket. 

```
@ActivateImage|observer[uuid]{Label}
@ActivatePage|limited[uuid]{Label}
@ActivateItem|observer[uuid]{Label}
```

```
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

#### Starting a Playlist

`@PlayPlaylist` restarts a playlist from the beginning for everyone connected. Playlists are synced by Foundry, so the restart reaches players automatically.

```
@PlayPlaylist[Tavern Music]{Start the music}
@PlayPlaylist{Start scene music}
```

Omit the target to use the **active scene's** linked playlist, which keeps the link reusable across scenes.

This exists because scene-activation autoplay is consumed by whoever activates the scene — usually the GM, before the players have logged in, leaving them in silence. Clicking the link once everyone has arrived starts the music for the whole table.

GM only. A non-GM click shows an info notification and does nothing.

#### Activating a Scene Behind a Transition

If you have the [Scene Transitions](https://github.com/p4535992/foundryvtt-scene-transitions) module installed, `@ActivateScene` can hand the scene change over to it, so players see the curtain go up before the scene changes underneath.

Set the transition up on the scene first: right-click the scene in the sidebar, choose **Create Transition**, add your text, image or video, and save. Then name the module in the link:

```
@ActivateScene|scene-transitions[Scene.8S8Gbw6ZmeGMNqLE]{El Profundo Ranch Exterior}
```

The argument is the module's id, not a keyword — so the same slot can name other modules as support for them is added.

Clicking activates the scene exactly as `@ActivateScene` does, except that Scene Transitions puts its curtain up on every connected client first and performs the activation behind it. Ctrl+click still views the scene with no transition.

It falls back to a plain activation — the same behaviour as a bare `@ActivateScene` link — when any of these is true:

- the scene has no transition set up on it
- Scene Transitions is not installed or not active
- the module id named is not one Journal Shortcuts knows about

So the link is always safe to click, and a scene link never stops working because of the extra argument.

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
