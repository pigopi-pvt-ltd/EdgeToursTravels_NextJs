import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
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


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-outfit">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <WhatsAppWidget />
          </AuthProvider>

        </ThemeProvider>
      </body>
    </html>
  );
}