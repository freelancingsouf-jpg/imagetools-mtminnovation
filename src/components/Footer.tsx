import { useState, type FC } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Share2,
  Copy,
  Check,
  MessageCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getOtherMtmApps } from '../config/mtmApps';

export const Footer: FC = () => {
  const { t } = useTranslation();
  const otherApps = getOtherMtmApps();
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyLink = async () => {
    try {
      const shareUrl =
        typeof window !== 'undefined'
          ? window.location.origin
          : 'https://imagetools-mtminnovation.pages.dev';
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    'ImageTools — أدوات مجانية لضغط الصور وتغيير أبعادها وتحويل صيغها (JPG, PNG, WebP) بسرعة وأمان 100% داخل المتصفح:\nhttps://imagetools-mtminnovation.pages.dev/'
  )}`;

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

        {/* Minimal Unified Ecosystem Section (Other 3 Apps) */}
        <div className="py-6 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {t('ecosystem.moreApps')}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 lg:max-w-3xl">
              {otherApps.map((app) => {
                const Icon = app.icon;
                const appName = t(`${app.translationKey}.name`, app.name);
                const appTagline = t(`${app.translationKey}.tagline`);

                return (
                  <a
                    key={app.id}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg ${app.color.bg} ${app.color.text} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors block truncate">
                          {appName}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {appTagline}
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-primary transition-colors ms-1 shrink-0 opacity-60 group-hover:opacity-100" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subtle Tool Share & Social Action Bar */}
        <div className="py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Share2 className="w-4 h-4 text-primary" />
            <span className="font-bold">{t('footer.shareTool')}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition font-medium cursor-pointer shadow-2xs text-xs"
              title={t('footer.copyLink')}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">{t('footer.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('footer.copyLink')}</span>
                </>
              )}
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200/90 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 transition font-medium shadow-2xs text-xs"
              title="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('footer.shareWhatsapp')}</span>
            </a>
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
