"use client";

import * as React from "react";
import { cancelIdle, scheduleIdle } from "~/features/dom/utils";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";
import { HERO_DEBUG_DEFAULTS } from "./hero-debug-panel";
import { loadGltf, loadThreeModules } from "./hero-model-cache";

type HeroModelProps = {
  src: string;
  ariaLabel?: string;
  maxRotationDegX?: number;
  maxRotationDegY?: number;
  pivotScale?: number;
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
 * instance hit-tests the pointer against its own hover boundary — the nearest
 * ancestor with `data-hero-model-boundary` (falling back to its own container) —
 * so it only reacts while the cursor is over its own section, not another one
 * rendered on top of or below it.
 */
export function HeroModel({
  src,
  ariaLabel = "3D model viewer",
  maxRotationDegX = 60,
  maxRotationDegY = 90,
  pivotScale = 0.7,
}: HeroModelProps) {
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
    let observer: IntersectionObserver | null = null;
    let initialized = false;
    let inView = false;

    // Assigned by initScene once the WebGL scene exists, so the IntersectionObserver below can
    // start/stop the render loop without tearing the context down.
    let play: (() => void) | undefined;
    let pause: (() => void) | undefined;

    const settings = {
      ...HERO_DEBUG_DEFAULTS,
      maxRotationDegX,
      maxRotationDegY,
      pivotScale,
    };

    // Sequenced preload: warm the (large) `three` chunk and parse the GLB during idle time — no
    // WebGL context is created here. HTML/hydration land first; while the user reads the hero the
    // bytes download and parse, so building the scene on scroll (footer/404) is near-instant. The
    // above-the-fold hero dedupes against these same cached promises.
    const idleId = scheduleIdle(() => {
      loadThreeModules()
        .then(() => loadGltf(src))
        .catch((err) => console.error("[HeroModel] preload error", err));
    });

    // Lazy scene initialization: only build the renderer/scene the first time the container nears
    // the viewport. For the hero this fires immediately; for the footer/404 it defers until scroll.
    const initScene = async () => {
      if (initialized || disposed || !containerRef.current) {
        return;
      }
      initialized = true;

      const { THREE } = await loadThreeModules();
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

      let targetX = 0;
      let targetY = 0;
      let isHovering = false;

      // The hover area defaults to the model's own container, but a caller can opt a wider
      // ancestor in via `data-hero-model-boundary` (e.g. the whole footer, so links/text
      // rendered above the model still count as "hovering it"). Resolved once here rather than
      // per mousemove since it can't change for the life of this effect.
      const hoverBoundary = container.closest<HTMLElement>("[data-hero-model-boundary]") ?? container;

      const onMouseLeave = () => {
        targetX = 0;
        targetY = 0;
        isHovering = false;
      };

      const onMouseMove = (e: MouseEvent) => {
        const rect = hoverBoundary.getBoundingClientRect();
        const isInsideRect =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

        // A geometric rect check isn't enough: sections like the intro block are pulled up with a
        // negative margin and a higher z-index to visually slide over the pinned hero on scroll, so
        // the hero's own boundary still geometrically contains the pointer while it's covered by a
        // different section. Hit-test the actual topmost element so covered pointer positions don't
        // count as hovering, while still allowing elements inside the boundary (e.g. footer links).
        // The site header is exempt: it's a persistent `position: fixed` chrome element rendered as
        // a sibling above every section (not a competing page section), so hovering it should still
        // count as hovering whatever it's sitting on top of.
        const topElement = document.elementFromPoint(e.clientX, e.clientY);
        const isTopmost = isInsideRect && (hoverBoundary.contains(topElement) || !!topElement?.closest("[data-site-header]"));

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

      // Pointer listeners are attached only while the model is on screen — the mousemove handler
      // does a `getBoundingClientRect` + `elementFromPoint` hit-test on every move, which is wasted
      // work for an off-screen mount (and there can be 2–3 mounts on a page).
      const attachPointer = () => {
        window.addEventListener("mousemove", onMouseMove);
        document.documentElement.addEventListener("mouseleave", onMouseLeave);
      };
      const detachPointer = () => {
        window.removeEventListener("mousemove", onMouseMove);
        document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      };

      // Shared parsed GLB — clone per mount so geometry/materials are reused but transforms stay
      // independent.
      loadGltf(src)
        .then((gltf) => {
          if (disposed) {
            return;
          }
          const model = gltf.scene.clone(true);

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
        })
        .catch((err) => console.error("[HeroModel] GLTF load error", err));

      // Cap the render loop to 60fps: rAF fires at the display's native rate, so on 120Hz/ProMotion
      // panels the scene would otherwise render (and lerp) twice as often as needed. Gating on a
      // fixed interval also keeps the pointer-follow feel consistent across refresh rates.
      const frameInterval = 1000 / 60;
      let lastRender = 0;
      const animate = (now: number) => {
        frameId = requestAnimationFrame(animate);
        if (now - lastRender < frameInterval) {
          return;
        }
        lastRender = now;
        const factor = isHovering ? settings.lerpFactor : settings.returnLerpFactor;
        pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, targetX, factor);
        pivot.rotation.y = THREE.MathUtils.lerp(pivot.rotation.y, targetY, factor);
        renderer?.render(scene, camera);
      };

      play = () => {
        if (frameId !== null) {
          return;
        }
        attachPointer();
        lastRender = 0;
        frameId = requestAnimationFrame(animate);
      };

      pause = () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
        detachPointer();
        onMouseLeave();
      };

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
        // Keep the static frame correct if we're resized while the loop is paused (off-screen).
        if (frameId === null) {
          renderer.render(scene, camera);
        }
      });
      resizeObserver.observe(container);

      // The async import/setup above may have straddled a scroll that moved us off-screen — only
      // start the loop if we're still in view; otherwise the observer will start it on re-entry.
      if (inView) {
        play();
      }
    };

    // One observer drives both lazy init and off-viewport pause. Default (viewport) root is correct
    // even though Lenis owns the scroll surface; the small rootMargin readies the scene just before
    // it becomes visible.
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        inView = entry.isIntersecting;
        if (inView) {
          if (initialized) {
            play?.();
          } else {
            initScene();
          }
        } else {
          pause?.();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(container);

    return () => {
      disposed = true;
      cancelIdle(idleId);
      observer?.disconnect();
      resizeObserver?.disconnect();
      // pause() cancels the rAF loop and detaches the pointer listeners (no-op if never started).
      pause?.();
      if (renderer) {
        renderer.domElement.remove();
        renderer.dispose();
      }
    };
  }, [src, maxRotationDegX, maxRotationDegY, pivotScale]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full transition-opacity duration-1300 ease-out"
      style={{ opacity: reduceMotion || loaded ? 1 : 0 }}
      role="img"
      aria-label={ariaLabel}
    />
  );
}
