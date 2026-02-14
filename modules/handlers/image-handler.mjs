import { CSS_CLASSES } from "../lib/constants.mjs";
import { parsePermission } from "../lib/utils.mjs";

/**
 * Register click handler for @ActivateImage links.
 */
export function registerImageHandler() {
  document.body.addEventListener("click", (event) => {
    const anchor = event.target.closest(`a.${CSS_CLASSES.activateImage}`);
    if (!anchor) return;
    event.preventDefault();
    _onClickActivateImage(anchor);
  });
}

/**
 * Handle click events on @ActivateImage links.
 * GM only: shows an image via ImagePopout and updates page ownership.
 * @param {HTMLAnchorElement} anchor
 */
async function _onClickActivateImage(anchor) {
  if (!game.user.isGM) {
    ui.notifications.info("Journal Shortcuts | Only the GM can use @ActivateImage links.");
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
    ui.notifications.warn("Journal Shortcuts | @ActivateImage links must point to a JournalEntryPage document.");
    return;
  }

  // Only works on image pages
  if (page.type !== "image") {
    ui.notifications.warn("Journal Shortcuts | This page is not an image page. Use @ActivatePage for non-image pages.");
    return;
  }

  // Show the image via ImagePopout and share with all players
  const ImagePopoutClass = foundry.applications?.apps?.ImagePopout ?? globalThis.ImagePopout;
  if (!ImagePopoutClass) {
    ui.notifications.error("Journal Shortcuts | ImagePopout is not available in this Foundry version.");
    return;
  }

  const popout = new ImagePopoutClass({
    src: page.src,
    uuid: page.uuid,
    window: { title: page.name }
  });
  await popout.render(true);
  popout.shareImage();

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
