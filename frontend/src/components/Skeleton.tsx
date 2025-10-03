import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
  rounded = 'rounded',
}) => {
  return (
    <div
      className={`bg-gray-200 animate-pulse ${width} ${height} ${rounded} ${className}`}
    />
  );
};

export default Skeleton;
