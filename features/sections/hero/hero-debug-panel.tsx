import type GUI from "lil-gui";

export type HeroDebugSettings = {
  ambient: { intensity: number; color: string };
  key: { intensity: number; color: string };
  fill: { intensity: number; color: string };
  exposure: number;
  pivotScale: number;
  maxRotationDegX: number;
  maxRotationDegY: number;
  lerpFactor: number;
  returnLerpFactor: number;
};

export const HERO_DEBUG_DEFAULTS: HeroDebugSettings = {
  ambient: { intensity: 3, color: "#fffdf8" },
  key: { intensity: 5, color: "#fffdf8" },
  fill: { intensity: 5, color: "#fffdf8" },
  exposure: 3,
  pivotScale: 0.7,
  maxRotationDegX: 90,
  maxRotationDegY: 90,
  lerpFactor: 0.06,
  returnLerpFactor: 0.015,
};

/**
 * Dev-only lil-gui panel for live-tweaking the hero model's lights, exposure and
 * pointer-follow feel. `settings` is mutated in place by the GUI; `syncToScene` pushes
 * the light/renderer/pivot values onto the live Three.js objects after each change.
 */
export function createHeroDebugGui(GUICtor: typeof GUI, settings: HeroDebugSettings, syncToScene: () => void): GUI {
  const gui = new GUICtor({ title: "Hero model debug" });
  Object.assign(gui.domElement.style, {
    position: "fixed",
    top: "auto",
    left: "auto",
    right: "1rem",
    bottom: "1rem",
    zIndex: "50",
    width: "250px",
  });

  const ambientFolder = gui.addFolder("Ambient");
  ambientFolder.add(settings.ambient, "intensity", 0, 3, 0.01).onChange(syncToScene);
  ambientFolder.addColor(settings.ambient, "color").onChange(syncToScene);

  const keyFolder = gui.addFolder("Key light");
  keyFolder.add(settings.key, "intensity", 0, 5, 0.01).onChange(syncToScene);
  keyFolder.addColor(settings.key, "color").onChange(syncToScene);

  const fillFolder = gui.addFolder("Fill light");
  fillFolder.add(settings.fill, "intensity", 0, 5, 0.01).onChange(syncToScene);
  fillFolder.addColor(settings.fill, "color").onChange(syncToScene);

  const renderingFolder = gui.addFolder("Rendering");
  renderingFolder.add(settings, "exposure", 0, 3, 0.01).onChange(syncToScene);
  renderingFolder.add(settings, "pivotScale", 0.1, 2, 0.01).onChange(syncToScene);

  const pointerFolder = gui.addFolder("Pointer follow");
  pointerFolder.add(settings, "maxRotationDegX", 0, 180, 1);
  pointerFolder.add(settings, "maxRotationDegY", 0, 180, 1);
  pointerFolder.add(settings, "lerpFactor", 0.01, 1, 0.01);
  pointerFolder.add(settings, "returnLerpFactor", 0.01, 1, 0.01);

  gui
    .add(
      {
        reset: () => {
          Object.assign(settings, JSON.parse(JSON.stringify(HERO_DEBUG_DEFAULTS)));
          for (const controller of gui.controllersRecursive()) {
            controller.updateDisplay();
          }
          syncToScene();
        },
      },
      "reset"
    )
    .name("Reset to defaults");

  return gui;
}
