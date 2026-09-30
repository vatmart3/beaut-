"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/device";
import { cn } from "@/lib/cn";

/**
 * Onde concentrique — shader GLSL maison (WebGL brut, sans three.js).
 * Chaque incrément de `trigger` lance une nouvelle onde depuis `origin`
 * (coordonnées 0–1 dans le canvas). La boucle s'arrête d'elle-même quand
 * l'onde est retombée : aucun coût au repos.
 */

const vert = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const frag = `
precision mediump float;
uniform vec2 u_res;
uniform vec2 u_origin;
uniform float u_t;
uniform float u_dur;
uniform float u_strength;
uniform vec3 u_light;
uniform vec3 u_shadow;

float wave(float d, float r, float k, float f){
  float x = d - r;
  return exp(-x*x*k) * sin(x*f);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  uv.y = 1.0 - uv.y;
  float aspect = u_res.x / u_res.y;
  vec2 q = vec2((uv.x - u_origin.x) * aspect, (uv.y - u_origin.y) * 2.4);
  float d = length(q);
  float t = u_t / u_dur;
  float life = smoothstep(1.0, 0.0, t);
  float speed = 1.35 * aspect;
  float w = 0.0;
  w += wave(d, t * speed, 38.0, 42.0);
  w += 0.7 * wave(d, max(t - 0.09, 0.0) * speed, 55.0, 60.0);
  w += 0.45 * wave(d, max(t - 0.2, 0.0) * speed, 70.0, 78.0);
  w *= life * u_strength;
  float a = clamp(abs(w), 0.0, 1.0);
  vec3 col = w > 0.0 ? u_light : u_shadow;
  gl_FragColor = vec4(col * a, a * 0.85);
}
`;

function hex(h: string): [number, number, number] {
  const n = parseInt(h.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function RippleCanvas({
  trigger,
  origin = { x: 0.5, y: 0 },
  duration = 2.4,
  strength = 1,
  light = "#FFFFFF",
  shadow = "#D4A78F",
  className,
}: {
  trigger: number;
  origin?: { x: number; y: number };
  duration?: number;
  strength?: number;
  light?: string;
  shadow?: string;
  className?: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const gl = useRef<{
    ctx: WebGLRenderingContext;
    prog: WebGLProgram;
    u: Record<string, WebGLUniformLocation | null>;
  } | null>(null);

  // Initialisation WebGL (une fois)
  useEffect(() => {
    const c = canvas.current;
    if (!c || reduced) return;
    const ctx = c.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!ctx) return;
    const sh = (type: number, src: string) => {
      const s = ctx.createShader(type)!;
      ctx.shaderSource(s, src);
      ctx.compileShader(s);
      return s;
    };
    const prog = ctx.createProgram()!;
    ctx.attachShader(prog, sh(ctx.VERTEX_SHADER, vert));
    ctx.attachShader(prog, sh(ctx.FRAGMENT_SHADER, frag));
    ctx.linkProgram(prog);
    if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) return;
    ctx.useProgram(prog);
    const buf = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, buf);
    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
    const loc = ctx.getAttribLocation(prog, "p");
    ctx.enableVertexAttribArray(loc);
    ctx.vertexAttribPointer(loc, 2, ctx.FLOAT, false, 0, 0);
    ctx.enable(ctx.BLEND);
    ctx.blendFunc(ctx.ONE, ctx.ONE_MINUS_SRC_ALPHA);
    const names = ["u_res", "u_origin", "u_t", "u_dur", "u_strength", "u_light", "u_shadow"];
    gl.current = { ctx, prog, u: Object.fromEntries(names.map((n) => [n, ctx.getUniformLocation(prog, n)])) };
    return () => {
      // Pas de loseContext() : en StrictMode, le même canvas est réinitialisé
      // aussitôt et récupérerait un contexte perdu.
      ctx.deleteProgram(prog);
      ctx.deleteBuffer(buf);
      gl.current = null;
    };
  }, [reduced]);

  // Lancement d'une onde à chaque trigger
  useEffect(() => {
    if (!trigger || reduced) return;
    const g = gl.current;
    const c = canvas.current;
    if (!g || !c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      c.width = Math.max(1, Math.round(c.clientWidth * dpr));
      c.height = Math.max(1, Math.round(c.clientHeight * dpr));
      g.ctx.viewport(0, 0, c.width, c.height);
    };
    resize();
    const { ctx, u } = g;
    ctx.uniform2f(u.u_origin, origin.x, origin.y);
    ctx.uniform1f(u.u_dur, duration);
    ctx.uniform1f(u.u_strength, strength);
    ctx.uniform3fv(u.u_light, hex(light));
    ctx.uniform3fv(u.u_shadow, hex(shadow));
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      ctx.uniform2f(u.u_res, c.width, c.height);
      ctx.uniform1f(u.u_t, t);
      ctx.clearColor(0, 0, 0, 0);
      ctx.clear(ctx.COLOR_BUFFER_BIT);
      if (t < duration) {
        ctx.drawArrays(ctx.TRIANGLES, 0, 3);
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // origin est un objet : on ne relance que sur trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, reduced]);

  if (reduced) return null;
  return <canvas ref={canvas} aria-hidden className={cn("pointer-events-none absolute inset-0 size-full", className)} />;
}
