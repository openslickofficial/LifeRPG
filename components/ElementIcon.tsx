import Image from "next/image";
import { cn } from "@/lib/utils";

export const ELEMENT_ICONS = {
  chest: "/elements/chest.png",
  coin: "/elements/coin.png",
  coin_bag: "/elements/coin_bag.png",
  defence: "/elements/defence.png",
  diamond: "/elements/diamond.png",
  fire: "/elements/fire.png",
  lightning: "/elements/lightning.png",
  sword: "/elements/sword.png",
  swords: "/elements/swords.png",
} as const;

export type ElementIconName = keyof typeof ELEMENT_ICONS;

const BLACK_BG: Partial<Record<ElementIconName, boolean>> = {
  chest: true,
  coin: true,
  coin_bag: true,
  diamond: true,
  swords: true,
};

export function ElementIcon({
  name,
  alt = "",
  size = 20,
  className,
  priority = false,
}: {
  name: ElementIconName;
  alt?: string;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={ELEMENT_ICONS[name]}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn(
        "pointer-events-none inline-block shrink-0 object-contain",
        BLACK_BG[name] && "mix-blend-multiply dark:mix-blend-screen",
        className
      )}
      aria-hidden={alt ? undefined : true}
    />
  );
}

export function AppLogo({
  className = "h-8 w-8",
  alt = "Revel",
  size = 64,
}: {
  className?: string;
  alt?: string;
  size?: number;
}) {
  return (
    <Image
      src="/app_logo.png"
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "pointer-events-none object-contain mix-blend-multiply dark:mix-blend-screen",
        className
      )}
    />
  );
}
