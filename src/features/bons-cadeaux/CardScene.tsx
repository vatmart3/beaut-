"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { CARD_H, CARD_W, drawBack, drawFront, cardFonts, loadCardFonts, mix, type CardData } from "./cardArt";
import { motifDe } from "./model";

/**
 * Carte cadeau en 3D (React Three Fiber).
 * - Géométrie : rectangle à coins arrondis extrudé très fin + deux faces
 *   texturées (canvas 2D redessiné en direct).
 * - Rendu à la demande (`frameloop="demand"`) : on n'invalide que pendant
 *   les interactions et les amortis. Aucun coût au repos.
 * - Glisser (souris / doigt) pour faire pivoter, relâcher : la carte se
 *   remet doucement sur sa face la plus proche. Un tap la retourne.
 */

const W = 3.2;
const H = 2;
const R = 0.16;
const DEPTH = 0.028;
const PI = Math.PI;

export interface Controls {
  base: number;
  drag: number;
  dragging: boolean;
  hx: number;
  hy: number;
}

function roundedShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, PI / 2, PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, PI, (3 * PI) / 2, false);
  return s;
}

function faceGeometry(shape: THREE.Shape) {
  const g = new THREE.ShapeGeometry(shape, 24);
  const pos = g.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) + W / 2) / W;
    uv[i * 2 + 1] = (pos.getY(i) + H / 2) / H;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 64, 4, 128, 64, 124);
  g.addColorStop(0, "rgba(59,42,51,0.55)");
  g.addColorStop(0.45, "rgba(59,42,51,0.22)");
  g.addColorStop(1, "rgba(59,42,51,0)");
  ctx.setTransform(1, 0, 0, 0.5, 0, 32);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeCanvas() {
  const c = document.createElement("canvas");
  c.width = CARD_W;
  c.height = CARD_H;
  return c;
}

const LIGHT = new THREE.Vector3(-0.45, 0.5, 1).normalize();
const WARM = new THREE.Color("#fff6ec");

function Card({
  data,
  fontsKey,
  ctl,
  landing,
  onDrawn,
}: {
  data: CardData;
  fontsKey: number;
  ctl: RefObject<Controls>;
  landing: boolean;
  onDrawn: () => void;
}) {
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);
  const group = useRef<THREE.Group>(null);
  const frontMat = useRef<THREE.MeshBasicMaterial>(null);
  const backMat = useRef<THREE.MeshBasicMaterial>(null);
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const tex = useRef<{ fc: HTMLCanvasElement; bc: HTMLCanvasElement; ft: THREE.CanvasTexture; bt: THREE.CanvasTexture } | null>(null);
  const st = useRef({ angle: landing ? -PI * 0.42 : 0, lift: landing ? 1 : 0, hx: 0, hy: 0, w: 0, h: 0 });

  const { body, face } = useMemo(() => {
    const shape = roundedShape(W, H, R);
    const body = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false, curveSegments: 24 });
    body.translate(0, 0, -DEPTH / 2);
    return { body, face: faceGeometry(shape) };
  }, []);
  const [shadowTex] = useState(shadowTexture);

  useEffect(
    () => () => {
      body.dispose();
      face.dispose();
      shadowTex.dispose();
    },
    [body, face, shadowTex],
  );

  // Textures (une fois)
  useEffect(() => {
    const fc = makeCanvas();
    const bc = makeCanvas();
    const mk = (c: HTMLCanvasElement) => {
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      return t;
    };
    const ft = mk(fc);
    const bt = mk(bc);
    tex.current = { fc, bc, ft, bt };
    if (frontMat.current) {
      frontMat.current.map = ft;
      frontMat.current.needsUpdate = true;
    }
    if (backMat.current) {
      backMat.current.map = bt;
      backMat.current.needsUpdate = true;
    }
    return () => {
      ft.dispose();
      bt.dispose();
      tex.current = null;
    };
  }, [gl]);

  // Redessin en direct
  useEffect(() => {
    const t = tex.current;
    if (!t) return;
    const f = cardFonts();
    drawFront(t.fc.getContext("2d")!, data, f);
    drawBack(t.bc.getContext("2d")!, data, f);
    t.ft.needsUpdate = true;
    t.bt.needsUpdate = true;
    invalidate();
    // la carte n'est montrée qu'une fois dessinée avec les bonnes polices
    if (fontsKey) onDrawn();
  }, [data, fontsKey, invalidate, onDrawn]);

  useFrame((state, delta) => {
    const g = group.current;
    const c = ctl.current;
    if (!g || !c) return;
    const s = st.current;
    const dt = Math.min(delta, 1 / 30);
    const damp = THREE.MathUtils.damp;

    // Cadrage : la carte tient toujours dans le canvas, avec de l'air.
    if (state.size.width !== s.w || state.size.height !== s.h) {
      s.w = state.size.width;
      s.h = state.size.height;
      const cam = state.camera as THREE.PerspectiveCamera;
      const half = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
      const aspect = s.w / Math.max(1, s.h);
      cam.position.set(0, 0.12, Math.max(1.55 / half, (W * 0.58) / (half * aspect)));
      cam.lookAt(0, -0.06, 0);
      cam.updateProjectionMatrix();
    }

    const target = c.base + c.drag;
    s.angle = damp(s.angle, target, c.dragging ? 16 : 5.2, dt);
    s.hx = damp(s.hx, c.hx, 4.5, dt);
    s.hy = damp(s.hy, c.hy, 4.5, dt);
    s.lift = damp(s.lift, 0, 2.6, dt);

    const ry = s.angle + s.hx * 0.2;
    g.rotation.set(-0.05 + s.hy * 0.12 - s.lift * 0.95, ry, s.lift * 0.1);
    g.position.set(0, 0.06 + s.lift * 0.55, 0);
    const sc = 1 - s.lift * 0.08;
    g.scale.set(sc, sc, sc);

    // Ombrage doux et chaud : les faces sont en couleurs exactes, modulées selon l'orientation.
    const n = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry));
    const lf = THREE.MathUtils.clamp(n.dot(LIGHT), -1, 1);
    frontMat.current?.color.copy(WARM).multiplyScalar(0.9 + 0.1 * Math.max(0, lf));
    backMat.current?.color.copy(WARM).multiplyScalar(0.9 + 0.1 * Math.max(0, -lf));

    if (shadow.current && shadowMat.current) {
      const facing = Math.abs(Math.cos(ry));
      shadow.current.scale.set(0.55 + 0.45 * facing + s.lift * 0.2, 1 + s.lift * 0.6, 1);
      shadowMat.current.opacity = 0.85 * (1 - s.lift * 0.65);
    }

    const moving =
      Math.abs(s.angle - target) > 1e-4 || Math.abs(s.hx - c.hx) > 1e-4 || Math.abs(s.hy - c.hy) > 1e-4 || s.lift > 1e-4;
    if (moving) state.invalidate();
  });

  const m = motifDe(data.motif);
  const edge = useMemo(() => mix(m.fond, m.encre, 0.12), [m.fond, m.encre]);

  return (
    <>
      <group ref={group}>
        <mesh geometry={body}>
          <meshStandardMaterial color={edge} roughness={0.7} metalness={0} />
        </mesh>
        <mesh geometry={face} position={[0, 0, DEPTH / 2 + 0.0015]}>
          <meshBasicMaterial ref={frontMat} toneMapped={false} />
        </mesh>
        <mesh geometry={face} position={[0, 0, -DEPTH / 2 - 0.0015]} rotation={[0, PI, 0]}>
          <meshBasicMaterial ref={backMat} toneMapped={false} />
        </mesh>
        {/* Léger reflet : couche spéculaire additive (diffus noir). */}
        <mesh geometry={face} position={[0, 0, DEPTH / 2 + 0.003]}>
          <meshStandardMaterial color="#000000" roughness={0.3} metalness={0} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh geometry={face} position={[0, 0, -DEPTH / 2 - 0.003]} rotation={[0, PI, 0]}>
          <meshStandardMaterial color="#000000" roughness={0.3} metalness={0} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={shadow} position={[0, -1.3, 0]} rotation={[-PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 1.5]} />
        <meshBasicMaterial ref={shadowMat} map={shadowTex} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

export default function CardScene({
  data,
  turns,
  onTurns,
  landing = false,
  onReady,
}: {
  data: CardData;
  turns: number;
  onTurns: (n: number) => void;
  landing?: boolean;
  onReady?: () => void;
}) {
  const ctl = useRef<Controls>({ base: turns * PI, drag: 0, dragging: false, hx: 0, hy: 0 });
  const inval = useRef<(() => void) | null>(null);
  const down = useRef<{ x: number; width: number; moved: boolean } | null>(null);
  const [fontsKey, setFontsKey] = useState(0);
  const readyOnce = useRef(false);

  useEffect(() => {
    let alive = true;
    loadCardFonts().then(() => {
      if (alive) setFontsKey(1);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    ctl.current.base = turns * PI;
    inval.current?.();
  }, [turns]);

  const onDrawn = useMemo(
    () => () => {
      if (readyOnce.current) return;
      readyOnce.current = true;
      onReady?.();
    },
    [onReady],
  );

  const kick = () => inval.current?.();

  return (
    <div
      className="absolute inset-0 cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const r = e.currentTarget.getBoundingClientRect();
        down.current = { x: e.clientX, width: r.width, moved: false };
        ctl.current.dragging = true;
        kick();
      }}
      onPointerMove={(e) => {
        const d = down.current;
        const c = ctl.current;
        if (d && c.dragging) {
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 6) d.moved = true;
          c.drag = (dx / Math.max(240, d.width)) * PI * 1.25;
        } else if (e.pointerType === "mouse") {
          const r = e.currentTarget.getBoundingClientRect();
          c.hx = ((e.clientX - r.left) / r.width - 0.5) * 2;
          c.hy = ((e.clientY - r.top) / r.height - 0.5) * 2;
        }
        kick();
      }}
      onPointerUp={() => {
        const d = down.current;
        const c = ctl.current;
        if (!d) return;
        if (!d.moved) {
          c.base = (turns + 1) * PI;
          onTurns(turns + 1);
        } else {
          const n = Math.round((c.base + c.drag) / PI);
          c.base = n * PI;
          if (n !== turns) onTurns(n);
        }
        c.drag = 0;
        c.dragging = false;
        down.current = null;
        kick();
      }}
      onPointerCancel={() => {
        const c = ctl.current;
        c.drag = 0;
        c.dragging = false;
        down.current = null;
        kick();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        ctl.current.hx = 0;
        ctl.current.hy = 0;
        kick();
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        flat
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        camera={{ fov: 30, position: [0, 0.12, 6], near: 0.1, far: 40 }}
        onCreated={(s) => {
          inval.current = s.invalidate;
        }}
        aria-hidden
      >
        <ambientLight intensity={1.6} color="#fff1e4" />
        <directionalLight position={[-3, 4, 5]} intensity={1.4} color="#ffe7d2" />
        <Environment resolution={128} frames={1}>
          <Lightformer form="rect" intensity={3.2} color="#fff0e0" position={[-2.2, 1.8, 6]} scale={[5, 2.6, 1]} />
          <Lightformer form="rect" intensity={1.6} color="#ffe2cc" position={[4, -0.5, 3]} rotation={[0, -PI / 3, 0]} scale={[0.8, 6, 1]} />
          <Lightformer form="circle" intensity={1.2} color="#f4efe8" position={[0, 5, -2]} scale={3} />
        </Environment>
        <Card data={data} fontsKey={fontsKey} ctl={ctl} landing={landing} onDrawn={onDrawn} />
      </Canvas>
    </div>
  );
}
