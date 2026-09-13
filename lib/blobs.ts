export type BlobAttribute = "strength" | "intellect" | "creativity" | "discipline" | null;

export interface BlobMetadata {
  id: "zippo" | "orbit" | "muse" | "buddy" | "pip";
  name: string;
  imageNormal: string;
  imageHappy: string;
  imageSad: string;
  imagePath?: string;
  attribute: BlobAttribute;
  powerText: string;
  accentColor: string; // Hex color for glows/borders
  bgGlowClass: string;
  badgeBgClass: string;
}

export const BLOBS: BlobMetadata[] = [
  {
    id: "zippo",
    name: "Zippo",
    imageNormal: "/blobs/blob-green.png",
    imageHappy: "/blobs/blob-green-2e.png",
    imageSad: "/blobs/blob-green-3e.png",
    imagePath: "/blobs/blob-green.png",
    attribute: "strength",
    powerText: "Never runs out of energy — turns every workout into a party.",
    accentColor: "#22c55e",
    bgGlowClass: "from-emerald-500/20 to-green-500/5",
    badgeBgClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    id: "orbit",
    name: "Orbit",
    imageNormal: "/blobs/blob-blue.png",
    imageHappy: "/blobs/blob-blue-2e.png",
    imageSad: "/blobs/blob-blue-3e.png",
    imagePath: "/blobs/blob-blue.png",
    attribute: "intellect",
    powerText: "Sees one thing at a time, but sees it completely.",
    accentColor: "#3b82f6",
    bgGlowClass: "from-blue-500/20 to-cyan-500/5",
    badgeBgClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  {
    id: "muse",
    name: "Muse",
    imageNormal: "/blobs/blob-violet.png",
    imageHappy: "/blobs/blob-violet-2e.png",
    imageSad: "/blobs/blob-violet-3e.png",
    imagePath: "/blobs/blob-violet.png",
    attribute: "creativity",
    powerText: "Ideas spark out of nowhere when Muse is around.",
    accentColor: "#8b5cf6",
    bgGlowClass: "from-purple-500/20 to-violet-500/5",
    badgeBgClass: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  },
  {
    id: "buddy",
    name: "Buddy",
    imageNormal: "/blobs/blob-yellow.png",
    imageHappy: "/blobs/blob-yellow-2e.png",
    imageSad: "/blobs/blob-yellow-3e.png",
    imagePath: "/blobs/blob-yellow.png",
    attribute: "discipline",
    powerText: "Shows up every single day, rain or shine.",
    accentColor: "#f59e0b",
    bgGlowClass: "from-amber-500/20 to-yellow-500/5",
    badgeBgClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    id: "pip",
    name: "Pip",
    imageNormal: "/blobs/blob-pink.png",
    imageHappy: "/blobs/blob-pink-2e.png",
    imageSad: "/blobs/blob-pink-3e.png",
    imagePath: "/blobs/blob-pink.png",
    attribute: null,
    powerText: "Your companion for the whole journey — cheers you on, worries when you vanish.",
    accentColor: "#ec4899",
    bgGlowClass: "from-pink-500/20 to-rose-500/5",
    badgeBgClass: "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30",
  },
];

export const BLOBS_BY_ID: Record<string, BlobMetadata> = BLOBS.reduce(
  (acc, b) => {
    acc[b.id] = b;
    return acc;
  },
  {} as Record<string, BlobMetadata>
);

export const BLOBS_BY_ATTRIBUTE: Record<string, BlobMetadata> = BLOBS.reduce(
  (acc, b) => {
    if (b.attribute) {
      acc[b.attribute.toLowerCase()] = b;
    }
    return acc;
  },
  {} as Record<string, BlobMetadata>
);

export function getBlobById(id: string): BlobMetadata | undefined {
  return BLOBS_BY_ID[id.toLowerCase()];
}

export function getBlobByAttribute(
  attribute: string | null | undefined
): BlobMetadata | undefined {
  if (!attribute) return undefined;
  return BLOBS_BY_ATTRIBUTE[attribute.toLowerCase()];
}

export function getMascotBlob(): BlobMetadata {
  return BLOBS_BY_ID["pip"];
}
