"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  variant?: "ambient" | "core";
  density?: number;
}

export default function ThreeField({ variant = "ambient", density = 1 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth || 800;
    let H = mount.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 1000);
    camera.position.z = 62;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    const COUNT = Math.floor(380 * density);
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 150;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 95;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 85;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color("#FF7A3C"),
      size: 0.85,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    let core: THREE.Mesh | null = null;
    let core2: THREE.Mesh | null = null;
    if (variant === "core") {
      const cg = new THREE.IcosahedronGeometry(15, 1);
      const cm = new THREE.MeshBasicMaterial({ color: new THREE.Color("#4FE0B0"), wireframe: true, transparent: true, opacity: 0.32 });
      core = new THREE.Mesh(cg, cm);
      scene.add(core);

      const cg2 = new THREE.IcosahedronGeometry(9, 0);
      const cm2 = new THREE.MeshBasicMaterial({ color: new THREE.Color("#FF7A3C"), wireframe: true, transparent: true, opacity: 0.5 });
      core2 = new THREE.Mesh(cg2, cm2);
      scene.add(core2);
    }

    let raf = 0;
    const animate = () => {
      points.rotation.y += 0.0009;
      points.rotation.x += 0.00025;
      if (core) { core.rotation.y += 0.0028; core.rotation.x += 0.0016; }
      if (core2) { core2.rotation.y -= 0.004; core2.rotation.x -= 0.0022; }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      W = mount.clientWidth || W;
      H = mount.clientHeight || H;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      if (core) { core.geometry.dispose(); (core.material as THREE.Material).dispose(); }
      if (core2) { core2.geometry.dispose(); (core2.material as THREE.Material).dispose(); }
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [variant, density]);

  return <div ref={mountRef} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
