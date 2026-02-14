import { MODULE_ID } from "./lib/constants.mjs";
import { enrichActivateScene } from "./enrichers/activate-scene.mjs";
import { enrichViewScene } from "./enrichers/view-scene.mjs";
import { enrichActivateImage } from "./enrichers/activate-image.mjs";
import { enrichActivatePage } from "./enrichers/activate-page.mjs";
import { registerSceneHandlers } from "./handlers/scene-handlers.mjs";
import { registerImageHandler } from "./handlers/image-handler.mjs";
import { registerPageHandler } from "./handlers/page-handler.mjs";

Hooks.once("init", () => {
  console.log("Journal Shortcuts | Initializing module");

  // --- Module Settings ---

  game.settings.register(MODULE_ID, "sceneLinkVisibility", {
    name: "Scene Link Visibility for Players",
    hint: "Controls what non-GM users see for @ActivateScene links. Link: clickable link shown. Text Only: label shown as plain text. None: completely hidden.",
    scope: "world",
    config: true,
    requiresReload: false,
    type: Number,
    choices: {
      0: "Link",
      1: "Text Only",
      2: "None"
    },
    default: 0
  });

  game.settings.register(MODULE_ID, "playersViewScenes", {
    name: "Players Can View Scenes",
    hint: "WARNING: May allow players to view scenes not in navigation. When enabled, non-GM clicks on @ActivateScene links will view the scene instead of doing nothing.",
    scope: "world",
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false
  });

  game.settings.register(MODULE_ID, "usageHelp", {
    name: "How to Use Journal Shortcuts",
    hint: "Type these prefixes in any journal entry: @ActivateScene[SceneName]{Label} — GM activates a scene. @ViewScene[SceneName]{Label} — view a scene without activating. @ActivateImage[UUID]{Label} — share an image with players. @ActivatePage[UUID]{Label} — share a journal page with players. Add |permission before the [ to set access level, e.g. @ActivateImage|observer[UUID]{Label}.",
    scope: "world",
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false
  });

  // --- Text Enrichers ---

  // @ActivateScene[sceneId]{Label}
  CONFIG.TextEditor.enrichers.push({
    pattern: new RegExp(`@(ActivateScene)\\[([^\\]]+)\\](?:\\{([^}]+)\\})?`, "g"),
    enricher: enrichActivateScene
  });

  // @ViewScene[sceneId]{Label}
  CONFIG.TextEditor.enrichers.push({
    pattern: new RegExp(`@(ViewScene)\\[([^\\]]+)\\](?:\\{([^}]+)\\})?`, "g"),
    enricher: enrichViewScene
  });

  // @ActivateImage[uuid]{Label} or @ActivateImage|permission[uuid]{Label}
  CONFIG.TextEditor.enrichers.push({
    pattern: new RegExp(`@ActivateImage(?:\\|([a-zA-Z]+))?\\[([^\\]]+)\\]\\{([^}]+)\\}`, "g"),
    enricher: enrichActivateImage
  });

  // @ActivatePage[uuid]{Label} or @ActivatePage|permission[uuid]{Label}
  CONFIG.TextEditor.enrichers.push({
    pattern: new RegExp(`@ActivatePage(?:\\|([a-zA-Z]+))?\\[([^\\]]+)\\]\\{([^}]+)\\}`, "g"),
    enricher: enrichActivatePage
  });

  // --- Click Handlers ---

  registerSceneHandlers();
  registerImageHandler();
  registerPageHandler();
});
