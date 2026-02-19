/**
 * Card Component
 */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  className = '',
  onClick,
}: CardProps) {
  return (
    <div
      role={onClick != null ? 'button' : undefined}
      tabIndex={onClick != null ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick != null
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${onClick != null ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
