import { CSS_CLASSES } from "../lib/constants.mjs";
import { parsePermission } from "../lib/utils.mjs";

/**
 * Register click handler for @ActivatePage links.
 */
export function registerPageHandler() {
  document.body.addEventListener("click", (event) => {
    const anchor = event.target.closest(`a.${CSS_CLASSES.activatePage}`);
    if (!anchor) return;
    event.preventDefault();
    _onClickActivatePage(anchor);
  });
}

/**
 * Handle click events on @ActivatePage links.
 * GM only: shows a journal page to all players and updates page ownership.
 * @param {HTMLAnchorElement} anchor
 */
async function _onClickActivatePage(anchor) {
  if (!game.user.isGM) {
    ui.notifications.info("Journal Shortcuts | Only the GM can use @ActivatePage links.");
    return;
  }

  const uuid = anchor.dataset.uuid;
  const permStr = anchor.dataset.permission;

  // Resolve the JournalEntryPage document
  let page;
  try {
    page = await fromUuid(uuid);
  } catch (e) {
    ui.notifications.error(`Journal Shortcuts | Could not resolve document: ${uuid}`);
    console.error("Journal Shortcuts |", e);
    return;
  }

  if (!page) {
    ui.notifications.warn("Journal Shortcuts | This link appears to be broken. Does the journal page still exist?");
    return;
  }

  if (page.documentName !== "JournalEntryPage") {
    ui.notifications.warn("Journal Shortcuts | @ActivatePage links must point to a JournalEntryPage document.");
    return;
  }

  // Show the page to all connected players
  Journal.show(page, { force: true });

  // Update page ownership if a permission flag was specified
  if (permStr) {
    const ownershipLevel = parsePermission(permStr);
    try {
      await page.update({
        ownership: { default: ownershipLevel }
      });
      console.log(`Journal Shortcuts | Updated ownership on "${page.name}" to default:${ownershipLevel}`);
    } catch (e) {
      ui.notifications.error(`Journal Shortcuts | Failed to update page ownership: ${e.message}`);
      console.error("Journal Shortcuts |", e);
    }
  }
}
