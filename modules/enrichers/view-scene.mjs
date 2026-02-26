import { CSS_CLASSES } from "../lib/constants.mjs";
import { buildLink } from "../lib/utils.mjs";

/**
 * Enricher for @ViewScene[sceneId]{Label}
 * match[1] = "ViewScene"
 * match[2] = UUID path, scene ID, or scene name
 * match[3] = display label (optional)
 */
export async function enrichViewScene(match, options) {
  const target = match[2];
  const label = match[3];

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
      cssClass: CSS_CLASSES.viewScene,
      icon: "fas fa-unlink",
      label: label || target,
      dataset: { type: "ViewScene", entity: "Scene", id: "" },
      broken: true
    });
  }

  return buildLink({
    cssClass: CSS_CLASSES.viewScene,
    icon: CONFIG.Scene.sidebarIcon,
    label: label || doc.name,
    dataset: { type: "ViewScene", entity: "Scene", id: doc.id }
  });
}
