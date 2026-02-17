import { CSS_CLASSES } from "../lib/constants.mjs";
import { parsePermission } from "../lib/utils.mjs";

/**
 * Register click handler for @ActivateItem links.
 */
export function registerItemHandler() {
  document.body.addEventListener("click", (event) => {
    const anchor = event.target.closest(`a.${CSS_CLASSES.activateItem}`);
    if (!anchor) return;
    event.preventDefault();
    _onClickActivateItem(anchor);
  });
}

/**
 * Handle click events on @ActivateItem links.
 * GM only: shows an item sheet to all players and updates item ownership.
 * @param {HTMLAnchorElement} anchor
 */
async function _onClickActivateItem(anchor) {
  if (!game.user.isGM) {
    ui.notifications.info("Journal Shortcuts | Only the GM can use @ActivateItem links.");
    return;
  }

  const uuid = anchor.dataset.uuid;
  const permStr = anchor.dataset.permission;

  // Resolve the Item document
  let item;
  try {
    item = await fromUuid(uuid);
  } catch (e) {
    ui.notifications.error(`Journal Shortcuts | Could not resolve document: ${uuid}`);
    console.error("Journal Shortcuts |", e);
    return;
  }

  if (!item) {
    ui.notifications.warn("Journal Shortcuts | This link appears to be broken. Does the item still exist?");
    return;
  }

  if (item.documentName !== "Item") {
    ui.notifications.warn("Journal Shortcuts | @ActivateItem links must point to an Item document.");
    return;
  }

  // Update item ownership first if a permission flag was specified
  // This must happen before showing to ensure players can see it
  if (permStr) {
    const ownershipLevel = parsePermission(permStr);
    try {
      await item.update({
        ownership: { default: ownershipLevel }
      });
      console.log(`Journal Shortcuts | Updated ownership on "${item.name}" to default:${ownershipLevel}`);
    } catch (e) {
      ui.notifications.error(`Journal Shortcuts | Failed to update item ownership: ${e.message}`);
      console.error("Journal Shortcuts |", e);
      return;
    }
  }

  // Show the item sheet to all connected players using Foundry's built-in sharing
  item.sheet.render(true, { force: true });

  // Share with all players by emitting to their clients
  console.log("Journal Shortcuts | Emitting showItem socket event", item.uuid);
  game.socket.emit("module.journal-shortcuts", {
    action: "showItem",
    uuid: item.uuid
  });

  ui.notifications.info(`Journal Shortcuts | Shared "${item.name}" with all players.`);
}
