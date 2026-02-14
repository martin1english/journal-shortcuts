import { CSS_CLASSES } from "../lib/constants.mjs";
import { buildLink } from "../lib/utils.mjs";

/**
 * Enricher for @ViewScene[sceneId]{Label}
 * match[1] = "ViewScene"
 * match[2] = scene ID or name
 * match[3] = display label (optional)
 */
export async function enrichViewScene(match, options) {
  const target = match[2];
  const label = match[3];

  const collection = game.collections.get("Scene");
  const doc = /^[a-zA-Z0-9]{16}$/.test(target)
    ? collection.get(target)
    : collection.getName(target);

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
