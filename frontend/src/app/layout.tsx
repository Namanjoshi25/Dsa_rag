// src/app/layout.tsx
import NavBar from "@/components/Navbar";
import "./globals.css";
import { Outfit } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "My Site",
  description: "…",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} min-h-screen bg-[#0a0a0b] text-zinc-100 font-sans antialiased`}>
        <AuthProvider>
        <NavBar/>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
