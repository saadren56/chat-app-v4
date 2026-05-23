import { forwardRef } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, header, footer, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('glass rounded-2xl border border-white/10 overflow-hidden', className)}
        {...props}
      >
        {header && <div className="px-6 py-4 border-b border-white/10">{header}</div>}
        <div className="p-6">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-white/10">{footer}</div>}
      </div>
    );
  }
);

Card.displayName = 'Card';
