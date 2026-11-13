import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Shield,
  Award,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Scale,
  Sparkles,
} from 'lucide-react';

export const TermsOfUse: FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
        <span className="text-slate-900 font-semibold">{t('pages.terms.title')}</span>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white shadow-xl mb-10">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-sm">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>{t('pages.terms.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t('pages.terms.title')}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
            {t('pages.terms.subtitle')}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
            <span>En vigueur au 1er Février 2026</span>
            <span>•</span>
            <span>Édité par MTM Innovation</span>
            <span>•</span>
            <span className="text-indigo-400 font-semibold">Conditions d'Utilisation Gratuite</span>
          </div>
        </div>

        {/* Glow */}
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Core Highlights Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Propriété à 100%</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vous restez l'unique et exclusif propriétaire de tous vos fichiers, images et documents.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">100% Local & Sécurisé</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zéro transfert vers un serveur externe. Le traitement s'exécute dans votre propre navigateur.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">Libre d'Utilisation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Utilisation libre pour vos besoins personnels, académiques et professionnels sans filigrane.
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Articles */}
      <div className="space-y-8 text-slate-700">
        {/* Article 1 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-indigo-600">Article 1.</span> Objet & Acceptation des Conditions
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600">
            Les présentes Conditions Générales d’Utilisation (les « CGU ») régissent l’accès et l’utilisation de la suite logicielle en ligne <strong>ImageTools</strong>, éditée par <strong>MTM Innovation</strong>. En accédant au site et en utilisant les outils proposés, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas l'une quelconque de ces dispositions, vous êtes invité à ne pas utiliser le service.
          </p>
        </div>

        {/* Article 2 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-indigo-600">Article 2.</span> Nature du Service (Traitement Client-Side)
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600 mb-3">
            ImageTools est une suite d'utilitaires web fonctionnant à 100% dans le navigateur de l'utilisateur final. Les technologies employées (HTML5, JavaScript, WebAssembly, Canvas API, pdf-lib, pdfjs-dist) effectuent toutes les opérations directement sur la machine de l'utilisateur.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
            <strong>Règle d'or :</strong> Aucune image, aucun PDF, ni aucune métadonnée n’est transmise à un serveur distant hébergé par MTM Innovation. Le service ne stocke aucune copie de vos travaux.
          </div>
        </div>

        {/* Article 3 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-indigo-600">Article 3.</span> Propriété Intellectuelle & Droits sur les Fichiers
          </h3>
          <div className="space-y-3 text-sm sm:text-base leading-relaxed text-slate-600">
            <p>
              <strong>Vos fichiers :</strong> Vous conservez l’intégralité de vos droits de propriété intellectuelle sur les fichiers que vous chargez et téléchargez via ImageTools. MTM Innovation ne revendique aucun droit, titre ou intérêt sur vos créations, photos ou documents.
            </p>
            <p>
              <strong>La plateforme :</strong> Le code source, le design, le logo, les graphismes, l’architecture applicative et la marque ImageTools sont la propriété exclusive de MTM Innovation et sont protégés par les lois internationales relatives à la propriété intellectuelle.
            </p>
          </div>
        </div>

        {/* Article 4 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-indigo-600">Article 4.</span> Responsabilités & Utilisation Acceptable
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600 mb-3">
            L'utilisateur s'engage à utiliser le service de manière conforme aux lois et règlements en vigueur. Il est strictement interdit d'utiliser ImageTools pour traiter des contenus illicites, haineux, diffamatoires ou portant atteinte aux droits de tiers.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600">
            L'utilisateur demeure seul responsable des fichiers qu'il choisit de traiter et des sauvegardes préalables de ses documents originaux.
          </p>
        </div>

        {/* Article 5 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-indigo-600">Article 5.</span> Exclusion de Garanties & Limitation de Responsabilité
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600 mb-3">
            Le service est fourni gratuitement « en l'état » (<em>as is</em>) et « selon disponibilité ». MTM Innovation s'efforce d'assurer un fonctionnement fluide et pérenne mais ne garantit pas une compatibilité absolue avec tous les formats exotiques ou des fichiers corrompus.
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600">
            En aucun cas MTM Innovation ne pourra être tenu responsable des dommages directs ou indirects, pertes de données ou interruptions de service résultant de l'utilisation de nos outils.
          </p>
        </div>

        {/* Article 6 */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-indigo-600">Article 6.</span> Évolution du Service & Contact
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600 mb-4">
            MTM Innovation se réserve le droit de faire évoluer, d'ajouter de nouvelles fonctionnalités ou d'actualiser les présentes conditions à tout moment afin de refléter les améliorations technologiques ou les obligations légales.
          </p>
          <div className="flex items-center gap-2 text-slate-700 text-sm">
            <HelpCircle className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>
              Pour toute question juridique ou contractuelle :{' '}
              <a href="mailto:contact@mtminnovation.com" className="text-indigo-600 font-semibold hover:underline">
                contact@mtminnovation.com
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
