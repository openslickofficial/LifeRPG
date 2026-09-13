"use client";

import * as React from "react";
import {
  ShoppingBag,
  Coins,
  Check,
  Palette,
  Award,
  Sparkles,
  Zap,
  Moon,
  Shield,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { purchaseItemAction, applyThemeAction } from "@/lib/actions/shop";
import { createClient } from "@/lib/supabase/client";
import { BlobCharacter } from "@/components/BlobCharacter";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: "theme" | "badge" | "cosmetic";
}

const DEFAULT_ITEMS: ShopItem[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Cyberpunk Neon Theme",
    description:
      "Transforms your HUD with high-contrast glowing neon cyan and electric accents for high-energy focus sprints.",
    price: 250,
    type: "theme",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Midnight Obsidian Theme",
    description:
      "Deep OLED-black aesthetics with luminescent warm amber gold borders engineered for nocturnal focus.",
    price: 300,
    type: "theme",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Grandmaster Paladin Badge",
    description:
      "A prestigious golden emblem displayed on your character sheet signifying relentless daily discipline.",
    price: 500,
    type: "badge",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Aura of Deep Work",
    description:
      "A radiant arcane particle glow surrounding your character avatar during uninterrupted work sessions.",
    price: 400,
    type: "cosmetic",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Arcane Focus Banner",
    description:
      "An illustrated profile header banner infused with focus runes and glowing guild insignia.",
    price: 150,
    type: "cosmetic",
  },
];

export default function ShopPage() {
  const [items, setItems] = React.useState<ShopItem[]>(DEFAULT_ITEMS);
  const [currency, setCurrency] = React.useState<number>(1450); // Default preview currency
  const [ownedItemIds, setOwnedItemIds] = React.useState<Set<string>>(
    new Set(["00000000-0000-0000-0000-000000000005"]) // Demo initial owned item
  );
  const [appliedThemeId, setAppliedThemeId] = React.useState<string | null>(
    () => {
      if (typeof document !== "undefined") {
        const currentTheme =
          document.documentElement.getAttribute("data-theme");
        if (currentTheme === "cyberpunk") {
          return "00000000-0000-0000-0000-000000000001";
        }
        if (currentTheme === "obsidian") {
          return "00000000-0000-0000-0000-000000000002";
        }
      }
      return null;
    }
  );
  const [selectedFilter, setSelectedFilter] = React.useState<
    "all" | "theme" | "badge" | "cosmetic" | "owned"
  >("all");

  // Purchase modal dialog state
  const [pendingPurchaseItem, setPendingPurchaseItem] =
    React.useState<ShopItem | null>(null);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = React.useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const supabase = React.useMemo(() => createClient(), []);

  const showToast = (
    text: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch live shop data from Supabase
  React.useEffect(() => {
    let ignore = false;
    async function fetchShopData() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Fetch shop items
        const { data: dbItems } = await supabase
          .from("shop_items")
          .select("*")
          .order("price", { ascending: true });

        if (!ignore && dbItems && dbItems.length > 0) {
          setItems(dbItems as ShopItem[]);
        }

        if (user) {
          // Fetch user profile currency & active theme
          const { data: profile } = await supabase
            .from("profiles")
            .select("currency, applied_theme_id")
            .eq("id", user.id)
            .single();

          if (!ignore && profile) {
            setCurrency(profile.currency);
            setAppliedThemeId(profile.applied_theme_id || null);
          }

          // Fetch owned inventory
          const { data: inventory } = await supabase
            .from("inventory")
            .select("item_id")
            .eq("profile_id", user.id);

          if (!ignore && inventory) {
            setOwnedItemIds(new Set(inventory.map((inv) => inv.item_id)));
          }
        }
      } catch {
        // Keep offline preview defaults
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchShopData();
    return () => {
      ignore = true;
    };
  }, [supabase]);

  // 2. Handle Purchasing Flow
  const handleConfirmPurchase = async () => {
    if (!pendingPurchaseItem) return;
    const item = pendingPurchaseItem;
    setIsPurchasing(true);

    const isPreview =
      typeof window !== "undefined" &&
      window.location.search.includes("preview=true");

    // Optimistically update currency and owned set
    const previousCurrency = currency;
    const previousOwned = new Set(ownedItemIds);

    if (currency < item.price) {
      showToast("Insufficient gold balance for this item.", "error");
      setIsPurchasing(false);
      setPendingPurchaseItem(null);
      return;
    }

    setCurrency((prev) => prev - item.price);
    setOwnedItemIds((prev) => new Set([...prev, item.id]));
    setPendingPurchaseItem(null);

    const res = await purchaseItemAction(item.id);

    if (res.success) {
      showToast(`Acquired ${item.name}! Added to your vault.`);
    } else if (isPreview) {
      showToast(`Acquired ${item.name} in preview mode! (Saved to session)`);
    } else {
      // Rollback on server rejection
      setCurrency(previousCurrency);
      setOwnedItemIds(previousOwned);
      showToast(res.error || "Failed to purchase item.", "error");
    }

    setIsPurchasing(false);
  };

  // 3. Handle Theme Application
  const handleApplyTheme = async (themeItem: ShopItem | null) => {
    const themeSlug = themeItem
      ? themeItem.name.toLowerCase().includes("cyberpunk")
        ? "cyberpunk"
        : themeItem.name.toLowerCase().includes("obsidian")
          ? "obsidian"
          : "default"
      : "default";

    // Immediate zero-latency DOM update
    document.documentElement.setAttribute("data-theme", themeSlug);
    setAppliedThemeId(themeItem ? themeItem.id : null);

    showToast(
      themeItem
        ? `Applied ${themeItem.name}! App-wide accent theme updated.`
        : "Reverted to Arcane Violet default theme."
    );

    await applyThemeAction(themeItem ? themeItem.id : null);
  };

  const filteredItems = items.filter((item) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "owned") return ownedItemIds.has(item.id);
    return item.type === selectedFilter;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`shadow-elevated fixed right-4 bottom-20 z-50 flex items-center gap-3 rounded-2xl border p-4 backdrop-blur-xl md:bottom-8 ${
            toastMessage.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
              : toastMessage.type === "error"
                ? "border-rose-500/40 bg-rose-500/15 text-rose-800 dark:text-rose-200"
                : "border-cyan-500/40 bg-cyan-500/15 text-cyan-800 dark:text-cyan-200"
          }`}
        >
          {toastMessage.type === "success" ? (
            <Check
              className="h-5 w-5 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
          ) : (
            <AlertCircle
              className="h-5 w-5 shrink-0 text-rose-500"
              aria-hidden="true"
            />
          )}
          <span className="font-body text-xs font-semibold sm:text-sm">
            {toastMessage.text}
          </span>
        </div>
      )}

      {/* 1. Header Navigation & Gold Purse Display */}
      <div className="border-border/60 flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Adventurer Vault & Shop
            </h1>
            <Badge variant="gold">SHOP ENGINE</Badge>
          </div>
          <p className="font-body text-muted-foreground mt-1 text-xs sm:text-sm">
            Invest earned gold coins into HUD color themes, cosmetic perks, and
            character badges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Gold Purse Indicator */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 shadow-xs">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
              <Coins className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
                Purse Balance
              </span>
              <p className="font-mono text-base font-extrabold text-amber-600 dark:text-amber-400">
                {currency.toLocaleString()} Gold
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Active Theme Reset */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div
          role="tablist"
          aria-label="Shop Item Categories"
          className="bg-muted/60 border-border/80 flex flex-wrap items-center gap-1 rounded-2xl border p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === "all"}
            onClick={() => setSelectedFilter("all")}
            className={`font-heading focus-visible:ring-primary flex min-h-[44px] cursor-pointer items-center rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:outline-none ${
              selectedFilter === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === "theme"}
            onClick={() => setSelectedFilter("theme")}
            className={`font-heading focus-visible:ring-primary flex min-h-[44px] cursor-pointer items-center rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:outline-none ${
              selectedFilter === "theme"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Themes ({items.filter((i) => i.type === "theme").length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === "badge"}
            onClick={() => setSelectedFilter("badge")}
            className={`font-heading focus-visible:ring-primary flex min-h-[44px] cursor-pointer items-center rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:outline-none ${
              selectedFilter === "badge"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Badges ({items.filter((i) => i.type === "badge").length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === "cosmetic"}
            onClick={() => setSelectedFilter("cosmetic")}
            className={`font-heading focus-visible:ring-primary flex min-h-[44px] cursor-pointer items-center rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:outline-none ${
              selectedFilter === "cosmetic"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cosmetics ({items.filter((i) => i.type === "cosmetic").length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedFilter === "owned"}
            onClick={() => setSelectedFilter("owned")}
            className={`font-heading focus-visible:ring-primary flex min-h-[44px] cursor-pointer items-center rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:ring-2 focus-visible:outline-none ${
              selectedFilter === "owned"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Purchases ({items.filter((i) => ownedItemIds.has(i.id)).length})
          </button>
        </div>

        {appliedThemeId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleApplyTheme(null)}
            className="h-11 min-h-[44px] gap-2 rounded-xl text-xs font-semibold"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Reset to Default Violet Theme</span>
          </Button>
        )}
      </div>

      {/* 3. Items Grid */}
      <h2 className="sr-only">Available Vault Merchandise</h2>
      {loading ? (
        <div
          role="status"
          aria-label="Loading merchandise..."
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="flex flex-col justify-between rounded-3xl p-6 sm:p-7"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-lg" />
                </div>
                <Skeleton className="h-28 w-full rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-44 rounded-xl" />
                  <Skeleton className="h-4 w-full rounded-lg" />
                </div>
              </div>
              <div className="border-border/60 mt-6 border-t pt-4">
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            </Card>
          ))}
          <span className="sr-only">Loading merchandise cards...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center">
          <BlobCharacter blobId="mascot" size="md" state="idle" />
          <CardTitle className="mt-4 text-xl font-heading font-black">
            {selectedFilter === "owned"
              ? "No Vault Purchases Yet"
              : "No Items Found"}
          </CardTitle>
          <CardDescription className="mt-1.5 max-w-md text-xs leading-relaxed font-body">
            {selectedFilter === "owned"
              ? "Pip is guarding an empty vault! Complete quests to earn gold and unlock custom themes and cosmetic badges."
              : "Pip inspected every shelf, but found nothing here right now. Check back soon for new treasures!"}
          </CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const isOwned = ownedItemIds.has(item.id);
            const isAffordable = currency >= item.price;
            const isThemeActive =
              item.type === "theme" && appliedThemeId === item.id;

            // Theme Preview Styles
            const isCyberpunk = item.name.includes("Cyberpunk");
            const isObsidian = item.name.includes("Obsidian");

            return (
              <Card
                key={item.id}
                className={`shadow-layered flex flex-col justify-between rounded-3xl border-2 p-6 transition-all duration-150 hover:-translate-y-1 sm:p-7 ${
                  isThemeActive
                    ? "border-amber-500 bg-amber-500/5 shadow-[0_6px_0_0_#b45309]"
                    : "border-border bg-card hover:border-border hover:shadow-elevated"
                }`}
              >
                <div className="space-y-4">
                  {/* Top Row: Type Badge and Price Tag */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        item.type === "theme"
                          ? "mana"
                          : item.type === "badge"
                            ? "gold"
                            : "brand"
                      }
                      className="text-xs uppercase"
                    >
                      {item.type === "theme" && (
                        <Palette className="mr-1 h-3 w-3" />
                      )}
                      {item.type === "badge" && (
                        <Award className="mr-1 h-3 w-3" />
                      )}
                      {item.type === "cosmetic" && (
                        <Sparkles className="mr-1 h-3 w-3" />
                      )}
                      <span>{item.type}</span>
                    </Badge>

                    <div className="flex items-center gap-1.5 rounded-xl border-2 border-amber-500 bg-amber-400 px-3 py-1 font-mono text-xs font-black text-slate-950 shadow-[0_2px_0_0_#b45309]">
                      <Coins className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{item.price} Gold</span>
                    </div>
                  </div>

                  {/* Theme / Cosmetic Preview Container */}
                  <div className="border-border/80 bg-secondary/50 relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border-2 p-4">
                    {isCyberpunk && (
                      <div className="flex flex-col items-center gap-1.5">
                        <Zap className="h-8 w-8 text-cyan-500 drop-shadow-md" />
                        <span className="font-heading text-xs font-black tracking-wider text-cyan-500 uppercase">
                          Neon Cyan & Magenta HUD
                        </span>
                      </div>
                    )}
                    {isObsidian && (
                      <div className="flex flex-col items-center gap-1.5">
                        <Moon className="h-8 w-8 text-amber-500 drop-shadow-md" />
                        <span className="font-heading text-xs font-black tracking-wider text-amber-500 uppercase">
                          Pure Obsidian & Gold Runes
                        </span>
                      </div>
                    )}
                    {item.type === "badge" && (
                      <div className="flex flex-col items-center gap-1.5">
                        <Shield className="h-8 w-8 text-amber-500 drop-shadow-md" />
                        <span className="font-heading text-xs font-black tracking-wider text-amber-500 uppercase">
                          Paladin Emblem
                        </span>
                      </div>
                    )}
                    {item.type === "cosmetic" &&
                      !isCyberpunk &&
                      !isObsidian && (
                        <div className="flex flex-col items-center gap-1.5">
                          <Sparkles className="h-8 w-8 animate-spin text-violet-500 drop-shadow-md" />
                          <span className="font-heading text-xs font-black tracking-wider text-violet-500 uppercase">
                            Arcane Particles
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Title and Description */}
                  <div>
                    <CardTitle
                      as="h3"
                      className="font-heading text-foreground text-lg font-black"
                    >
                      {item.name}
                    </CardTitle>
                    <CardDescription className="font-body text-muted-foreground mt-1.5 text-xs leading-relaxed font-medium">
                      {item.description}
                    </CardDescription>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="border-border/60 mt-6 border-t pt-4">
                  {isOwned ? (
                    item.type === "theme" ? (
                      isThemeActive ? (
                        <div className="font-heading flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-emerald-600 bg-emerald-500 text-xs font-black tracking-wider text-white uppercase shadow-[0_3px_0_0_#065f46]">
                          <Check
                            className="h-4 w-4 stroke-[3]"
                            aria-hidden="true"
                          />
                          <span>Active Theme</span>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="default"
                          onClick={() => handleApplyTheme(item)}
                          className="h-11 min-h-[44px] w-full rounded-2xl text-xs font-black tracking-wider uppercase"
                        >
                          <Palette
                            className="mr-1.5 h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          <span>Apply Theme</span>
                        </Button>
                      )
                    ) : (
                      <div className="font-heading flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-emerald-600 bg-emerald-500 text-xs font-black tracking-wider text-white uppercase shadow-[0_3px_0_0_#065f46]">
                        <Check
                          className="h-4 w-4 stroke-[3]"
                          aria-hidden="true"
                        />
                        <span>Owned in Vault</span>
                      </div>
                    )
                  ) : (
                    <Button
                      type="button"
                      variant={isAffordable ? "gold" : "secondary"}
                      disabled={!isAffordable}
                      onClick={() => setPendingPurchaseItem(item)}
                      className="h-11 min-h-[44px] w-full rounded-2xl text-xs font-black tracking-wider uppercase"
                    >
                      {isAffordable ? (
                        <>
                          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                          <span>Buy for {item.price} Gold</span>
                        </>
                      ) : (
                        <span>Needs {item.price - currency} More Gold</span>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. Purchase Confirmation AlertDialog */}
      <AlertDialog
        open={Boolean(pendingPurchaseItem)}
        onOpenChange={(open) => {
          if (!open) setPendingPurchaseItem(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Unlock {pendingPurchaseItem?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This transaction will deduct{" "}
              <strong className="font-mono text-amber-500">
                {pendingPurchaseItem?.price} Gold
              </strong>{" "}
              from your current purse balance of{" "}
              <strong className="font-mono">{currency} Gold</strong>. The item
              will be permanently unlocked in your character vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPurchasing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Purchase</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
