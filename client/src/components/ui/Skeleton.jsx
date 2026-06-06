import React from 'react';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-light-border dark:bg-dark-border/50 ${className}`}
      {...props}
    />
  );
};
