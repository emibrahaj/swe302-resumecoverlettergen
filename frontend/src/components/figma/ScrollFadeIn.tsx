"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

interface ScrollFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  once?: boolean;
}

interface ScrollFadeInGroupProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

interface ScrollFadeInItemProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
}

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

function getHiddenPosition(direction: RevealDirection, distance: number) {
  switch (direction) {
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "none":
      return {};
    case "up":
    default:
      return { y: distance };
  }
}

export function ScrollFadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 34,
  duration = 0.8,
  once = true,
}: ScrollFadeInProps) {
  const shouldReduceMotion = useReducedMotion();
  const hiddenPosition = getHiddenPosition(direction, distance);

  return (
    <motion.div
      className={className}
      initial={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 0, ...hiddenPosition, filter: "blur(8px)" }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once,
        amount: 0.2,
        margin: "0px 0px -12% 0px",
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: easeOutExpo,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollFadeInGroup({
  children,
  className,
  delay = 0,
  staggerDelay = 0.1,
  once = true,
}: ScrollFadeInGroupProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once,
        amount: 0.18,
        margin: "0px 0px -10% 0px",
      }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: shouldReduceMotion ? 0 : delay,
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollFadeInItem({
  children,
  className,
  direction = "up",
  distance = 24,
  duration = 0.68,
}: ScrollFadeInItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const hiddenPosition = getHiddenPosition(direction, distance);

  return (
    <motion.div
      className={className}
      variants={{
        hidden: shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 0, ...hiddenPosition, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: shouldReduceMotion ? 0 : duration,
            ease: easeOutExpo,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
