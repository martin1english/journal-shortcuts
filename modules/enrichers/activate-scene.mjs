import { MODULE_ID, CSS_CLASSES } from "../lib/constants.mjs";
import { buildLink } from "../lib/utils.mjs";

/**
 * Enricher for @ActivateScene[sceneId]{Label}
 * match[1] = "ActivateScene"
 * match[2] = UUID path, scene ID, or scene name
 * match[3] = display label (optional)
 */
export async function enrichActivateScene(match, options) {
  return _buildSceneLink(match[2], match[3], "");
}

/**
 * Enricher for @ActivateScene|<module-id>[sceneId]{Label}
 * match[1] = provider module id (e.g. "scene-transitions")
 * match[2] = UUID path, scene ID, or scene name
 * match[3] = display label (optional)
 *
 * Target and label sit at the same group numbers as the bare form, because that
 * pattern captures the literal enricher name in group 1.
 */
export async function enrichActivateSceneVia(match, options) {
  return _buildSceneLink(match[2], match[3], match[1]);
}

/**
 * Build an @ActivateScene link.
 * @param {string} target - UUID path, scene ID, or scene name
 * @param {string|undefined} label - display label
 * @param {string} via - provider module id, or "" for a plain activation
 * @returns {Node}
 */
async function _buildSceneLink(target, label, via) {
  // Try fromUuid first (handles full UUID paths like "Scene.abc123"),
  // then fall back to collection lookup by ID or name for backwards compat
  let doc = null;
  try { doc = await fromUuid(target); } catch (e) { /* not a valid UUID */ }
  if (!doc) {
    const collection = game.collections.get("Scene");
    doc = /^[a-zA-Z0-9]{16}$/.test(target)
      ? collection.get(target)
      : collection.getName(target);
  }

  if (!doc) {
    return buildLink({
      cssClass: CSS_CLASSES.activateScene,
      icon: "fas fa-unlink",
      label: label || target,
      dataset: { type: "ActivateScene", entity: "Scene", id: "", via },
      broken: true
    });
  }

  // Non-GM visibility check
  if (!doc.canUserModify(game.user, "update")) {
    const visibility = game.settings.get(MODULE_ID, "sceneLinkVisibility");
    if (visibility === 1) return document.createTextNode(label || doc.name);
    if (visibility === 2) return document.createElement("wbr");
  }

  return buildLink({
    cssClass: CSS_CLASSES.activateScene,
    icon: CONFIG.Scene.sidebarIcon,
    label: label || doc.name,
    dataset: { type: "ActivateScene", entity: "Scene", id: doc.id, via }
  });
}
