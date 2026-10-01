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
      className={`flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-x-auto py-1 scrollbar-none ${className}`}
    >
      <Link
        to="/overview"
        className="flex items-center gap-1 hover:text-slate-900 transition px-2 py-1 rounded-lg hover:bg-slate-200/60 cursor-pointer"
        title="Dashboard Overview"
      >
        <Home className="w-3.5 h-3.5 text-rose-600" />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {isLast || !item.to ? (
              <span
                className="flex items-center gap-1 text-slate-900 font-bold px-2 py-1 rounded-lg bg-white border border-slate-200 truncate max-w-[200px] sm:max-w-xs md:max-w-md shadow-xs"
                title={item.label}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </span>
            ) : (
              <Link
                to={item.to}
                className="flex items-center gap-1 hover:text-slate-900 transition px-2 py-1 rounded-lg hover:bg-slate-200/60 shrink-0 cursor-pointer"
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
