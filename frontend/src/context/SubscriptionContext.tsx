"use client";
import { createContext, useContext, useState, ReactNode } from 'react';

export type Plan = 'free' | 'pro';

interface SubscriptionContextValue {
  plan: Plan;
  setPlan: (plan: Plan) => void;
  isPro: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue>({
  plan: 'free',
  setPlan: () => {},
  isPro: false,
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan>('free');
  return (
    <SubscriptionContext.Provider value={{ plan, setPlan, isPro: plan === 'pro' }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}