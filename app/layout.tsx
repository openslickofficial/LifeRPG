import type { Metadata } from "next";
import { Fredoka, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { cookies } from "next/headers";

const fredoka = Fredoka({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Revel — Turn Your Tasks Into Triumphs",
  description:
    "Transform daily habits, deep work sprints, and self-improvement into an epic gamified role-playing adventure with Revel.",
  openGraph: {
    title: "Revel — Turn Your Tasks Into Triumphs",
    description:
      "Transform daily habits, deep work sprints, and self-improvement into an epic gamified role-playing adventure with Revel.",
    siteName: "Revel",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const appliedTheme = cookieStore.get("app_theme")?.value || "default";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme={appliedTheme}
      className={`${fredoka.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700,800&f[]=satoshi@600,700,800,900&display=swap"
        />
      </head>
      <body className="bg-background font-body text-foreground selection:bg-primary/20 selection:text-primary flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
