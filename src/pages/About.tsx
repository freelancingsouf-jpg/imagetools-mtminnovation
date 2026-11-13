import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Leaf,
  Code2,
  Globe2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export const About: FC = () => {
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
        <span className="text-slate-900 font-semibold">{t('pages.about.title')}</span>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 sm:p-12 text-white shadow-xl mb-12">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs sm:text-sm font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>{t('pages.about.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            {t('pages.about.title')}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
            {t('pages.about.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-950 hover:bg-slate-100 font-bold text-sm transition-all shadow-md hover:shadow-lg"
            >
              <span>Découvrir tous les outils</span>
              {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all border border-white/20 backdrop-blur-sm"
            >
              <span>Échanger avec l'équipe</span>
            </Link>
          </div>
        </div>

        {/* Ambient lighting */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center">
          <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            12
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-600">Outils Image & PDF</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center">
          <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
            100%
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-600">Traitement Local (Client)</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center">
          <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
            0 Ko
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-600">Données envoyées sur serveur</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm text-center">
          <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-1">
            4
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-600">Langues & RTL natif</div>
        </div>
      </div>

      {/* Vision Story */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm mb-12">
        <div className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">
          Qui sommes-nous ?
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-6">
          La vision de MTM Innovation pour le web moderne
        </h2>
        <div className="space-y-4 text-slate-600 text-base sm:text-lg leading-relaxed">
          <p>
            Fondé par des passionnés de technologie et d'ergonomie logicielle, <strong>MTM Innovation</strong> est un laboratoire d'ingénierie numérique dédié à la création d'applications web rapides, élégantes et fondamentalement respectueuses des utilisateurs.
          </p>
          <p>
            Trop souvent, les outils de conversion et d'édition de documents exigent que vous téléchargiez vos photos personnelles, vos contrats ou vos relevés financiers sur des serveurs distants inconnus, avec des files d'attente interminables, des limitations artificielles ou des abonnements cachés.
          </p>
          <p>
            Nous avons pris le parti inverse : <em>et si toute la puissance de calcul restait entre vos mains ?</em> Grâce à l'émergence des technologies WebAssembly, Canvas et aux processeurs modernes de nos ordinateurs et smartphones, un navigateur web est désormais capable de traiter des images haute résolution et des documents PDF complexes en une fraction de seconde, sans rien envoyer sur le cloud.
          </p>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="mb-12">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 text-center">
          Nos 4 piliers d’excellence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Confidentialité Inaltérable</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              La meilleure façon de sécuriser vos données est de ne jamais les collecter. Aucun risque de fuite de données, d'interception réseau ou d'intrusion serveur.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Vitesse Instantanée</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fini l'attente du téléversement de fichiers lourds de 50 Mo sur un serveur lointain. Le traitement débute à la milliseconde près directement dans votre mémoire locale.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5">
              <Leaf className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Informatique Responsable & Écologique</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              En éliminant les fermes de serveurs de calcul pour chaque conversion, nous diminuons drastiquement l’empreinte carbone et la consommation électrique liée au cloud.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5">
              <Globe2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Accessibilité Universelle</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Conçu pour fonctionner sur tous les navigateurs modernes (Chrome, Firefox, Safari, Edge) et disponible en 4 langues (Français, Anglais, Arabe avec RTL, Chinois).
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider mb-2">
              <Code2 className="w-4 h-4" />
              <span>Stack Technologique</span>
            </div>
            <h3 className="text-2xl font-bold">L'ingénierie au service de l'utilisateur</h3>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            100% Modern Web Standards
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {['React 19', 'TypeScript', 'Tailwind CSS', 'WebAssembly', 'PDF-lib', 'PDF.js'].map((tech) => (
            <div
              key={tech}
              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center text-xs font-semibold text-slate-200"
            >
              {tech}
            </div>
          ))}
        </div>
      </div>

      {/* Footer callout */}
      <div className="text-center py-6">
        <p className="text-slate-500 text-sm flex items-center justify-center gap-1.5 font-medium">
          Conçu avec rigueur et passion par <span className="font-bold text-slate-800">MTM Innovation</span>
        </p>
      </div>
    </div>
  );
};

export default About;
