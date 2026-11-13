import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Footer: FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-white border-t border-slate-200 mt-auto pt-10 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-slate-100">
          
          {/* Col 1: Brand & Privacy Guarantee (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#438fe9] to-[#655ce8] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                IT
              </div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Image<span className="text-[#438fe9]">Tools</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              {t('footer.brandDesc')}
            </p>

            {/* Privacy Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{t('footer.localBadge')}</span>
            </div>
          </div>

          {/* Col 2: Popular Tools (3 cols) */}
          <div className="lg:col-span-3 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('footer.sections.popularTools')}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/compress"
                  className="text-slate-500 hover:text-indigo-600 transition-colors inline-block"
                >
                  {t('footer.links.compress')}
                </Link>
              </li>
              <li>
                <Link
                  to="/merge-pdf"
                  className="text-slate-500 hover:text-indigo-600 transition-colors inline-block"
                >
                  {t('footer.links.mergePdf')}
                </Link>
              </li>
              <li>
                <Link
                  to="/pdf-to-jpg"
                  className="text-slate-500 hover:text-indigo-600 transition-colors inline-block"
                >
                  {t('footer.links.pdfToJpg')}
                </Link>
              </li>
              <li>
                <Link
                  to="/resize"
                  className="text-slate-500 hover:text-indigo-600 transition-colors inline-block"
                >
                  {t('footer.links.resize')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company (2 cols) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('footer.sections.company')}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-slate-500 hover:text-indigo-600 transition-colors inline-block"
                >
                  {t('footer.links.about')}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-500 hover:text-indigo-600 transition-colors inline-block"
                >
                  {t('footer.links.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Privacy (2 cols) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t('footer.sections.legal')}
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-500 hover:text-indigo-600 transition-colors inline-block font-medium"
                >
                  {t('footer.links.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-slate-500 hover:text-indigo-600 transition-colors inline-block"
                >
                  {t('footer.links.terms')}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span>{t('footer.copyright')}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              Fait avec passion par <strong className="text-slate-700">MTM Innovation</strong>
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
