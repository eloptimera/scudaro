"use client";

import { useEffect, useRef } from "react";

/**
 * The circuit as a raised line you can spin with your finger or mouse (three.js).
 * three.js is imported inside the effect, so it is only downloaded when this component mounts
 * (i.e. when the race panel is opened) and never slows down the first page load.
 */
export default function Track3D({ points, label }: { points: [number, number][]; label: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: () => void = () => {};

    (async () => {
      const el = host.current;
      if (!el || points.length < 8) return;
      const THREE = await import("three");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // no WebGL: show nothing rather than something broken
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      el.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.touchAction = "pan-y"; // vertical swipes still scroll the page

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 1, 500);
      camera.position.set(0, 95, 105);
      camera.lookAt(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 1.1));
      const sun = new THREE.DirectionalLight(0xffffff, 2.2);
      sun.position.set(40, 90, 30);
      scene.add(sun);

      const group = new THREE.Group();
      scene.add(group);

      const curve = new THREE.CatmullRomCurve3(
        points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
        true,
        "centripetal",
      );
      const segments = Math.max(300, points.length * 4);

      // Raised line: bright ribbon on top, red base on the ground, so it reads as a track on a platform.
      const topGeo = new THREE.TubeGeometry(curve, segments, 0.75, 8, true);
      const topMat = new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.4, metalness: 0.1 });
      const top = new THREE.Mesh(topGeo, topMat);
      top.position.y = 3;
      group.add(top);

      const baseGeo = new THREE.TubeGeometry(curve, segments, 1.5, 6, true);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xc4161c, roughness: 0.7 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.scale.y = 0.35;
      group.add(base);

      // Start/finish marker
      const start = curve.getPoint(0);
      const markGeo = new THREE.SphereGeometry(2, 16, 12);
      const markMat = new THREE.MeshStandardMaterial({ color: 0xc4161c, emissive: 0x440508 });
      const mark = new THREE.Mesh(markGeo, markMat);
      mark.position.set(start.x, 3, start.z);
      group.add(mark);

      group.rotation.y = -0.6;

      const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let dragging = false;
      let lastX = 0;
      let velocity = 0;
      let visible = true;
      let raf = 0;

      const onDown = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        velocity = 0;
        renderer.domElement.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        velocity = dx * 0.01;
        group.rotation.y += velocity;
      };
      const onUp = () => {
        dragging = false;
      };
      renderer.domElement.addEventListener("pointerdown", onDown);
      renderer.domElement.addEventListener("pointermove", onMove);
      renderer.domElement.addEventListener("pointerup", onUp);
      renderer.domElement.addEventListener("pointercancel", onUp);

      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(el);

      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) return; // don't burn battery off-screen
        if (!dragging) {
          velocity *= 0.95;
          group.rotation.y += reduceMotion ? 0 : 0.004 + velocity;
        }
        renderer.render(scene, camera);
      };
      frame();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        renderer.domElement.removeEventListener("pointerdown", onDown);
        renderer.domElement.removeEventListener("pointermove", onMove);
        renderer.domElement.removeEventListener("pointerup", onUp);
        renderer.domElement.removeEventListener("pointercancel", onUp);
        [topGeo, baseGeo, markGeo].forEach((g) => g.dispose());
        [topMat, baseMat, markMat].forEach((m) => m.dispose());
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [points]);

  return <div ref={host} className="track3d" role="img" aria-label={`3D model of ${label}. Drag to rotate.`} />;
}
