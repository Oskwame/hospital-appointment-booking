import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { AuthProvider } from "@/lib/auth-context";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Appointment Booking",
  description: "Hospital appointment booking system",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <AuthProvider>
          <main className="min-h-screen w-full">
            <div className="min-h-full w-full">{children}</div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
