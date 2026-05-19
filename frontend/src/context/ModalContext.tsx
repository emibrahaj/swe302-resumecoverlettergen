"use client";
import React, { createContext, useContext, useRef, useState } from 'react';
import { AuthModal } from '@/src/components/figma/AuthModal';
import { useRouter } from 'next/navigation';

interface OpenOptions {
  onComplete?: () => void;
}

interface ModalContextType {
  openLogin: (options?: OpenOptions) => void;
  openSignup: (options?: OpenOptions) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();
  const onCompleteRef = useRef<(() => void) | undefined>(undefined);

  const openLogin = (options?: OpenOptions) => {
    onCompleteRef.current = options?.onComplete;
    setMode('login');
    setIsOpen(true);
  };
  const openSignup = (options?: OpenOptions) => {
    onCompleteRef.current = options?.onComplete;
    setMode('signup');
    setIsOpen(true);
  };

  const handleComplete = () => {
    if (onCompleteRef.current) {
      onCompleteRef.current();
    } else {
      router.push("/user/dashboard");
    }
  };

  return (
    <ModalContext.Provider value={{ openLogin, openSignup }}>
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialMode={mode}
        onComplete={handleComplete}
      />
    </ModalContext.Provider>
  );
}

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModals must be used within ModalProvider");
  return context;
};