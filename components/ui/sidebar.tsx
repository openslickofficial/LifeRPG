"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "4.5rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

// --- External Store for Sidebar Open/Collapsed State ---
let sidebarOpenStore = true;
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(SIDEBAR_COOKIE_NAME);
    if (saved !== null) {
      sidebarOpenStore = saved === "true";
    }
  } catch {
    // ignore
  }
}

const openListeners = new Set<() => void>();
function subscribeOpen(callback: () => void) {
  openListeners.add(callback);
  return () => {
    openListeners.delete(callback);
  };
}
function getOpenSnapshot() {
  return sidebarOpenStore;
}
function getOpenServerSnapshot() {
  return true;
}
function setOpenStore(val: boolean) {
  sidebarOpenStore = val;
  try {
    localStorage.setItem(SIDEBAR_COOKIE_NAME, String(val));
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${val}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  } catch {
    // ignore
  }
  openListeners.forEach((l) => l());
}

// --- External Store for Mobile Screen Detection ---
const resizeListeners = new Set<() => void>();
function subscribeResize(callback: () => void) {
  if (resizeListeners.size === 0 && typeof window !== "undefined") {
    window.addEventListener("resize", onWindowResize);
  }
  resizeListeners.add(callback);
  return () => {
    resizeListeners.delete(callback);
    if (resizeListeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("resize", onWindowResize);
    }
  };
}
function onWindowResize() {
  resizeListeners.forEach((l) => l());
}
function getIsMobileSnapshot() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}
function getIsMobileServerSnapshot() {
  return false;
}

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean | ((value: boolean) => boolean)) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = React.useSyncExternalStore(
      subscribeResize,
      getIsMobileSnapshot,
      getIsMobileServerSnapshot
    );
    const storeOpen = React.useSyncExternalStore(
      subscribeOpen,
      getOpenSnapshot,
      getOpenServerSnapshot
    );
    const [openMobile, setOpenMobile] = React.useState(false);

    const open = openProp ?? (storeOpen !== undefined ? storeOpen : defaultOpen);

    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          setOpenStore(openState);
        }
      },
      [setOpenProp, open]
    );

    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((prev) => !prev);
      } else {
        setOpen((prev) => !prev);
      }
    }, [isMobile, setOpen]);

    // Keyboard shortcut (Ctrl+b / Cmd+b)
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo<SidebarContextProps>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, toggleSidebar]
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-[[data-variant=inset]]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "icon",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    // 1. Mobile Drawer View
    if (isMobile) {
      return (
        <>
          {/* Overlay backdrop */}
          {openMobile && (
            <div
              onClick={() => setOpenMobile(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
              aria-hidden="true"
            />
          )}

          {/* Slide-out mobile drawer panel */}
          <div
            ref={ref}
            data-mobile="true"
            className={cn(
              "bg-card text-card-foreground fixed inset-y-0 z-50 flex h-full w-[--sidebar-width-mobile] flex-col border-r shadow-2xl transition-transform duration-300 ease-in-out",
              side === "left"
                ? openMobile
                  ? "left-0 translate-x-0"
                  : "left-0 -translate-x-full"
                : openMobile
                  ? "right-0 translate-x-0"
                  : "right-0 translate-x-full",
              className
            )}
            style={
              {
                "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            {...props}
          >
            {/* Mobile Close Button */}
            <div className="absolute top-3 right-3 z-50">
              <button
                type="button"
                onClick={() => setOpenMobile(false)}
                className="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-xl p-1 transition-colors"
                aria-label="Close Sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </div>
        </>
      );
    }

    // 2. Desktop Collapsible Sidebar
    return (
      <div
        ref={ref}
        className={cn(
          "group peer hidden md:block text-sidebar-foreground shrink-0 transition-[width] duration-200 ease-linear",
          state === "collapsed" ? "w-[4.5rem]" : "w-64"
        )}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* Fixed sidebar element */}
        <div
          className={cn(
            "fixed inset-y-0 z-40 hidden h-svh transition-[left,right,width] duration-200 ease-linear md:flex flex-col border-r bg-card/95 backdrop-blur-xl border-border/70",
            side === "left" ? "left-0" : "right-0",
            state === "collapsed" ? "w-[4.5rem]" : "w-64",
            variant === "floating" || variant === "inset" ? "p-2" : "",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col justify-between overflow-hidden"
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Sidebar.displayName = "Sidebar";

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, state } = useSidebar();

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 rounded-xl border border-border/60 bg-card text-foreground hover:bg-secondary hover:text-foreground active:translate-y-0.5",
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      aria-label={state === "expanded" ? "Collapse Sidebar" : "Expand Sidebar"}
      title={state === "expanded" ? "Collapse Sidebar (Ctrl+B)" : "Expand Sidebar (Ctrl+B)"}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

export const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-hidden="true"
      tabIndex={-1}
      className={cn(
        "pointer-events-none absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        className
      )}
      {...props}
    />
  );
});
SidebarRail.displayName = "SidebarRail";

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background transition-[margin,padding] duration-200 ease-linear",
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
});
SidebarHeader.displayName = "SidebarHeader";

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = "SidebarFooter";

export const SidebarSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 h-px bg-border/60", className)}
      {...props}
    />
  );
});
SidebarSeparator.displayName = "SidebarSeparator";

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-3 group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = "SidebarContent";

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-1", className)}
      {...props}
    />
  );
});
SidebarGroup.displayName = "SidebarGroup";

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "text-muted-foreground font-heading flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-bold uppercase tracking-wider outline-none transition-[margin,opacity] duration-200 ease-linear",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";

export const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-muted-foreground outline-none transition-transform hover:bg-secondary hover:text-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "after:absolute after:-inset-2 after:md:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  );
});
SidebarGroupAction.displayName = "SidebarGroupAction";

export const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
});
SidebarGroupContent.displayName = "SidebarGroupContent";

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1.5", className)}
    {...props}
  />
));
SidebarMenu.displayName = "SidebarMenu";

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-3 overflow-hidden rounded-2xl p-2.5 text-left text-sm font-semibold outline-none transition-[width,height,padding] duration-75 focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "hover:bg-secondary hover:text-foreground text-muted-foreground",
        outline:
          "bg-background shadow-xs hover:bg-secondary hover:text-foreground",
      },
      size: {
        default: "h-11 min-h-[44px]",
        sm: "h-9 text-xs",
        lg: "h-12 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    tooltip?: string;
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(
          sidebarMenuButtonVariants({ variant, size }),
          isActive && "bg-secondary text-primary font-bold",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton";
