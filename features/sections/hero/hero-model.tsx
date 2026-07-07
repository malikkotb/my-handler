"use client";

import * as React from "react";
import { usePrefersReducedMotion } from "~/features/motion/use-prefers-reduced-motion";

type HeroModelProps = {
  src: string;
  ariaLabel?: string;
  maxRotationDegX?: number;
  maxRotationDegY?: number;
};

/**
 * Three.js GLTF viewer for the hero. The model lerps toward the cursor position
 * (rotation only) and recenters on leave. `three` is imported dynamically so it
 * stays out of the server bundle.
 */
export function HeroModel({
  src,
  ariaLabel = "3D model viewer",
  maxRotationDegX = 45,
  maxRotationDegY = 90,
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
    let detachPointer: (() => void) | undefined;

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
      renderer.toneMappingExposure = 1;
      container.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffffff, 1.5);
      dir.position.set(3, 5, 4);
      scene.add(dir);
      const fill = new THREE.DirectionalLight(0xffffff, 0.6);
      fill.position.set(-3, 2, -2);
      scene.add(fill);

      // Pivot so hover rotation is always around the model's center.
      const pivot = new THREE.Group();
      pivot.scale.setScalar(0.7);
      scene.add(pivot);

      let targetX = 0;
      let targetY = 0;
      const maxRadX = THREE.MathUtils.degToRad(maxRotationDegX);
      const maxRadY = THREE.MathUtils.degToRad(maxRotationDegY);

      const onMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        targetY = nx * maxRadY;
        targetX = -ny * maxRadX;
      };

      const onMouseLeave = () => {
        targetX = 0;
        targetY = 0;
      };

      container.addEventListener("mousemove", onMouseMove);
      container.addEventListener("mouseleave", onMouseLeave);
      detachPointer = () => {
        container.removeEventListener("mousemove", onMouseMove);
        container.removeEventListener("mouseleave", onMouseLeave);
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
        pivot.rotation.x = THREE.MathUtils.lerp(pivot.rotation.x, targetX, 0.06);
        pivot.rotation.y = THREE.MathUtils.lerp(pivot.rotation.y, targetY, 0.06);
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
