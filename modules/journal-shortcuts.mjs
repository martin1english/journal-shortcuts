import { MODULE_ID } from "./lib/constants.mjs";
import { enrichActivateScene, enrichActivateSceneVia } from "./enrichers/activate-scene.mjs";
import { enrichViewScene } from "./enrichers/view-scene.mjs";
import { enrichActivateImage } from "./enrichers/activate-image.mjs";
import { enrichActivatePage } from "./enrichers/activate-page.mjs";
import { enrichActivateItem } from "./enrichers/activate-item.mjs";
import { enrichPlayPlaylist } from "./enrichers/play-playlist.mjs";
import { registerSceneHandlers } from "./handlers/scene-handlers.mjs";
import { registerImageHandler } from "./handlers/image-handler.mjs";
import { registerPageHandler } from "./handlers/page-handler.mjs";
import { registerItemHandler } from "./handlers/item-handler.mjs";
import { registerPlaylistHandler } from "./handlers/playlist-handler.mjs";

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
    hint: "Type these prefixes in any journal entry: @ActivateScene[SceneName]{Label} — GM activates a scene. @ViewScene[SceneName]{Label} — view a scene without activating. @ActivateImage[UUID]{Label} — share an image with players. @ActivatePage[UUID]{Label} — share a journal page with players. @ActivateItem[UUID]{Label} — share an item with players. @PlayPlaylist[Playlist]{Label} — GM (re)starts a playlist for all players; omit [Playlist] to use the active scene's playlist. Add |permission before the [ to set access level, e.g. @ActivateImage|observer[UUID]{Label}. @ActivateScene|scene-transitions[SceneName]{Label} — activates the scene behind a Scene Transitions curtain, using the transition set up on that scene; falls back to a normal activation if the scene has no transition or the module is inactive.",
    scope: "world",
    config: true,
    requiresReload: false,
    type: Boolean,
    default: false
  });

  // --- Text Enrichers (registered via concat to match Foundry expectations) ---

  CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.concat([
    {
      // @ActivateScene[sceneId]{Label}
      pattern: new RegExp(`@(ActivateScene)\\[([^\\]]+)\\](?:{([^}]+)})?`, "g"),
      enricher: enrichActivateScene
    },
    {
      // @ActivateScene|<module-id>[sceneId]{Label} — hand the activation to
      // another module. Mutually exclusive with the pattern above: that one
      // requires "[" immediately after the name, this one requires "|".
      pattern: new RegExp(`@ActivateScene\\|([a-zA-Z0-9_-]+)\\[([^\\]]+)\\](?:\\{([^}]+)\\})?`, "g"),
      enricher: enrichActivateSceneVia
    },
    {
      // @ViewScene[sceneId]{Label}
      pattern: new RegExp(`@(ViewScene)\\[([^\\]]+)\\](?:{([^}]+)})?`, "g"),
      enricher: enrichViewScene
    },
    {
      // @ActivateImage[uuid]{Label} or @ActivateImage|permission[uuid]{Label}
      pattern: new RegExp(`@ActivateImage(?:\\|([a-zA-Z]+))?\\[([^\\]]+)\\]\\{([^}]+)\\}`, "g"),
      enricher: enrichActivateImage
    },
    {
      // @ActivatePage[uuid]{Label} or @ActivatePage|permission[uuid]{Label}
      pattern: new RegExp(`@ActivatePage(?:\\|([a-zA-Z]+))?\\[([^\\]]+)\\]\\{([^}]+)\\}`, "g"),
      enricher: enrichActivatePage
    },
    {
      // @ActivateItem[uuid]{Label} or @ActivateItem|permission[uuid]{Label}
      pattern: new RegExp(`@ActivateItem(?:\\|([a-zA-Z]+))?\\[([^\\]]+)\\]\\{([^}]+)\\}`, "g"),
      enricher: enrichActivateItem
    },
    {
      // @PlayPlaylist[Playlist]{Label}  — target optional (omit -> active scene's playlist)
      pattern: new RegExp(`@(PlayPlaylist)(?:\\[([^\\]]+)\\])?(?:\\{([^}]+)\\})?`, "g"),
      enricher: enrichPlayPlaylist
    }
  ]);

  // --- Click Handlers ---

  registerSceneHandlers();
  registerImageHandler();
  registerPageHandler();
  registerItemHandler();
  registerPlaylistHandler();
});

Hooks.once("ready", () => {
  // --- Socket Listener for Item Sharing ---

  game.socket.on("module.journal-shortcuts", async (data) => {
    if (data.action === "showItem") {
      console.log("Journal Shortcuts | Received showItem socket event", data);
      const item = await fromUuid(data.uuid);
      if (item && item.testUserPermission(game.user, "OBSERVER")) {
        console.log(`Journal Shortcuts | Opening item sheet for ${item.name}`);
        item.sheet.render(true, { force: true });
      } else {
        console.log("Journal Shortcuts | Item not found or no permission", item);
      }
    }
  });
});
