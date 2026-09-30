"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

/**
 * Flacon de sérum procédural : verre (transmission), liquide nude, pipette
 * à poire en caoutchouc, étiquette peinte en 2D. Il tourne avec le scroll
 * (`progress` 0–1) et suit légèrement la souris.
 */

const NUDE = "#E9D2C4";
const nudeColor = new THREE.Color(NUDE);

function bodyProfile() {
  // demi-profil du flacon (x = rayon, y = hauteur)
  const pts: THREE.Vector2[] = [];
  const R = 0.62;
  pts.push(new THREE.Vector2(0, -1.1));
  pts.push(new THREE.Vector2(R * 0.92, -1.1));
  pts.push(new THREE.Vector2(R, -1.02));
  pts.push(new THREE.Vector2(R, 0.55));
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const a = (t * Math.PI) / 2;
    pts.push(new THREE.Vector2(0.22 + (R - 0.22) * Math.cos(a), 0.55 + 0.34 * Math.sin(a)));
  }
  pts.push(new THREE.Vector2(0.2, 0.98));
  pts.push(new THREE.Vector2(0.2, 1.08));
  pts.push(new THREE.Vector2(0, 1.08));
  return pts;
}

function liquidProfile(level: number) {
  const R = 0.56;
  return [
    new THREE.Vector2(0, -1.02),
    new THREE.Vector2(R * 0.92, -1.02),
    new THREE.Vector2(R, -0.96),
    new THREE.Vector2(R, level),
    new THREE.Vector2(0, level),
  ];
}

function makeLabel() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillRect(0, 0, c.width, c.height);
  const family = getComputedStyle(document.body).getPropertyValue("--font-manrope") || "sans-serif";
  ctx.fillStyle = "#221B1D";
  ctx.textAlign = "center";
  ctx.font = `500 120px ${family}, sans-serif`;
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "18px";
  ctx.fillText("BRUME", 512, 230);
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = "6px";
  ctx.font = `300 44px ${family}, sans-serif`;
  ctx.fillText("SÉRUM HYDRATANT · 30 ML", 512, 330);
  ctx.fillRect(412, 380, 200, 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function Bottle({ progress, pointer, lite }: { progress: RefObject<number>; pointer: RefObject<{ x: number; y: number }>; lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const body = useMemo(() => new THREE.LatheGeometry(bodyProfile(), 96), []);
  const liquid = useMemo(() => new THREE.LatheGeometry(liquidProfile(0.25), 64), []);
  const label = useMemo(() => makeLabel(), []);
  const { invalidate } = useThree();

  useEffect(() => {
    document.fonts?.ready.then(() => {
      const fresh = makeLabel();
      label.image = fresh.image;
      label.needsUpdate = true;
      invalidate();
    });
    return () => {
      body.dispose();
      liquid.dispose();
      label.dispose();
    };
  }, [body, liquid, label, invalidate]);

  useFrame((st, dt) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current ?? 0;
    const target = -0.5 + p * Math.PI * 2.2 + (pointer.current?.x ?? 0) * 0.35;
    g.rotation.y += (target - g.rotation.y) * (1 - Math.exp(-dt * 4));
    g.rotation.z = Math.sin(st.clock.elapsedTime * 0.6) * 0.04 + (pointer.current?.x ?? 0) * -0.06;
    g.rotation.x = 0.08 + (pointer.current?.y ?? 0) * 0.08;
    g.position.y = Math.sin(st.clock.elapsedTime * 0.9) * 0.05;
  });

  return (
    <group ref={group}>
      {/* verre */}
      <mesh geometry={body}>
        <MeshTransmissionMaterial
          samples={lite ? 3 : 6}
          resolution={lite ? 256 : 512}
          thickness={0.35}
          roughness={0.04}
          ior={1.45}
          chromaticAberration={0.03}
          anisotropicBlur={0.05}
          distortion={0.05}
          clearcoat={1}
          color="#ffffff"
          attenuationColor="#F3E3D8"
          attenuationDistance={2}
          background={nudeColor}
        />
      </mesh>
      {/* liquide */}
      <mesh geometry={liquid}>
        <meshPhysicalMaterial color="#E7B79C" roughness={0.25} transmission={0.35} thickness={0.8} clearcoat={0.6} />
      </mesh>
      {/* étiquette (bande partielle) */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.625, 0.625, 0.62, 64, 1, true, -Math.PI * 0.42, Math.PI * 0.84]} />
        <meshStandardMaterial map={label} transparent roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* bague + poire de la pipette */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.26, 48]} />
        <meshStandardMaterial color="#CFC5BF" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.62, 0]} scale={[1, 1.35, 1]}>
        <sphereGeometry args={[0.26, 48, 32]} />
        <meshStandardMaterial color="#221B1D" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.42, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.22, 48]} />
        <meshStandardMaterial color="#221B1D" roughness={0.55} />
      </mesh>
      {/* tube de la pipette dans le verre */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.9, 24]} />
        <meshPhysicalMaterial color="#ffffff" transmission={1} roughness={0.05} thickness={0.1} />
      </mesh>
    </group>
  );
}

export default function SerumBottle({
  progress,
  host,
  lite,
}: {
  progress: RefObject<number>;
  host: RefObject<HTMLElement | null>;
  lite: boolean;
}) {
  const pointer = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [host]);

  return (
    <Canvas
      dpr={[1, lite ? 1.25 : 1.5]}
      frameloop={visible ? "always" : "demand"}
      camera={{ fov: 30, position: [0, 0.2, 7.2] }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#fff4ec" />
      <Bottle progress={progress} pointer={pointer} lite={lite} />
      <ContactShadows position={[0, -1.25, 0]} opacity={0.35} scale={5} blur={2.6} far={2} color="#6b4a3c" frames={1} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#ffffff" position={[0, 3, 4]} scale={[6, 1.5, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#F2D5C4" position={[-4, 0, 2]} rotation-y={Math.PI / 2} scale={[3, 5, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[3, 1.5, 3]} scale={1.2} />
      </Environment>
    </Canvas>
  );
}
