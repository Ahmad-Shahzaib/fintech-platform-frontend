import React from 'react';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      aria-hidden
      className={[
        'bg-gray-200/60 rounded animate-pulse',
        // allow callers to override sizing/spacing
        className,
      ].join(' ')}
      {...props}
    />
  );
};

export default Skeleton;
