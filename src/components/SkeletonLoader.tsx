import { type CSSProperties } from 'react';
import type { SkeletonLoaderProps } from '../types/SkeletonLoaderTypes';

/**
 * A skeleton loader component that provides visual placeholders during loading states.
 * Offers better UX than generic "Loading..." text.
 */
export function SkeletonLoader({
  className = '',
  lines = 1,
  lineHeight = '1.2em',
  width = '100%',
  style,
}: SkeletonLoaderProps) {
  const getLineWidth = (index: number): string => {
    if (Array.isArray(width)) {
      return width[index % width.length] || '100%';
    }
    return width;
  };

  const skeletonStyles: CSSProperties = {
    display: 'block',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    animation: 'skeletonPulse 1.5s ease-in-out infinite',
    ...style,
  };

  const containerStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  return (
    <>
      <div className={className} style={containerStyles}>
        {Array.from({ length: lines }, (_, index) => {
          return (
            <div
              key={index}
              style={{
                ...skeletonStyles,
                height: lineHeight,
                width: getLineWidth(index),
              }}
            />
          );
        })}
      </div>
    </>
  );
}

export default SkeletonLoader;
