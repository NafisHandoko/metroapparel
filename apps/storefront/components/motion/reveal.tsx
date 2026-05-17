"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/hooks/use-mobile";

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  amount?: number | "some" | "all";
};

export function Reveal({
  className,
  delay = 0,
  once = true,
  amount = 0.2,
  children,
  ...props
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduce = prefersReducedMotion || isMobile;

  if (reduce) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-72px 0px", amount }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type RevealStaggerProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
  className?: string;
  once?: boolean;
  stagger?: number;
  delayChildren?: number;
};

export function RevealStagger({
  className,
  once = true,
  stagger = 0.09,
  delayChildren = 0.05,
  children,
  ...props
}: RevealStaggerProps) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduce = prefersReducedMotion || isMobile;

  if (reduce) {
    return <div className={cn(className)}>{children}</div>;
  }

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-64px 0px", amount: 0.15 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type RevealItemProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
  className?: string;
};

export function RevealItem({ className, children, ...props }: RevealItemProps) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduce = prefersReducedMotion || isMobile;

  if (reduce) {
    return <div className={cn(className)}>{children}</div>;
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut },
    },
  };

  return (
    <motion.div className={cn(className)} variants={item} {...props}>
      {children}
    </motion.div>
  );
}
