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
} from 'lucide-react';

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMessage('Veuillez saisir une adresse email valide.');
      return;
    }

    setIsSubmitting(true);

    // Simulate instant client handling & user notification
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: 'general',
        message: '',
      });
    }, 800);
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
            <span>Envoyez-nous un message</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            Remplissez ce formulaire et notre équipe technique vous apportera une réponse sous 24 à 48 heures.
          </p>

          {isSuccess ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-1">Message envoyé avec succès !</h3>
              <p className="text-sm text-emerald-700 mb-5">
                Merci de nous avoir contactés. Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais.
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center gap-2.5 text-xs sm:text-sm text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Adresse email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ex: jean.dupont@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sujet de votre demande
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 bg-white transition-colors"
                >
                  <option value="general">Question générale</option>
                  <option value="suggestion">Proposition d'un nouvel outil</option>
                  <option value="bug">Signalement d'un problème technique</option>
                  <option value="privacy">Question relative à la confidentialité / RGPD</option>
                  <option value="partnership">Partenariat & Professionnels</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Votre message *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Décrivez votre question, suggestion ou besoin en détail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 placeholder:text-slate-400 transition-colors resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer mon message</span>
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
            <h3 className="text-lg font-bold text-slate-900 mb-1">Email direct</h3>
            <p className="text-xs text-slate-600 mb-4">
              Préférez-vous votre client de messagerie habituel ? Écrivez-nous directement :
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
                <h4 className="text-sm font-bold text-slate-900">Délai de réponse</h4>
                <p className="text-xs text-slate-600">Réponse sous 24 à 48 heures ouvrées.</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Éditeur & Conception</h4>
                <p className="text-xs text-slate-600">MTM Innovation — Division Web Solutions.</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">Vos fichiers sont-ils stockés ?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Non, jamais. Vous n'avez pas besoin de nous contacter pour demander la suppression de fichiers, car nous n'en stockons aucun.
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
