import { useState, type FC, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Link } from 'react-router-dom';
import { changeLanguage } from '../i18n';
import {
  Globe,
  Sparkles,
  ShieldCheck,
  Sliders,
  Maximize2,
  RefreshCw,
  Crop as CropIcon,
  RotateCw,
  FileText,
  Stamp,
  Combine,
  Scissors,
  Trash2,
  FileImage,
  LayoutGrid,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export const Navbar: FC = () => {
  const { i18n, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Normalize current language to 2 characters (fr, en, ar, zh)
  const currentLang = i18n.language?.toLowerCase().split('-')[0].split('_')[0] || 'fr';

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    changeLanguage(selectedLang);
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group focus:outline-none" onClick={closeMobile}>
              {/* Logo Icon with MTM Primary & Secondary Gradient */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center text-white shadow-md shadow-primary/25 transition-transform duration-200 group-hover:scale-105">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-primary font-sans">
                    Image<span className="text-secondary">Tools</span>
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 tracking-wide">
                  by <strong className="text-slate-700 font-semibold">{t('byMTM')}</strong>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation (Clean Dropdowns - Never horizontal scroll!) */}
          <nav className="hidden lg:flex items-center gap-2">
            
            {/* All Tools (Home) Link */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/20'
                    : 'text-slate-700 hover:text-dark hover:bg-slate-100'
                }`
              }
            >
              <LayoutGrid className="w-4 h-4" />
              <span>{t('nav.tools')}</span>
            </NavLink>

            {/* 1. Image Tools Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-dark hover:bg-slate-100 transition-all cursor-pointer group-hover:bg-slate-100"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>{t('nav.imageSection')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* Floating Dropdown Panel */}
              <div className="absolute top-full start-0 mt-1 w-64 p-2 bg-white rounded-2xl border border-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {t('nav.imageSection')}
                </div>
                <NavLink
                  to="/compress"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <Sliders className="w-4 h-4 text-primary" />
                  <span>{t('nav.compress')}</span>
                </NavLink>

                <NavLink
                  to="/resize"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-secondary/10 text-secondary' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <Maximize2 className="w-4 h-4 text-secondary" />
                  <span>{t('nav.resize')}</span>
                </NavLink>

                <NavLink
                  to="/convert"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <RefreshCw className="w-4 h-4 text-primary" />
                  <span>{t('nav.convert')}</span>
                </NavLink>

                <NavLink
                  to="/crop"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-secondary/10 text-secondary' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <CropIcon className="w-4 h-4 text-secondary" />
                  <span>{t('nav.crop')}</span>
                </NavLink>

                <NavLink
                  to="/rotate-flip"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <RotateCw className="w-4 h-4 text-primary" />
                  <span>{t('nav.rotateFlip')}</span>
                </NavLink>

                <NavLink
                  to="/watermark"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <Stamp className="w-4 h-4 text-primary" />
                  <span>{t('nav.watermark')}</span>
                </NavLink>
              </div>
            </div>

            {/* 2. PDF Tools Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-dark hover:bg-slate-100 transition-all cursor-pointer group-hover:bg-slate-100"
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{t('nav.pdfSection')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
              </button>

              {/* Floating Dropdown Panel */}
              <div className="absolute top-full start-0 mt-1 w-64 p-2 bg-white rounded-2xl border border-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700">
                  {t('nav.pdfSection')}
                </div>
                <NavLink
                  to="/merge-pdf"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <Combine className="w-4 h-4 text-amber-600" />
                  <span>{t('nav.mergePdf')}</span>
                </NavLink>

                <NavLink
                  to="/split-pdf"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <Scissors className="w-4 h-4 text-amber-600" />
                  <span>{t('nav.splitPdf')}</span>
                </NavLink>

                <NavLink
                  to="/rotate-pdf"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <RotateCw className="w-4 h-4 text-amber-600" />
                  <span>{t('nav.rotatePdf')}</span>
                </NavLink>

                <NavLink
                  to="/delete-pdf-pages"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <Trash2 className="w-4 h-4 text-amber-600" />
                  <span>{t('nav.deletePdfPages')}</span>
                </NavLink>

                <NavLink
                  to="/pdf-to-jpg"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <FileImage className="w-4 h-4 text-amber-600" />
                  <span>{t('nav.pdfToJpg')}</span>
                </NavLink>

                <NavLink
                  to="/image-to-pdf"
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-amber-100 text-amber-900' : 'text-slate-700 hover:bg-slate-100 hover:text-dark'
                    }`
                  }
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>{t('nav.imageToPdf')}</span>
                </NavLink>
              </div>
            </div>

          </nav>

          {/* Right Section: Trust badge, Language Selector & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Trust badge */}
            <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-semibold text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t('footer.localBadge')}</span>
            </div>

            {/* Language Selector (<select> with AR, EN, FR, ZH) */}
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-primary">
                <Globe className="w-4 h-4" />
              </div>
              <select
                id="language-select"
                aria-label="Sélection de la langue"
                value={['fr', 'en', 'ar', 'zh'].includes(currentLang) ? currentLang : 'fr'}
                onChange={handleLanguageChange}
                className="block w-full appearance-none rounded-xl border border-slate-200 bg-slate-100/90 py-2 ps-9 pe-8 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-200/70 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer shadow-2xs"
              >
                <option value="fr">🇫🇷 FR</option>
                <option value="en">🇬🇧 EN</option>
                <option value="ar">🇸🇦 AR</option>
                <option value="zh">🇨🇳 ZH</option>
              </select>
              <div className="absolute inset-y-0 end-0 flex items-center pe-2.5 pointer-events-none text-slate-500">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Clean Collapsible Mobile Menu (NO horizontal scrollbar!) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[80vh] overflow-y-auto">
          {/* Home / All Tools */}
          <NavLink
            to="/"
            end
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${
                isActive ? 'bg-primary text-white' : 'text-slate-800 bg-slate-50'
              }`
            }
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{t('nav.tools')} (Accueil)</span>
          </NavLink>

          {/* Image Tools Group */}
          <div>
            <div className="px-2 py-1 text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('nav.imageSection')}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <NavLink to="/compress" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                <span>{t('nav.compress')}</span>
              </NavLink>
              <NavLink to="/resize" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <Maximize2 className="w-3.5 h-3.5 text-secondary" />
                <span>{t('nav.resize')}</span>
              </NavLink>
              <NavLink to="/convert" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>{t('nav.convert')}</span>
              </NavLink>
              <NavLink to="/crop" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <CropIcon className="w-3.5 h-3.5 text-secondary" />
                <span>{t('nav.crop')}</span>
              </NavLink>
              <NavLink to="/rotate-flip" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 text-primary" />
                <span>{t('nav.rotateFlip')}</span>
              </NavLink>
              <NavLink to="/watermark" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <Stamp className="w-3.5 h-3.5 text-primary" />
                <span>{t('nav.watermark')}</span>
              </NavLink>
            </div>
          </div>

          {/* PDF Tools Group */}
          <div>
            <div className="px-2 py-1 text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>{t('nav.pdfSection')}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <NavLink to="/merge-pdf" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <Combine className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('nav.mergePdf')}</span>
              </NavLink>
              <NavLink to="/split-pdf" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <Scissors className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('nav.splitPdf')}</span>
              </NavLink>
              <NavLink to="/rotate-pdf" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('nav.rotatePdf')}</span>
              </NavLink>
              <NavLink to="/delete-pdf-pages" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('nav.deletePdfPages')}</span>
              </NavLink>
              <NavLink to="/pdf-to-jpg" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <FileImage className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('nav.pdfToJpg')}</span>
              </NavLink>
              <NavLink to="/image-to-pdf" onClick={closeMobile} className="p-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('nav.imageToPdf')}</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
