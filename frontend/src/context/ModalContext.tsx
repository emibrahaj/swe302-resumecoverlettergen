"use client";
import React, { createContext, useContext, useState } from 'react';
import { AuthModal } from '@/src/components/figma/AuthModal';
import { useRouter } from 'next/navigation';

interface ModalContextType {
  openLogin: () => void;
  openSignup: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();

  const openLogin = () => { setMode('login'); setIsOpen(true); };
  const openSignup = () => { setMode('signup'); setIsOpen(true); };

  return (
    <ModalContext.Provider value={{ openLogin, openSignup }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialMode={mode}
        onComplete={() => router.push("/user/dashboard")}
      />
    </ModalContext.Provider>
  );
}

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModals must be used within ModalProvider");
  return context;
};