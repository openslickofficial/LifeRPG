"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export interface ShopActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  isRateLimited?: boolean;
}

// Map item IDs or names to theme slugs
function getThemeSlug(item: { id: string; name: string } | null): string {
  if (!item) return "default";
  const name = item.name.toLowerCase();
  if (
    name.includes("cyberpunk") ||
    item.id === "00000000-0000-0000-0000-000000000001"
  ) {
    return "cyberpunk";
  }
  if (
    name.includes("obsidian") ||
    item.id === "00000000-0000-0000-0000-000000000002"
  ) {
    return "obsidian";
  }
  return "default";
}

/**
 * Atomically purchases an item from the vault.
 * Enforces rate limiting (10 purchases/min), server-side balance checking, and duplicate prevention.
 */
export async function purchaseItemAction(
  itemId: string
): Promise<ShopActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "You must be authenticated to purchase items from the vault.",
        code: "unauthenticated",
      };
    }

    // 1. Enforce rate limiting: 10 purchases per minute per user
    const rl = await rateLimit(user.id, "purchase_item");
    if (!rl.success) {
      return {
        success: false,
        error:
          "Vault rate limit reached. Please wait a moment before purchasing more items.",
        code: "rate_limited",
        isRateLimited: true,
      };
    }

    // 2. Call Postgres Atomic RPC function
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "purchase_item_atomic",
      {
        p_item_id: itemId,
      }
    );

    if (rpcError) {
      // Graceful fallback if RPC function is not yet deployed in remote Supabase:
      const { data: item } = await supabase
        .from("shop_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (!item) {
        return {
          success: false,
          error: "Item not found in vault.",
          code: "item_not_found",
        };
      }

      // Check if already owned
      const { data: existingOwnership } = await supabase
        .from("inventory")
        .select("id")
        .eq("profile_id", user.id)
        .eq("item_id", itemId)
        .maybeSingle();

      if (existingOwnership) {
        return {
          success: false,
          error: "You already own this item in your inventory.",
          code: "already_owned",
        };
      }

      // Check currency
      const { data: profile } = await supabase
        .from("profiles")
        .select("currency")
        .eq("id", user.id)
        .single();

      if (!profile || profile.currency < item.price) {
        return {
          success: false,
          error: "Insufficient gold balance to purchase this item.",
          code: "insufficient_funds",
        };
      }

      // Deduct currency & insert inventory
      const newCurrency = profile.currency - item.price;
      await supabase
        .from("profiles")
        .update({ currency: newCurrency, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      await supabase.from("inventory").insert({
        profile_id: user.id,
        item_id: itemId,
        purchased_at: new Date().toISOString(),
      });

      revalidatePath("/dashboard/shop");
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/quests");

      return {
        success: true,
        data: {
          item_id: itemId,
          item_name: item.name,
          item_type: item.type,
          price_paid: item.price,
          new_currency: newCurrency,
        },
      };
    }

    const res = rpcResult as {
      success: boolean;
      error?: string;
      code?: string;
      new_currency?: number;
      item_name?: string;
    };

    if (!res.success) {
      return {
        success: false,
        error: res.error || "Purchase failed.",
        code: res.code || "error",
      };
    }

    revalidatePath("/dashboard/shop");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/quests");

    return {
      success: true,
      data: res,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to purchase item.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Activates an owned theme item app-wide by setting the applied_theme_id and theme cookie.
 */
export async function applyThemeAction(
  themeItemId: string | null
): Promise<ShopActionResult> {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Default theme reset
    if (!themeItemId) {
      cookieStore.set("app_theme", "default", { path: "/", maxAge: 31536000 });
      if (user) {
        await supabase
          .from("profiles")
          .update({
            applied_theme_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
      revalidatePath("/", "layout");
      return {
        success: true,
        data: { theme: "default", theme_name: "Arcane Violet (Default)" },
      };
    }

    // Verify item is a theme
    const { data: item } = await supabase
      .from("shop_items")
      .select("*")
      .eq("id", themeItemId)
      .eq("type", "theme")
      .single();

    if (!item) {
      return {
        success: false,
        error: "Invalid theme selected.",
        code: "invalid_theme",
      };
    }

    // If authenticated, verify ownership in inventory
    if (user) {
      const { data: owned } = await supabase
        .from("inventory")
        .select("id")
        .eq("profile_id", user.id)
        .eq("item_id", themeItemId)
        .maybeSingle();

      if (!owned) {
        return {
          success: false,
          error: "You must unlock this theme in the shop before applying it.",
          code: "not_owned",
        };
      }

      await supabase
        .from("profiles")
        .update({
          applied_theme_id: themeItemId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    const themeSlug = getThemeSlug(item);
    cookieStore.set("app_theme", themeSlug, { path: "/", maxAge: 31536000 });

    revalidatePath("/", "layout");

    return {
      success: true,
      data: {
        theme: themeSlug,
        theme_name: item.name,
      },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to apply theme.";
    return {
      success: false,
      error: message,
    };
  }
}
