import { useState, useRef, useEffect, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Sparkles } from 'lucide-react';
import { getMtmApps } from '../config/mtmApps';

export const MtmAppSwitcher: FC = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isRtl = i18n.dir() === 'rtl';

  const apps = getMtmApps();

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* 9-Dot Grid App Switcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t('ecosystem.switcherAria')}
        aria-expanded={isOpen}
        title={t('ecosystem.title')}
        className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          isOpen
            ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
            : 'text-slate-700 bg-slate-100/90 hover:bg-slate-200/80 hover:text-dark border border-slate-200 shadow-2xs'
        }`}
      >
        <svg
          className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="5" cy="5" r="2.2" />
          <circle cx="12" cy="5" r="2.2" />
          <circle cx="19" cy="5" r="2.2" />
          <circle cx="5" cy="12" r="2.2" />
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="19" cy="12" r="2.2" />
          <circle cx="5" cy="19" r="2.2" />
          <circle cx="12" cy="19" r="2.2" />
          <circle cx="19" cy="19" r="2.2" />
        </svg>
      </button>

      {/* Floating Modern Dropdown Grid */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2.5 z-50 w-80 sm:w-96 p-3 sm:p-4 bg-white/98 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/15 animate-in fade-in slide-in-from-top-2 duration-200 ${
            isRtl ? 'start-0 sm:start-auto sm:end-0' : 'end-0'
          }`}
          style={{ maxWidth: 'calc(100vw - 1.5rem)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 px-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {t('ecosystem.title')}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                  {t('ecosystem.subtitle')}
                </p>
              </div>
            </div>

            <a
              href="https://mtm-innovation.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>MTM</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Apps 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {apps.map((app) => {
              const Icon = app.icon;
              const appName = t(`${app.translationKey}.name`, app.name);
              const appTagline = t(`${app.translationKey}.tagline`);

              if (app.isCurrent) {
                return (
                  <div
                    key={app.id}
                    className="relative flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl border-2 border-primary/30 bg-primary/5 shadow-2xs"
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${app.color.gradient} flex items-center justify-center text-white shadow-sm shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {appName}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary text-white">
                          {t('ecosystem.currentBadge')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {appTagline}
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className={`group relative flex items-start gap-3 p-2.5 sm:p-3 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${app.color.bg} ${app.color.text} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                        {appName}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 group-hover:text-slate-600">
                      {appTagline}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
            <span className="text-[10px] text-slate-400 font-medium">
              Privacy First • 100% Client-Side Ecosystem
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MtmAppSwitcher;
