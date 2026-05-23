import React from 'react';
import { cn } from '../../utils/helpers';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'rounded' | 'circular';
  animate?: boolean;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  animate = true,
  ...props
}: SkeletonProps) {
  const variants = {
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
    circular: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'bg-gray-700/50',
        variants[variant],
        animate && 'animate-pulse',
        className
      )}
      {...props}
    />
  );
}
