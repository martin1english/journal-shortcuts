import { CSS_CLASSES, PERMISSION_MAP, DEFAULT_PERMISSION } from "./constants.mjs";

/**
 * Build a styled <a> element for an enricher link.
 * @param {object} options
 * @param {string} options.cssClass - Primary CSS class
 * @param {string} options.icon - Font Awesome icon class string
 * @param {string} options.label - Visible link text
 * @param {object} options.dataset - Key/value pairs for data-* attributes
 * @param {boolean} [options.broken=false] - Whether the link is broken
 * @returns {HTMLAnchorElement}
 */
export function buildLink({ cssClass, icon, label, dataset, broken = false }) {
  const a = document.createElement("a");
  a.classList.add(cssClass);
  if (broken) a.classList.add(CSS_CLASSES.broken);
  a.draggable = false;
  for (const [k, v] of Object.entries(dataset)) {
    a.dataset[k] = v;
  }
  a.innerHTML = `<i class="${icon}"></i> ${label}`;
  return a;
}

/**
 * Parse a permission string from the enricher syntax.
 * @param {string|undefined} permStr - e.g., "observer", "limited", "owner", "none"
 * @returns {number} The integer ownership level
 */
export function parsePermission(permStr) {
  const key = (permStr || DEFAULT_PERMISSION).toLowerCase().trim();
  if (key in PERMISSION_MAP) return PERMISSION_MAP[key];
  console.warn(`Journal Shortcuts | Unknown permission "${permStr}", defaulting to ${DEFAULT_PERMISSION}.`);
  return PERMISSION_MAP[DEFAULT_PERMISSION];
}
