import { MODULE_ID, CSS_CLASSES } from "../lib/constants.mjs";

/**
 * Register click handlers for @ActivateScene and @ViewScene links.
 * Uses vanilla JS event delegation on document.body.
 */
export function registerSceneHandlers() {
  document.body.addEventListener("click", (event) => {
    const activateAnchor = event.target.closest(`a.${CSS_CLASSES.activateScene}`);
    if (activateAnchor) {
      event.preventDefault();
      _onClickActivateScene(event, activateAnchor);
      return;
    }

    const viewAnchor = event.target.closest(`a.${CSS_CLASSES.viewScene}`);
    if (viewAnchor) {
      event.preventDefault();
      _onClickViewScene(event, viewAnchor);
      return;
    }
  });
}

/**
 * Handle click events on @ActivateScene links.
 * @param {MouseEvent} event
 * @param {HTMLAnchorElement} anchor
 */
async function _onClickActivateScene(event, anchor) {
  const sceneId = anchor.dataset.id;
  const scene = game.scenes.get(sceneId);

  if (!scene) {
    ui.notifications.warn("Journal Shortcuts | This scene link appears to be broken. Does the scene still exist?");
    return;
  }

  const canMod = scene.canUserModify(game.user, "update");
  const canView = game.settings.get(MODULE_ID, "playersViewScenes");

  if ((!canMod && canView) || (canMod && event.ctrlKey)) {
    scene.view();
  } else if (canMod) {
    scene.activate();
  } else {
    // Non-GM, playersViewScenes is false: do nothing
    return;
  }

  // Open scene journal notes if available
  if (scene.journal) {
    if (!scene.journal.testUserPermission(game.user, "LIMITED")) {
      ui.notifications.warn(`Journal Shortcuts | You do not have permission to view: ${scene.journal.name}`);
      return;
    }
    scene.journal.sheet.render(true);
  }
}

/**
 * Handle click events on @ViewScene links.
 * @param {MouseEvent} event
 * @param {HTMLAnchorElement} anchor
 */
async function _onClickViewScene(event, anchor) {
  const sceneId = anchor.dataset.id;
  const scene = game.scenes.get(sceneId);

  if (!scene) {
    ui.notifications.warn("Journal Shortcuts | This scene link appears to be broken. Does the scene still exist?");
    return;
  }

  scene.view();

  if (scene.journal) {
    if (!scene.journal.testUserPermission(game.user, "LIMITED")) {
      ui.notifications.warn(`Journal Shortcuts | You do not have permission to view: ${scene.journal.name}`);
      return;
    }
    scene.journal.sheet.render(true);
  }
}
