import type { Metadata } from "next";
import { Outfit, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Edge Tours and Travels",
  description: "The world's most refined booking engine for global elites.",
  icons: {
    icon: "/vercel.png",
  },
};

import { ThemeProvider } from "@/context/ThemeContext";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import QueryProvider from "@/providers/QueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sf">
        <QueryProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <WhatsAppWidget />
            </AuthProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}