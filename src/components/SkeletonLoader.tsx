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

  return (
    <div
      className={[className, 'bmscms:flex bmscms:flex-col bmscms:gap-2']
        .filter(Boolean)
        .join(' ')}
    >
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className="bmscms:block bmscms:bg-slate-200 bmscms:rounded bmscms:animate-pulse"
          style={{ height: lineHeight, width: getLineWidth(index), ...style }}
        />
      ))}
    </div>
  );
}

export default SkeletonLoader;
