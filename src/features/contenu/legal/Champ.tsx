/** Champ à compléter par l'exploitante : repéré visuellement tant qu'il est entre crochets. */
export function Champ({ children }: { children: string }) {
  const vide = children.trim().startsWith("[");
  return vide ? <mark className="rounded-[6px] bg-argile-pale px-1.5 py-0.5 text-prune">{children}</mark> : <>{children}</>;
}
