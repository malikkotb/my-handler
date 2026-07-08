"use client";

import * as React from "react";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";
import { IS_DEV } from "~/features/utils/constants";
import { createHeroDebugGui, HERO_DEBUG_DEFAULTS } from "./hero-debug-panel";

type HeroModelProps = {
  src: string;
  ariaLabel?: string;
  maxRotationDegX?: number;
  maxRotationDegY?: number;
};

/**
 * Three.js GLTF viewer for the hero. The model lerps toward the cursor position
 * (rotation only) and recenters when the pointer leaves the viewport. `three` is
 * imported dynamically so it stays out of the server bundle.
 *
 * Pointer tracking is bound to the window rather than the model's own container:
 * the site header renders as a `position: fixed` sibling outside this component's
 * DOM subtree, so an element-scoped listener would stop receiving events (and the
 * model would appear to freeze) whenever the cursor moved over the header. Since
 * this component is mounted multiple times on a page (hero, footer, 404), each
 * instance checks the pointer position against its own container bounds so it
 * only reacts while the cursor is actually over it.
 */
export function HeroModel({ src, ariaLabel = "3D model viewer", maxRotationDegX = 120, maxRotationDegY = 120 }: HeroModelProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let disposed = false;
    let renderer: import("three").WebGLRenderer | null = null;
    let frameId: number | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let detachPointer: (() => void) | undefined;
    let gui: import("lil-gui").default | null = null;

    const settings = {
      ...HERO_DEBUG_DEFAULTS,
      maxRotationDegX,
      maxRotationDegY,
    };

    Promise.all([import("three"), import("three/addons/loaders/GLTFLoader.js")]).then(([THREE, { GLTFLoader }]) => {
      if (disposed || !containerRef.current) {
        return;
      }

      const width = container.clientWidth;
      const height = container.clientHeight;

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(45, Math.max(width, 1) / Math.max(height, 1), 0.01, 1000);
      camera.position.set(0, 0, 5);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(Math.max(width, 1), Math.max(height, 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = settings.exposure;
      container.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(settings.ambient.color, settings.ambient.intensity);
      scene.add(ambient);

      const dir = new THREE.DirectionalLight(settings.key.color, settings.key.intensity);
      dir.position.set(3, 5, 4);
      scene.add(dir);

      const fill = new THREE.DirectionalLight(settings.fill.color, settings.fill.intensity);
      fill.position.set(-3, 2, -2);
      scene.add(fill);

      // Pivot so hover rotation is always around the model's center.
      const pivot = new THREE.Group();
      pivot.scale.setScalar(settings.pivotScale);
      scene.add(pivot);

      if (IS_DEV) {
        import("lil-gui").then(({ default: GUI }) => {
          if (disposed) {
            return;
          }
          gui = createHeroDebugGui(GUI, settings, () => {
            ambient.intensity = settings.ambient.intensity;
            ambient.color.set(settings.ambient.color);
            dir.intensity = settings.key.intensity;
            dir.color.set(settings.key.color);
            fill.intensity = settings.fill.intensity;
            fill.color.set(settings.fill.color);
            if (renderer) {
              renderer.toneMappingExposure = settings.exposure;
            }
            pivot.scale.setScalar(settings.pivotScale);
          });
        });
      }

      let targetX = 0;
      let targetY = 0;
      let isHovering = false;

      const onMouseLeave = () => {
        targetX = 0;
        targetY = 0;
        isHovering = false;
      };

      const onMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const isInsideRect =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

        // A geometric rect check isn't enough: sections like the intro block are pulled up with a
        // negative margin and a higher z-index to visually slide over the pinned hero on scroll, so
        // the hero's own container still geometrically contains the pointer while it's covered.
        // Hit-test the actual topmost element so covered pointer positions don't count as hovering.
        const isTopmost = isInsideRect && container.contains(document.elementFromPoint(e.clientX, e.clientY));

        if (!isTopmost) {
          if (isHovering) {
            onMouseLeave();
          }
          return;
        }

        const nx = THREE.MathUtils.clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
        const ny = THREE.MathUtils.clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
        const maxRadX = THREE.MathUtils.degToRad(settings.maxRotationDegX);
        const maxRadY = THREE.MathUtils.degToRad(settings.maxRotationDegY);
        targetY = nx * maxRadY;
        targetX = -ny * maxRadX;
        isHovering = true;
      };

      window.addEventListener("mousemove", onMouseMove);
      document.documentElement.addEventListener("mouseleave", onMouseLeave);
      detachPointer = () => {
        window.removeEventListener("mousemove", onMouseMove);
        document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      };

      const loader = new GLTFLoader();
      loader.load(
        src,
        (gltf) => {
          if (disposed) {
            return;
          }
          const model = gltf.scene;

          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3()).length();
          const center = box.getCenter(new THREE.Vector3());

          model.position.sub(center);

          camera.near = Math.max(size / 100, 0.01);
          camera.far = size * 100;
          camera.position.set(0, 0, size * 1.6);
          camera.lookAt(0, -size * 0.125, 0);
          camera.updateProjectionMatrix();

          pivot.add(model);
          setLoaded(true);
        },
        undefined,
        (err) => console.error("[HeroModel] GLTF load error", err)
      );

      const animate = () => {
        frameId = requestAnimationFrame(animate);
        const factor = isHovering ? settings.lerpFactor : settings.returnLerpFactor;
        pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, targetX, factor);
        pivot.rotation.y = THREE.MathUtils.lerp(pivot.rotation.y, targetY, factor);
        renderer?.render(scene, camera);
      };
      animate();

      resizeObserver = new ResizeObserver(() => {
        if (!renderer) {
          return;
        }
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) {
          return;
        }
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      resizeObserver.observe(container);
    });

    return () => {
      disposed = true;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      resizeObserver?.disconnect();
      detachPointer?.();
      if (renderer) {
        renderer.domElement.remove();
        renderer.dispose();
      }
      gui?.destroy();
    };
  }, [src, maxRotationDegX, maxRotationDegY]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full transition-opacity duration-[1300ms] ease-out"
      style={{ opacity: reduceMotion || loaded ? 1 : 0 }}
      role="img"
      aria-label={ariaLabel}
    />
  );
}
