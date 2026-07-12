import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

type ThreeModules = {
  THREE: typeof import("three");
  GLTFLoader: typeof import("three/addons/loaders/GLTFLoader.js").GLTFLoader;
};

/**
 * Shared, module-level cache for the hero model's heavy dependencies. `HeroModel` is mounted
 * multiple times per page (hero, footer, 404); without this each mount would re-trigger the `three`
 * dynamic import and re-fetch + re-parse the GLB. Both are memoized once here so the second/third
 * mount reuses the already-downloaded chunk and the already-parsed scene graph.
 *
 * The WebGLRenderer itself can't be shared (each mount needs its own canvas/context), so only the
 * module chunk and parsed GLTF are cached — that's where the redundant cost lives.
 */

let threeModulesPromise: Promise<ThreeModules> | null = null;

export function loadThreeModules(): Promise<ThreeModules> {
  threeModulesPromise ??= Promise.all([import("three"), import("three/addons/loaders/GLTFLoader.js")]).then(
    ([THREE, { GLTFLoader }]) => ({ THREE, GLTFLoader })
  );
  return threeModulesPromise;
}

const gltfCache = new Map<string, Promise<GLTF>>();

/**
 * Fetch + parse a GLB once per `src`. Callers should `.clone()` the returned `gltf.scene` before
 * mutating/adding it to their own scene, so geometry and materials stay shared but transforms and
 * parenting are independent per mount.
 */
export function loadGltf(src: string): Promise<GLTF> {
  let cached = gltfCache.get(src);
  if (!cached) {
    cached = loadThreeModules().then(
      ({ GLTFLoader }) =>
        new Promise<GLTF>((resolve, reject) => {
          new GLTFLoader().load(src, resolve, undefined, reject);
        })
    );
    gltfCache.set(src, cached);
  }
  return cached;
}
