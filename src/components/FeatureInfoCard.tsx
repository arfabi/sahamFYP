import React, { useState, useEffect } from 'react';
import { Info, ChevronDown, ChevronUp, ExternalLink, Database, Workflow, Sparkles } from 'lucide-react';

export interface FeatureInfoLink {
  label: string;
  url: string;
}

export interface FeatureInfoCardProps {
  id: string; // Unique identifier for localStorage state persistence
  title: string;
  badge?: string;
  icon?: React.ReactNode;
  description: string;
  functionality?: string;
  dataSource?: string;
  pipeline?: string;
  links?: FeatureInfoLink[];
  defaultExpanded?: boolean;
}

export default function FeatureInfoCard({
  id,
  title,
  badge,
  icon,
  description,
  functionality,
  dataSource,
  pipeline,
  links = [],
  defaultExpanded = true,
}: FeatureInfoCardProps) {
  const storageKey = `saham_info_panel_${id}`;
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        return saved === 'true';
      }
    } catch {
      // fallback
    }
    return defaultExpanded;
  });

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Header bar (always visible, clickable to toggle) */}
      <div
        onClick={toggleExpand}
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500/10 to-orange-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            {icon || <Info className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
              {badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                  {badge}
                </span>
              )}
            </div>
            {!isExpanded && (
              <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xl">
                {description}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          aria-label={isExpanded ? 'Tutup panduan fitur' : 'Buka panduan fitur'}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 px-3 py-1.5 rounded-xl transition shrink-0 ml-3"
        >
          <span>{isExpanded ? 'Tutup Info' : 'Pelajari Fitur'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-4">
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 🎯 Fungsi */}
            {functionality && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>Fungsi Utama</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {functionality}
                </p>
              </div>
            )}

            {/* 📡 Asal Data */}
            {dataSource && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
                  <Database className="w-3.5 h-3.5 text-sky-600" />
                  <span>Asal Data</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {dataSource}
                </p>
              </div>
            )}

            {/* 🔄 Pipeline / Alur */}
            {pipeline && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700">
                  <Workflow className="w-3.5 h-3.5 text-purple-600" />
                  <span>Alur Otomasi / Integrasi</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pipeline}
                </p>
              </div>
            )}
          </div>

          {/* Links / External references */}
          {links.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-xs font-medium text-slate-500">Referensi & Layanan:</span>
              {links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-2.5 py-1 rounded-lg border border-rose-200 transition"
                >
                  <span>{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-rose-600" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
