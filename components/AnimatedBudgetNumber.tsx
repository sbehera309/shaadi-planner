'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedBudgetNumberProps {
  value: number;
  currency?: string;
  className?: string;
  showSign?: boolean;
  compact?: boolean;
  animateOnChange?: boolean;
  highlightDirection?: 'standard' | 'reverse' | 'none'; // 'standard': up=green/down=red, 'reverse': up=red/down=green
}

export const AnimatedBudgetNumber: React.FC<AnimatedBudgetNumberProps> = ({
  value,
  currency = '$',
  className = '',
  showSign = false,
  compact = false,
  animateOnChange = true,
  highlightDirection = 'standard',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const [trend, setTrend] = useState<'up' | 'down' | 'none'>('none');
  const prevValueRef = useRef<number>(value);
  const frameRef = useRef<number | null>(null);
  const trendTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const prev = prevValueRef.current;
    if (prev === value || !animateOnChange) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const direction: 'up' | 'down' = value > prev ? 'up' : 'down';
    setTrend(direction);

    if (trendTimeoutRef.current) {
      clearTimeout(trendTimeoutRef.current);
    }
    trendTimeoutRef.current = setTimeout(() => {
      setTrend('none');
    }, 800);

    const startTime = performance.now();
    const duration = 550; // ms

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(prev + (value - prev) * ease);

      setDisplayValue(nextVal);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
        prevValueRef.current = value;
      }
    };

    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (trendTimeoutRef.current) clearTimeout(trendTimeoutRef.current);
    };
  }, [value, animateOnChange]);

  // Format number
  const formatNumber = (num: number) => {
    const isNegative = num < 0;
    const abs = Math.abs(num);

    let formatted = '';
    if (compact) {
      if (abs >= 1_000_000) {
        formatted = `${(abs / 1_000_000).toFixed(1)}M`;
      } else if (abs >= 1_000) {
        formatted = `${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`;
      } else {
        formatted = abs.toLocaleString();
      }
    } else {
      formatted = abs.toLocaleString();
    }

    const sign = isNegative ? '-' : showSign && num > 0 ? '+' : '';
    return `${sign}${currency}${formatted}`;
  };

  const getHighlightClass = () => {
    if (highlightDirection === 'none' || trend === 'none') return '';

    if (highlightDirection === 'standard') {
      return trend === 'up'
        ? 'animate-pulse-up text-emerald-600 font-bold'
        : 'animate-pulse-down text-rose-600 font-bold';
    } else {
      // reverse (e.g. costs going up is red, going down is green)
      return trend === 'up'
        ? 'animate-pulse-down text-rose-600 font-bold'
        : 'animate-pulse-up text-emerald-600 font-bold';
    }
  };

  return (
    <span
      className={`inline-block transition-transform duration-200 tabular-nums ${getHighlightClass()} ${className}`}
    >
      {formatNumber(displayValue)}
    </span>
  );
};
