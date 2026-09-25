import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs text-zinc-400 font-medium overflow-x-auto py-1 scrollbar-none ${className}`}
    >
      <Link
        to="/overview"
        className="flex items-center gap-1 hover:text-white transition px-2 py-1 rounded-lg hover:bg-[#1a0e20]"
        title="Dashboard Overview"
      >
        <Home className="w-3.5 h-3.5 text-rose-400" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            {isLast || !item.to ? (
              <span
                className="flex items-center gap-1 text-white font-bold px-2 py-1 rounded-lg bg-[#1c0d22] border border-[#2f1437] truncate max-w-[200px] sm:max-w-xs md:max-w-md shadow-xs"
                title={item.label}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </span>
            ) : (
              <Link
                to={item.to}
                className="flex items-center gap-1 hover:text-white transition px-2 py-1 rounded-lg hover:bg-[#1a0e20] shrink-0"
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
