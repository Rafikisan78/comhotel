'use client';

interface SkeletonProps {
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'custom';
  width?: string;
  height?: string;
  className?: string;
  count?: number;
}

/**
 * Composant Skeleton - Feedback visuel (Calm Tech)
 * Indique le chargement de manière non-intrusive
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
}: SkeletonProps) {
  const variantClass =
    variant === 'text'
      ? 'skeleton-text'
      : variant === 'title'
        ? 'skeleton-title'
        : variant === 'avatar'
          ? 'skeleton-avatar'
          : variant === 'card'
            ? 'skeleton-card'
            : '';

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div aria-busy="true" aria-live="polite" className="animate-fade-in">
      <span className="sr-only">Chargement en cours...</span>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`skeleton ${variantClass} ${className}`}
          style={style}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton pour une carte d'hôtel
 */
export function HotelCardSkeleton() {
  return (
    <div className="card">
      <Skeleton variant="custom" height="200px" className="w-full" />
      <div className="card-body">
        <Skeleton variant="title" />
        <Skeleton variant="text" count={2} />
        <div className="flex justify-between mt-4">
          <Skeleton variant="custom" width="80px" height="24px" />
          <Skeleton variant="custom" width="100px" height="40px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour un formulaire
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index}>
          <Skeleton variant="custom" width="100px" height="16px" className="mb-2" />
          <Skeleton variant="custom" height="44px" className="w-full" />
        </div>
      ))}
      <Skeleton variant="custom" width="120px" height="44px" className="mt-6" />
    </div>
  );
}

export default Skeleton;
