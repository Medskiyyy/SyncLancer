'use client';

import * as React from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';

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
  duration = 0.35,
  className,
  ...props
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const directions = {
    up: { y: 12 },
    down: { y: -12 },
    left: { x: 12 },
    right: { x: -12 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // easeOutQuart
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
  staggerChildren = 0.05,
  className,
  ...props
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
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
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const directions = {
    up: { y: 12 },
    down: { y: -12 },
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
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
          }
        },
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
  const [displayValue, setDisplayValue] = React.useState(`${prefix}${shouldReduceMotion ? value.toLocaleString() : '0'}${suffix}`);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(num));
  };

  React.useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(`${prefix}${value.toLocaleString()}${suffix}`);
      return;
    }

    const timer = setTimeout(() => {
      const controls = animate(count, value, {
        duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          setDisplayValue(`${prefix}${formatNumber(latest)}${suffix}`);
        },
      });
      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, prefix, suffix, duration, delay, shouldReduceMotion, count]);

  return <span className={className}>{displayValue}</span>;
}
