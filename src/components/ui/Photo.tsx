import Image from "next/image";
import { photos, type PhotoId } from "@/data/photos";
import { cn } from "@/lib/cn";

/**
 * Photo cadrée sur son point focal (object-position), toujours en `cover`.
 * Le parent doit être positionné et dimensionné (fill).
 */
export function Photo({
  id,
  alt,
  sizes = "(min-width: 1024px) 40vw, 90vw",
  focal,
  className,
  preload,
}: {
  id: PhotoId;
  /** Texte alternatif ; par défaut celui de la photothèque. `""` = décoratif. */
  alt?: string;
  sizes?: string;
  /** Surcharge du point focal pour ce cadre précis. */
  focal?: string;
  className?: string;
  preload?: boolean;
}) {
  const p = photos[id];
  return (
    <Image
      src={p.src}
      alt={alt ?? p.alt}
      fill
      sizes={sizes}
      preload={preload}
      className={cn("object-cover", className)}
      style={{ objectPosition: focal ?? p.focal }}
    />
  );
}
