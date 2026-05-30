/* global game, ui, canvas */
import { CSS_CLASSES } from "../lib/constants.mjs";

/**
 * Register the click handler for @PlayPlaylist links.
 * Playlists are synchronised, so a GM restart propagates to all connected players.
 */
export function registerPlaylistHandler() {
  document.body.addEventListener("click", (event) => {
    const anchor = event.target.closest(`a.${CSS_CLASSES.playPlaylist}`);
    if (!anchor) return;
    event.preventDefault();
    _onClickPlayPlaylist(event, anchor);
  });
}

async function _onClickPlayPlaylist(event, anchor) {
  if (anchor.classList.contains(CSS_CLASSES.broken)) return;

  // Only the GM can control synchronised playlists.
  if (!game.user.isGM) {
    ui.notifications.info("Journal Shortcuts | Only the GM can start the scene playlist.");
    return;
  }

  // Resolve the playlist: an explicit id, or (scene mode) the active scene's playlist.
  let playlist = null;
  if (anchor.dataset.id) {
    playlist = game.playlists.get(anchor.dataset.id);
  } else if (anchor.dataset.scene === "true") {
    const scene = game.scenes.active ?? canvas?.scene;
    playlist = scene?.playlist ?? null;
    if (!playlist) {
      ui.notifications.warn("Journal Shortcuts | The active scene has no linked playlist.");
      return;
    }
  }

  if (!playlist) {
    ui.notifications.warn("Journal Shortcuts | This playlist link appears to be broken. Does the playlist still exist?");
    return;
  }

  // Restart from the top for everyone (stop then play -> clean restart, synced).
  await playlist.stopAll();
  await playlist.playAll();
  ui.notifications.info(`Journal Shortcuts | Playing playlist: ${playlist.name}`);
}
