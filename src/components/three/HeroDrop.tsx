"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";

/**
 * Moment 3D signature : une goutte d'eau en verre liquide flotte devant le
 * mot-marque et le réfracte (MeshTransmissionMaterial : réfraction, légère
 * aberration chromatique). Le mot-marque est repeint dans une texture 2D à
 * partir des positions RÉELLES des lettres du DOM (alignement au pixel), ce
 * qui permet à la goutte de le déformer.
 */

export interface DropInputs {
  /** Pointeur (souris ou inclinaison) normalisé 0–1 dans la coquille. */
  pointer: RefObject<{ x: number; y: number; active: boolean }>;
  /** Progression du scroll dans le hero (0–1). */
  progress: RefObject<number>;
  /** Position de repos de la goutte (0–1) + rayon en px. */
  home: RefObject<{ x: number; y: number; r: number }>;
}

interface Props extends DropInputs {
  shell: RefObject<HTMLElement | null>;
  word: RefObject<HTMLElement | null>;
  lite: boolean;
  onReady: () => void;
}

const ECUME = "#FFFDFA";
const CAM_Z = 10;
const DROP_Z = 1.2;
const ecumeColor = new THREE.Color(ECUME);

/** Géométrie procédurale de goutte : sphère étirée et pincée vers le haut. */
function makeDropGeometry() {
  const g = new THREE.SphereGeometry(1, 96, 96);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    if (v.y > 0) {
      const k = Math.pow(v.y, 1.35);
      const pinch = 1 - 0.92 * k;
      v.x *= pinch;
      v.z *= pinch;
      v.y *= 1.55;
    } else {
      v.y *= 0.96;
    }
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function paintWordmark(canvas: HTMLCanvasElement, shell: HTMLElement, word: HTMLElement, dpr: number) {
  const rect = shell.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = ECUME;
  ctx.fillRect(0, 0, rect.width, rect.height);
  const letters = Array.from(word.querySelectorAll<HTMLElement>("[data-letter]"));
  if (!letters.length) return;
  const cs = getComputedStyle(letters[0]);
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  ctx.fillStyle = cs.color;
  ctx.textBaseline = "alphabetic";
  const m = ctx.measureText("BRUME");
  const A = m.fontBoundingBoxAscent;
  const D = m.fontBoundingBoxDescent;
  for (const el of letters) {
    const r = el.getBoundingClientRect();
    const x = r.left - rect.left;
    const baseline = r.top - rect.top + (r.height - (A + D)) / 2 + A;
    ctx.fillText(el.textContent ?? "", x, baseline);
  }
}

function Scene({ shell, word, pointer, progress, home, lite, onReady }: Props) {
  const { size, viewport, invalidate } = useThree();
  const drop = useRef<THREE.Mesh>(null);
  const geometry = useMemo(makeDropGeometry, []);
  const canvas2d = useMemo(() => document.createElement("canvas"), []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas2d);
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  }, [canvas2d]);
  const state = useRef({ x: 0, y: 0, vx: 0, vy: 0, init: false });
  const readySent = useRef(false);

  // Peint le mot-marque (au montage, au resize, quand les polices sont prêtes).
  useEffect(() => {
    const s = shell.current;
    const w = word.current;
    if (!s || !w) return;
    let cancelled = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const repaint = () => {
      if (cancelled) return;
      paintWordmark(canvas2d, s, w, dpr);
      texture.needsUpdate = true;
      invalidate();
      if (!readySent.current) {
        readySent.current = true;
        requestAnimationFrame(() => onReady());
      }
    };
    document.fonts.ready.then(repaint);
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(repaint, 120);
    });
    ro.observe(s);
    return () => {
      cancelled = true;
      clearTimeout(t);
      ro.disconnect();
    };
  }, [shell, word, canvas2d, texture, invalidate, onReady, size.width, size.height]);

  useEffect(() => () => {
    geometry.dispose();
    texture.dispose();
  }, [geometry, texture]);

  useFrame((st, delta) => {
    const m = drop.current;
    if (!m) return;
    const dt = Math.min(delta, 1 / 30);
    const h = home.current;
    const p = pointer.current;
    const prog = progress.current ?? 0;
    // cible en px dans la coquille
    const rangeX = size.width * 0.07;
    const rangeY = size.height * 0.09;
    let tx = h.x * size.width + (p.active ? (p.x - 0.5) * 2 * rangeX : 0);
    let ty = h.y * size.height + (p.active ? (p.y - 0.5) * 2 * rangeY : 0);
    // chute au scroll (accélération)
    const fall = prog * prog;
    ty += fall * size.height * 0.95;
    tx += fall * (0.5 - h.x) * size.width * 0.05;
    const s = state.current;
    if (!s.init) {
      s.x = tx;
      s.y = ty;
      s.init = true;
    }
    const k = 1 - Math.exp(-dt * (prog > 0.02 ? 9 : 2.4));
    const nx = s.x + (tx - s.x) * k;
    const ny = s.y + (ty - s.y) * k;
    s.vx = (nx - s.x) / Math.max(dt, 1e-3);
    s.vy = (ny - s.y) / Math.max(dt, 1e-3);
    s.x = nx;
    s.y = ny;

    const unit = viewport.height / size.height;
    // compensation de perspective : la goutte est à z = 1,2, plus près de la caméra que le plan
    const f = (CAM_Z - DROP_Z) / CAM_Z;
    m.position.set((s.x - size.width / 2) * unit * f, -(s.y - size.height / 2) * unit * f, DROP_Z);
    const r = h.r * unit * f;
    const t = st.clock.elapsedTime;
    const wobble = Math.sin(t * 1.6) * 0.035;
    const stretch = Math.min(Math.abs(s.vy) / 1400, 0.35) + fall * 0.25;
    m.scale.set(r * (1 + wobble - stretch * 0.35), r * (1 - wobble + stretch), r * (1 + wobble - stretch * 0.35));
    m.rotation.z = THREE.MathUtils.clamp(-s.vx / 2600, -0.35, 0.35);
    m.rotation.y = t * 0.25;
  });

  return (
    <>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh ref={drop} geometry={geometry}>
        <MeshTransmissionMaterial
          samples={lite ? 3 : 6}
          resolution={lite ? 256 : 512}
          transmission={1}
          thickness={0.55}
          roughness={0.02}
          ior={1.33}
          chromaticAberration={0.045}
          anisotropicBlur={0.08}
          distortion={0.18}
          distortionScale={0.35}
          temporalDistortion={0.08}
          clearcoat={1}
          attenuationColor="#E3E9E1"
          attenuationDistance={3}
          color="#ffffff"
          background={ecumeColor}
        />
      </mesh>
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#fff7ef" position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#C9A48A" position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[3, 2, 4]} scale={1.4} />
        <Lightformer form="rect" intensity={0.8} color="#9CAF9A" position={[4, -3, 2]} scale={[5, 2, 1]} />
      </Environment>
    </>
  );
}

export default function HeroDrop(props: Props) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = props.shell.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, [props.shell]);

  return (
    <Canvas
      dpr={[1, props.lite ? 1.25 : 1.5]}
      frameloop={visible ? "always" : "demand"}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 28, position: [0, 0, CAM_Z], near: 0.1, far: 50 }}
      flat
      aria-hidden
      style={{ position: "absolute", inset: 0 }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
