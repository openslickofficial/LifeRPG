import Link from "next/link";
import { ShoppingBag, ArrowLeft, Clock } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ShopPage() {
  return (
    <div className="space-y-6">
      <div className="border-border/60 flex items-center justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-foreground text-2xl font-extrabold tracking-tight sm:text-3xl">
              Adventurer Shop & Vault
            </h1>
            <Badge variant="gold">PHASE 6</Badge>
          </div>
          <p className="font-body text-muted-foreground mt-1 text-xs sm:text-sm">
            Spend earned gold coins on HUD themes, legendary cosmetic badges,
            and custom real-world rewards.
          </p>
        </div>

        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>

      <Card className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center sm:p-12">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Adventurer Shop Vault
        </CardTitle>
        <CardDescription className="mt-2 max-w-md text-sm leading-relaxed">
          Catalog items from public.shop_items will be purchasable using your
          earned gold currency. Inventory management connects directly with your
          character sheet.
        </CardDescription>
        <div className="text-muted-foreground bg-muted/60 mt-6 flex items-center gap-2 rounded-xl px-3 py-1.5 font-mono text-xs">
          <Clock className="h-3.5 w-3.5" />
          <span>Scheduled for Phase 6: Economy & Shop Redemption</span>
        </div>
      </Card>
    </div>
  );
}
