import { useState, type FC, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Building2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xzeewnzg';

export const Contact: FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    // Validation
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedMessage = formData.message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setErrorMessage(t('pages.contact.valRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage(t('pages.contact.valEmail'));
      return;
    }

    setIsSubmitting(true);

    const subjectLabelKey =
      formData.subject === 'general'
        ? 'pages.contact.subjectGeneral'
        : formData.subject === 'suggestion'
        ? 'pages.contact.subjectSuggestion'
        : formData.subject === 'bug'
        ? 'pages.contact.subjectBug'
        : formData.subject === 'privacy'
        ? 'pages.contact.subjectPrivacy'
        : formData.subject === 'partnership'
        ? 'pages.contact.subjectPartnership'
        : 'pages.contact.subjectGeneral';

    const subjectDisplay = t(subjectLabelKey);

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      subject: `[ImageTools] ${subjectDisplay}`,
      message: trimmedMessage,
      _source: 'ImageTools (MTM Innovation)',
      _submitted_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsSuccess(true);
        setErrorMessage(null);
        setFormData({
          name: '',
          email: '',
          subject: 'general',
          message: '',
        });
      } else {
        const data = await response.json().catch(() => null);
        const errDetail =
          data?.errors && Array.isArray(data.errors)
            ? data.errors.map((err: { message?: string }) => err.message || '').filter(Boolean).join(', ')
            : '';
        const baseMsg = t('pages.contact.errorGeneric');
        setErrorMessage(errDetail ? `${baseMsg} (${errDetail})` : baseMsg);
      }
    } catch {
      setErrorMessage(t('pages.contact.errorGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEO pageKey="contact" canonicalPath="/contact" />
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('home.allTools')}</span>
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-semibold">{t('pages.contact.title')}</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl mb-12">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-sm">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>{t('pages.contact.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t('pages.contact.title')}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
            {t('pages.contact.subtitle')}
          </p>
        </div>

        {/* Glow */}
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Two Column Layout: Contact Form + Direct Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <span>{t('pages.contact.formHeading')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            {t('pages.contact.formSubtitle')}
          </p>

          {isSuccess ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-1">
                {t('pages.contact.successTitle')}
              </h3>
              <p className="text-sm text-emerald-700 mb-5">
                {t('pages.contact.successDesc')}
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                {t('pages.contact.sendAnother')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center gap-2.5 text-xs sm:text-sm text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('pages.contact.nameLabel')}
                </label>
                <input
                  type="text"
                  placeholder={t('pages.contact.namePlaceholder')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('pages.contact.emailLabel')}
                </label>
                <input
                  type="email"
                  placeholder={t('pages.contact.emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('pages.contact.subjectLabel')}
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 bg-white transition-colors disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="general">{t('pages.contact.subjectGeneral')}</option>
                  <option value="suggestion">{t('pages.contact.subjectSuggestion')}</option>
                  <option value="bug">{t('pages.contact.subjectBug')}</option>
                  <option value="privacy">{t('pages.contact.subjectPrivacy')}</option>
                  <option value="partnership">{t('pages.contact.subjectPartnership')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t('pages.contact.messageLabel')}
                </label>
                <textarea
                  rows={4}
                  placeholder={t('pages.contact.messagePlaceholder')}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors resize-y disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('pages.contact.sendingBtn')}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t('pages.contact.submitBtn')}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Info & Guidelines (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Email Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-6 sm:p-7 border border-indigo-100 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-md shadow-indigo-600/20">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t('pages.contact.directEmailTitle')}</h3>
            <p className="text-xs text-slate-600 mb-4">
              {t('pages.contact.directEmailDesc')}
            </p>
            <a
              href="mailto:contact@mtminnovation.com"
              className="inline-flex items-center gap-2 font-mono text-sm font-bold text-indigo-700 bg-white px-4 py-2.5 rounded-xl border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all shadow-sm"
            >
              <span>contact@mtminnovation.com</span>
            </a>
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{t('pages.contact.responseTimeTitle')}</h4>
                <p className="text-xs text-slate-600">{t('pages.contact.responseTimeDesc')}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{t('pages.contact.publisherTitle')}</h4>
                <p className="text-xs text-slate-600">{t('pages.contact.publisherDesc')}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{t('pages.contact.privacyFaqTitle')}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('pages.contact.privacyFaqDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
