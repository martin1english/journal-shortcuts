# 1.5.0

* Added `@ActivateScene|scene-transitions[Scene]{Label}` — activates the scene behind the transition already set up on that scene via the Scene Transitions module, so the curtain is up on every client before the scene changes. The argument names the target module, so further integrations can be added without new syntax.
* Falls back to a normal activation, unchanged from previous versions, whenever the scene has no transition set up, the named module is not installed or active, or the module id is not one Journal Shortcuts knows. Existing links and documents are unaffected — the new form is an additional pattern, and no existing enricher changed.
* Ctrl+click still views the scene without transitioning.
* Documented `@PlayPlaylist` in the README, which had been missing since 1.3.0.

# 1.3.0

* Added @PlayPlaylist[Playlist]{Label} — a GM-clickable button that restarts a playlist for all connected players. Playlists are synced, so the restart propagates automatically; use it to start scene music once everyone has arrived, instead of relying on scene-activation autoplay (which the GM consumes before players log in). Omit the target (@PlayPlaylist{Label}) to control the active scene's linked playlist. Non-GM clicks show an info notification and take no action.

# 1.0.0

* Initial release of Journal Shortcuts for Foundry VTT v13
* Ported @ActivateScene and @ViewScene from Journals Like a Script (JLAS), modernised with vanilla JS
* Added @ActivateImage: show journal image pages to players via ImagePopout lightbox
* Added @ActivatePage: show any journal page to all connected players
* Added permission flags (|observer, |limited, |owner, |none) to set page-level ownership on click
* Retained JLAS configuration options for @ActivateScene link visibility and player scene viewing
