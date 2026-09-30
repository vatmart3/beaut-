/** Minuscules, sans accents ni ponctuation superflue — pour la recherche instantanée. */
export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, " ")
    .toLowerCase()
    .trim();
}

/** Tous les mots de la requête sont présents dans le texte. */
export function matches(haystack: string, query: string) {
  const q = normalize(query);
  if (!q) return true;
  const h = normalize(haystack);
  return q.split(/\s+/).every((w) => h.includes(w));
}
