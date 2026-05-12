import type {Metadata} from "next";
import {Outfit} from "next/font/google";
import "./globals.css";
import {ModalProvider} from "@/src/context/ModalContext";
import React from "react";

const outfit = Outfit({
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "DiversiHire", description: "AI-powered CV builder",
};

export default function RootLayout({children}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
    <ModalProvider>
        <body className={outfit.className}>{children}</body>
    </ModalProvider>
    </html>);
}