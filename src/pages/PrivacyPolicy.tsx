import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import {
  ShieldCheck,
  Lock,
  Cpu,
  EyeOff,
  Cookie,
  FileCheck,
  ArrowLeft,
  ArrowRight,
  Mail,
  CheckCircle2,
} from 'lucide-react';

export const PrivacyPolicy: FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SEO pageKey="privacy" canonicalPath="/privacy" />
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
        <span className="text-slate-900 font-semibold">{t('pages.privacy.title')}</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl mb-10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('pages.privacy.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t('pages.privacy.title')}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
            {t('pages.privacy.subtitle')}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
            <span>Dernière mise à jour : Février 2026</span>
            <span>•</span>
            <span>Version 1.0 (Production Release)</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">100% Client-Side Architecture</span>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Golden Rule Highlight Banner */}
      <div className="mb-10 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-200/60 px-2.5 py-0.5 rounded-full mb-1.5">
              Notre engagement fondamental
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              Privacy First, 100% Local Processing
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              <strong className="text-slate-900">Aucune donnée n’est envoyée aux serveurs.</strong>{' '}
              Lorsque vous utilisez ImageTools pour compresser, redimensionner, recadrer, convertir des images ou manipuler des documents PDF, l’intégralité des opérations s’exécute directement dans le processeur et la mémoire vive de votre propre appareil (ordinateur, tablette ou smartphone).
            </p>
          </div>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="space-y-8 text-slate-700">
        {/* Section 1 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              1. Fonctionnement Technique & Traitement Local
            </h3>
          </div>
          <div className="space-y-3 text-sm sm:text-base leading-relaxed">
            <p>
              ImageTools a été conçu dès sa première ligne de code sur le paradigme <em>Zero-Upload</em>. Nous utilisons les technologies web les plus avancées :
            </p>
            <ul className="space-y-2 my-4">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>HTML5 Canvas & WebAssembly :</strong> Les calculs de pixels, rééchantillonnages et compressions se font dans l’environnement isolé de votre navigateur.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Bibliothèques embarquées (pdf-lib, pdfjs-dist) :</strong> La lecture, la fusion, la division et l’extraction de pages PDF se déroulent intégralement sans intermédiaire serveur.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Volatilité totale :</strong> Vos fichiers résident temporairement dans la mémoire vive (RAM) de votre navigateur et sont purgés dès la fermeture de l’onglet ou le rechargement de la page.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              2. Absence Totale de Collecte de Fichiers Personnels
            </h3>
          </div>
          <div className="space-y-3 text-sm sm:text-base leading-relaxed">
            <p>
              MTM Innovation ne possède aucun serveur de stockage pour vos images ou documents. Par conséquent :
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Nous ne consultons, ne copions, n’indexons et ne vendons <strong>jamais</strong> vos documents.</li>
              <li>Nous n’utilisons pas vos fichiers pour entraîner des modèles d’intelligence artificielle.</li>
              <li>Aucun journal (log) contenant le contenu ou les métadonnées de vos fichiers n’est généré côté serveur.</li>
              <li>Même si nous recevions une requête administrative ou judiciaire, nous serions techniquement incapables de fournir des fichiers que nous n’avons jamais possédés.</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Cookie className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              3. Cookies, Stockage Local & Publicité (Google AdSense)
            </h3>
          </div>
          <div className="space-y-3 text-sm sm:text-base leading-relaxed">
            <p>
              Afin d’offrir la meilleure expérience utilisateur et de financer l’infrastructure de mise à disposition gratuite de nos outils :
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <span className="font-semibold text-slate-900 min-w-32">Préférences locales :</span>
                <span>
                  Nous utilisons le <code>localStorage</code> de votre navigateur uniquement pour mémoriser votre choix de langue (français, anglais, arabe, chinois) pour vos prochaines visites.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-semibold text-slate-900 min-w-32">Régies publicitaires :</span>
                <span>
                  Ce site peut afficher des annonces publicitaires diffusées par Google AdSense ou d’autres partenaires certifiés. Ces partenaires peuvent utiliser des cookies et balises web pour diffuser des annonces basées sur les visites antérieures des utilisateurs. Les fournisseurs tiers, y compris Google, utilisent des cookies pour diffuser des annonces en fonction de la navigation. Vous pouvez désactiver la publicité personnalisée dans les paramètres de votre compte Google ou sur{' '}
                  <a
                    href="https://www.aboutads.info"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    aboutads.info
                  </a>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-semibold text-slate-900 min-w-32">Cloisonnement strict :</span>
                <span>
                  Les scripts publicitaires n’ont aucun accès à vos documents importés, à vos images ou à la mémoire de traitement de l’application.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 4 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              4. Conformité RGPD & Droits des Utilisateurs
            </h3>
          </div>
          <div className="space-y-3 text-sm sm:text-base leading-relaxed">
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD - UE 2016/679) et au California Consumer Privacy Act (CCPA) :
            </p>
            <p>
              Puisque ImageTools n’enregistre, ne transmet et ne détient aucune donnée à caractère personnel issue de vos documents, le principe de <em>Privacy by Design</em> (protection des données dès la conception) et de <em>Privacy by Default</em> est nativement respecté à son niveau le plus strict.
            </p>
          </div>
        </div>

        {/* Contact box */}
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 text-center sm:text-start flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">
              Des questions sur notre politique de confidentialité ?
            </h4>
            <p className="text-slate-600 text-sm">
              L’équipe MTM Innovation se tient à votre entière disposition pour répondre à toutes vos interrogations.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm hover:shadow"
          >
            <Mail className="w-4 h-4" />
            <span>Contacter le DPO / Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
