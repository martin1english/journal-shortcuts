import { CSS_CLASSES } from "../lib/constants.mjs";
import { buildLink } from "../lib/utils.mjs";

/**
 * Enricher for @ActivateItem[uuid]{Label} or @ActivateItem|permission[uuid]{Label}
 * match[1] = permission string (optional, e.g., "observer")
 * match[2] = UUID path (e.g., "Item.abc123")
 * match[3] = display label
 */
export async function enrichActivateItem(match, options) {
  const permStr = match[1];
  const uuidPath = match[2];
  const label = match[3];

  // Resolve the document asynchronously
  let doc = null;
  try {
    doc = await fromUuid(uuidPath);
  } catch (e) {
    // Document not found or invalid UUID
  }

  if (!doc) {
    return buildLink({
      cssClass: CSS_CLASSES.activateItem,
      icon: "fas fa-unlink",
      label: label || uuidPath,
      dataset: { uuid: uuidPath, permission: permStr || "" },
      broken: true
    });
  }

  return buildLink({
    cssClass: CSS_CLASSES.activateItem,
    icon: "fas fa-suitcase",
    label: label || doc.name,
    dataset: { uuid: uuidPath, permission: permStr || "" }
  });
}
