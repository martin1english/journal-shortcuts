/* global game, fromUuid */
import { CSS_CLASSES } from "../lib/constants.mjs";
import { buildLink } from "../lib/utils.mjs";

/**
 * Enricher for @PlayPlaylist[Target]{Label}  (Target optional)
 * match[1] = "PlayPlaylist"
 * match[2] = playlist UUID / id / name (optional — omit to target the ACTIVE scene's playlist)
 * match[3] = display label (optional)
 *
 * A GM click restarts the playlist for everyone. Playlists are synchronised
 * documents, so the restart propagates to all connected players automatically —
 * use it to start scene music once players have arrived, instead of relying on
 * scene-activation autoplay (which the GM consumes before players log in).
 */
export async function enrichPlayPlaylist(match, options) {
  const target = match[2];
  const label = match[3];

  // No target -> resolve the active scene's linked playlist at click time.
  if (!target) {
    return buildLink({
      cssClass: CSS_CLASSES.playPlaylist,
      icon: "fas fa-music",
      label: label || "Play Scene Music",
      dataset: { type: "PlayPlaylist", entity: "Playlist", id: "", scene: "true" }
    });
  }

  // Resolve an explicit target: UUID first, then by id, then by name.
  let doc = null;
  try { doc = await fromUuid(target); } catch (e) { /* not a UUID */ }
  if (!doc) {
    const collection = game.collections.get("Playlist");
    doc = /^[a-zA-Z0-9]{16}$/.test(target)
      ? collection.get(target)
      : collection.getName(target);
  }

  if (!doc) {
    return buildLink({
      cssClass: CSS_CLASSES.playPlaylist,
      icon: "fas fa-unlink",
      label: label || target,
      dataset: { type: "PlayPlaylist", entity: "Playlist", id: "" },
      broken: true
    });
  }

  return buildLink({
    cssClass: CSS_CLASSES.playPlaylist,
    icon: "fas fa-music",
    label: label || doc.name,
    dataset: { type: "PlayPlaylist", entity: "Playlist", id: doc.id }
  });
}
