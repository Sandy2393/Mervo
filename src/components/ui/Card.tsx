import React from "react";
import clsx from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", header, footer, ...props }) => {
  return (
    <div className={clsx("bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] shadow-soft", className)} {...props}>
      {header && <div className="px-4 py-3 border-b border-[var(--color-border)]">{header}</div>}
      <div className="px-4 py-4">{children}</div>
      {footer && <div className="px-4 py-3 border-t border-[var(--color-border)]">{footer}</div>}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
  <div className={clsx("border-b pb-4 mb-4", className)} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
  <div className={clsx("border-t pt-4 mt-4 flex gap-2", className)} {...props}>
    {children}
  </div>
);

export default Card;
