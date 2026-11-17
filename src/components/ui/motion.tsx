'use client';

import * as React from 'react';
import { motion, useInView, useMotionValue, animate, useReducedMotion } from 'framer-motion';

// Refined easing: smoother than default spring, less bouncy
export const easeOutQuart = [0.22, 1, 0.36, 1] as const;
export const easeInOutQuart = [0.76, 0, 0.24, 1] as const;

interface FadeInProps extends Omit<React.ComponentProps<typeof motion.div>, 'children'> {
  children?: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
}

export function FadeIn({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.5,
  className,
  ...props
}: FadeInProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const directions = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
    none: {},
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directions[direction] }}
      transition={{
        duration,
        delay,
        ease: easeOutQuart,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps extends Omit<React.ComponentProps<typeof motion.div>, 'children'> {
  children?: React.ReactNode;
  delayChildren?: number;
  staggerChildren?: number;
}

export function StaggerContainer({
  children,
  delayChildren = 0,
  staggerChildren = 0.08,
  className,
  ...props
}: StaggerContainerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps extends Omit<React.ComponentProps<typeof motion.div>, 'children'> {
  children?: React.ReactNode;
  direction?: 'up' | 'down' | 'none';
}

export function StaggerItem({
  children,
  direction = 'up',
  className,
  ...props
}: StaggerItemProps) {
  const directions = {
    up: { y: 16 },
    down: { y: -16 },
    none: {},
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...directions[direction] },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: easeOutQuart,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface RevealProps extends Omit<React.ComponentProps<typeof motion.div>, 'children'> {
  children?: React.ReactNode;
  delay?: number;
  duration?: number;
}

export function Reveal({
  children,
  delay = 0,
  duration = 0.6,
  className,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
      transition={{
        duration,
        delay,
        ease: easeOutQuart,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps extends Omit<React.ComponentProps<typeof motion.div>, 'children'> {
  children?: React.ReactNode;
  from?: 'left' | 'right';
  delay?: number;
  duration?: number;
}

export function SlideIn({
  children,
  from = 'left',
  delay = 0,
  duration = 0.6,
  className,
  ...props
}: SlideInProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const xOffset = from === 'left' ? -40 : 40;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: xOffset }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: xOffset }}
      transition={{
        duration,
        delay,
        ease: easeOutQuart,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  delay?: number;
}

const formatCountValue = (num: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(num));

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  className,
  duration = 0.8,
  delay = 0.1,
}: AnimatedNumberProps) {
  const count = useMotionValue(0);
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = React.useState(`${prefix}0${suffix}`);

  React.useEffect(() => {
    // Reduced motion runs the same animation at zero duration instead of calling
    // setState straight from the effect body, so state only ever moves inside the
    // animation callbacks.
    let controls: ReturnType<typeof animate> | undefined;

    const start = () => {
      controls = animate(count, value, {
        duration: shouldReduceMotion ? 0 : duration,
        ease: easeOutQuart,
        onUpdate: (latest) => {
          setDisplayValue(`${prefix}${formatCountValue(latest)}${suffix}`);
        },
        onComplete: () => {
          setDisplayValue(`${prefix}${formatCountValue(value)}${suffix}`);
        },
      });
    };

    const timer = setTimeout(start, shouldReduceMotion ? 0 : delay * 1000);

    // The previous version returned controls.stop() from inside setTimeout, where
    // React never saw it, so the animation kept running after unmount.
    return () => {
      clearTimeout(timer);
      controls?.stop();
    };
  }, [value, prefix, suffix, duration, delay, shouldReduceMotion, count]);

  return <span className={className}>{displayValue}</span>;
}
