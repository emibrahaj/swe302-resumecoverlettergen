import type {Metadata} from "next";
import {Outfit} from "next/font/google";
import "./globals.css";
import {ModalProvider} from "@/src/context/ModalContext";
import {SubscriptionProvider} from "@/src/context/SubscriptionContext";
import {Toaster} from "@/src/components/ui/sonner";
import {CookieConsentGate} from "@/src/components/figma/CookieConsentGate";
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
            <body className={outfit.className}>
                <ModalProvider>
                    <SubscriptionProvider>
                        {children}
                        <CookieConsentGate />
                        <Toaster position="bottom-right" richColors closeButton />
                    </SubscriptionProvider>
                </ModalProvider>
            </body>
        </html>
    );
}