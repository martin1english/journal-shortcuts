# 1.3.0

* Added @PlayPlaylist[Playlist]{Label} — a GM-clickable button that restarts a playlist for all connected players. Playlists are synced, so the restart propagates automatically; use it to start scene music once everyone has arrived, instead of relying on scene-activation autoplay (which the GM consumes before players log in). Omit the target (@PlayPlaylist{Label}) to control the active scene's linked playlist. Non-GM clicks show an info notification and take no action.

# 1.0.0

* Initial release of Journal Shortcuts for Foundry VTT v13
* Ported @ActivateScene and @ViewScene from Journals Like a Script (JLAS), modernised with vanilla JS
* Added @ActivateImage: show journal image pages to players via ImagePopout lightbox
* Added @ActivatePage: show any journal page to all connected players
* Added permission flags (|observer, |limited, |owner, |none) to set page-level ownership on click
* Retained JLAS configuration options for @ActivateScene link visibility and player scene viewing
