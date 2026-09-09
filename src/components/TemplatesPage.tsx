// Templates Page - Preview 8 template slide + 6 content categories
import React, { useState } from 'react';
import TemplateRenderer, { PALETTE, type TemplateId } from '../Templates';
import { TEMPLATES, CONTENT_CATEGORIES, SAMPLE_DATA } from './templatesData';

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const renderPreview = (templateId: TemplateId) => {
    const data = SAMPLE_DATA[templateId];
    return (
      <TemplateRenderer
        template={templateId}
        handle="@sahamfyp"
        badgeText="BBCA"
        badgeBgColor={PALETTE.navy}
        badgeTextColor="#FFFFFF"
        textColor={PALETTE.navy}
        accentColor={PALETTE.amber}
        bgColor={PALETTE.cream}
        title={data.title || ''}
        description={data.description || ''}
        source="CNBC Indonesia"
        disclaimer="DYOR"
        visualMode="icon"
        visualIcon="TrendingUp"
        illustrationUrl={null}
        tldrCards={data.tldrCards || []}
        metrics={data.metrics || []}
        bullets={data.bullets || []}
        slideIndex={0}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">📋 Templates</h1>
        <p className="text-sm text-slate-500 mt-1">Preview 8 template slide carousel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`p-4 rounded-xl text-left transition border-2 ${
              selectedTemplate === template.id
                ? 'border-amber-500 bg-amber-50'
                : 'border-transparent bg-white hover:border-amber-200 shadow-sm'
            }`}
          >
            <span className="text-3xl block mb-2">{template.icon}</span>
            <h3 className="font-semibold text-slate-800">{template.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{template.description}</p>
            <p className="text-xs text-slate-400 mt-2 font-mono">{template.layout}</p>
          </button>
        ))}
      </div>

      {selectedTemplate && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">
            Preview: {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
          </h2>
          <p className="text-xs text-slate-500 mb-4 font-mono">
            Layout: {TEMPLATES.find(t => t.id === selectedTemplate)?.layout}
          </p>
          <div className="flex justify-center">
            <div className="transform scale-75 origin-top">
              {renderPreview(selectedTemplate)}
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 pt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-2">📁 6 Content Categories</h2>
        <p className="text-sm text-slate-500 mb-6">Setiap kategori menggunakan 8 template dengan data dari API berbeda</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONTENT_CATEGORIES.map(cat => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`p-5 rounded-xl cursor-pointer transition border-2 ${
                selectedCategory === cat.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-transparent bg-white hover:border-amber-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="font-semibold text-slate-800">{cat.name}</h3>
                  <p className="text-xs text-slate-500">{cat.description}</p>
                </div>
              </div>

              {selectedCategory === cat.id && (
                <div className="mt-4 space-y-3 pt-3 border-t border-slate-200">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">📡 API Source</p>
                    <p className="text-sm text-slate-800">{cat.api}</p>
                    <p className="text-xs text-slate-500 font-mono">{cat.apiEndpoint}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">📝 Prompt Strategy</p>
                    <p className="text-sm text-slate-800">{cat.promptStrategy}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">🎨 Templates Used</p>
                    <div className="flex flex-wrap gap-1">
                      {cat.templates.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}