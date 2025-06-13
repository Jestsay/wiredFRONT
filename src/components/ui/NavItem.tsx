import React from 'react';
import { cn } from '../../utils/cn';
import { navItemVariants, type NavItemVariants } from './layout-variants';

interface NavItemProps extends NavItemVariants {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export function NavItem({ href, children, isActive, className }: NavItemProps) {
  return (
    <a 
      href={href}
      className={cn(
        navItemVariants({ state: isActive ? "active" : "default" }),
        className
      )}
    >
      {children}
    </a>
  );
}