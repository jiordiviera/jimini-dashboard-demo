import type { Metadata, Viewport } from "next";
import { Inter, Newsreader } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Jimini · Assistant juridique IA (démo non officielle)",
  description:
    "Démo non officielle du tableau de bord Jimini, réalisée par Jiordi Kengne. Non affiliée à Jimini.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fbfbfc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${inter.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="h-full">
        <TooltipProvider delay={300}>{children}</TooltipProvider>
        <Toaster position="bottom-right" richColors={false} />
      </body>
    </html>
  );
}
