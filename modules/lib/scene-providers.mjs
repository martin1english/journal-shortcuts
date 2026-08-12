/**
 * Scene activation providers.
 *
 * A provider takes over the activation of a scene so that another module can
 * wrap it — for example, activating behind a Scene Transitions curtain.
 *
 * Contract: (scene) => boolean
 *   true  — the provider has fired and owns the activation; the caller must not
 *           call scene.activate() itself.
 *   false — the provider declined for any reason; the caller activates normally.
 *
 * Declining rather than throwing keeps every failure on the same path as
 * "no provider named", which is the module's behaviour without this feature.
 *
 * Everything specific to a target module — its id, flag paths, socket action
 * names and option field names — stays inside that module's provider function.
 */

const SCENE_TRANSITIONS_ID = "scene-transitions";

/**
 * Fire the transition the GM authored on this scene, at every connected client.
 *
 * Scene Transitions performs the scene activation itself, inside the completion
 * callback of its fade-in, so the curtain is already up when the scene changes.
 * That is the whole point of the handoff: the caller must not also activate.
 *
 * Nothing is synthesised — a scene with no authored transition is declined and
 * activates normally.
 *
 * @param {Scene} scene
 * @returns {boolean} true if the transition was fired and owns the activation
 */
function playSceneTransition(scene) {
  const mod = game.modules.get(SCENE_TRANSITIONS_ID);
  if (!mod?.active) {
    ui.notifications.info("Journal Shortcuts | Scene Transitions is not active; activating the scene directly.");
    return false;
  }

  // mod.socket is the manifest's `"socket": true` boolean until Scene Transitions'
  // init replaces it with the socketlib socket, so test for the method rather
  // than for truthiness. socketlib.registerModule is idempotent and returns their
  // existing socket with their handlers intact, so it is a safe fallback.
  const socket = typeof mod.socket?.executeForEveryone === "function"
    ? mod.socket
    : globalThis.socketlib?.registerModule(SCENE_TRANSITIONS_ID);

  if (typeof socket?.executeForEveryone !== "function") {
    ui.notifications.info("Journal Shortcuts | Scene Transitions socket unavailable; activating the scene directly.");
    return false;
  }

  const stored = scene.getFlag(SCENE_TRANSITIONS_ID, "transition");
  if (!stored?.options) {
    console.log(`Journal Shortcuts | No transition authored on "${scene.name}"; activating normally.`);
    return false;
  }

  // deepClone: Scene Transitions' own context-menu button mutates the live flag
  // object in place when it stamps sceneID onto it.
  const options = {
    ...foundry.utils.deepClone(stored.options),
    sceneID: scene.id,
    activateScene: true,
    fromSocket: true
  };

  game.scenes.preload(scene.id, true);
  socket.executeForEveryone("executeAction", options);

  // With gmHide set, Scene Transitions' render() returns early on the GM's client
  // — before building the element whose fade-in callback performs the activation.
  // Player clients only call scene.view(), which changes their local view without
  // making the scene active. So nothing would activate the scene: do it here.
  // Known imperfection: this fires immediately rather than waiting out the
  // players' fade-in, so the canvas swap may begin before their curtain is fully
  // opaque. The preload above softens it.
  if (options.gmHide === true) scene.activate();

  return true;
}

/**
 * Provider table, keyed by Foundry module id — the id named in the link, as in
 * `@ActivateScene|scene-transitions[Scene]{Label}`.
 *
 * A module id absent from this table is simply not dispatched, and the scene
 * activates normally. Adding an integration means adding an entry here.
 */
export const SCENE_PROVIDERS = {
  [SCENE_TRANSITIONS_ID]: playSceneTransition
};
