// src/app/layout.tsx
import NavBar from "@/components/Navbar";
import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300","400","500","600","700"], // pick what you need
  variable: "--font-poppins",              // expose as CSS variable
  display: "swap",
});

export const metadata = {
  title: "My Site",
  description: "…",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${poppins.variable} bg-black text-gray-100`}>
        <AuthProvider>
        <NavBar/>
        {children}
        </AuthProvider>
      </body>
    </html>
  );
}
