"use client"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navabar from "@/components/navbar";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { PropsWithChildren } from "react";
import { OKXWallet } from "@okwallet/aptos-wallet-adapter";
const inter = Inter({ subsets: ["latin"] });



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
   const wallets = [
    new OKXWallet(),
  ];
  return (
        <AptosWalletAdapterProvider
   
      
      autoConnect={false}
      onError={(error) => {
    console.log("error", error);
  }}
    >
  

    <html lang="en">
      <body className={inter.className}>
        <Navabar />
        <main>{children}</main>
        <Toaster />
      </body>
      </html>
          </AptosWalletAdapterProvider>
  );
}
