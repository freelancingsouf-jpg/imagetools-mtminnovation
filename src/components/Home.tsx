import { useState, useMemo, useRef, useEffect, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SEO } from './SEO';
import { SeoFaqSection } from './SeoFaqSection';
import {
  Search,
  Sparkles,
  Sliders,
  Maximize2,
  RefreshCw,
  Crop as CropIcon,
  RotateCw,
  Stamp,
  Combine,
  Scissors,
  Trash2,
  FileImage,
  FileText,
  ShieldCheck,
  Lock,
  Zap,
  ArrowRight,
  ArrowLeft,
  X,
  Flame
} from 'lucide-react';

interface ToolDefinition {
  id: string;
  path: string;
  category: 'image' | 'pdf';
  icon: typeof Sliders;
  gradient: string;
  badge?: string;
  titleKey: string;
  descKey: string;
  tags: string[];
}

export const Home: FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // Search & Category Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'image' | 'pdf'>('all');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Press "/" to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Registry of all 12 tools
  const tools: ToolDefinition[] = useMemo(
    () => [
      // Image Tools (6)
      {
        id: 'compress',
        path: '/compress',
        category: 'image',
        icon: Sliders,
        gradient: 'from-blue-600 to-indigo-600',
        badge: 'Populaire',
        titleKey: 'tools.compress.title',
        descKey: 'tools.compress.description',
        tags: ['compress', 'compression', 'taille', 'poids', 'réduire', 'size', 'shrink', 'opti', 'jpg', 'png', 'webp', 'ضغط', 'حجم', '压缩']
      },
      {
        id: 'resize',
        path: '/resize',
        category: 'image',
        icon: Maximize2,
        gradient: 'from-indigo-600 to-purple-600',
        badge: 'Canvas HD',
        titleKey: 'tools.resize.title',
        descKey: 'tools.resize.description',
        tags: ['resize', 'redimensionner', 'dimensions', 'pixels', 'largeur', 'hauteur', 'scale', 'width', 'height', 'تغيير', 'أبعاد', '尺寸']
      },
      {
        id: 'convert',
        path: '/convert',
        category: 'image',
        icon: RefreshCw,
        gradient: 'from-sky-500 to-blue-600',
        badge: 'Multi-formats',
        titleKey: 'tools.convert.title',
        descKey: 'tools.convert.description',
        tags: ['convert', 'convertir', 'format', 'extension', 'transparence', 'jpg', 'png', 'webp', 'jpeg', 'تحويل', 'صيغة', '格式']
      },
      {
        id: 'crop',
        path: '/crop',
        category: 'image',
        icon: CropIcon,
        gradient: 'from-purple-600 to-pink-600',
        badge: 'Interactif',
        titleKey: 'tools.crop.title',
        descKey: 'tools.crop.description',
        tags: ['crop', 'recadrer', 'couper', 'ratio', 'carré', '16:9', 'sélection', 'recadrage', 'قص', 'تأطير', '裁剪']
      },
      {
        id: 'rotate-flip',
        path: '/rotate-flip',
        category: 'image',
        icon: RotateCw,
        gradient: 'from-blue-600 to-cyan-600',
        badge: 'Instantané',
        titleKey: 'tools.rotateFlip.title',
        descKey: 'tools.rotateFlip.description',
        tags: ['rotate', 'pivoter', 'rotation', 'miroir', 'flip', 'horizontal', 'vertical', 'tourner', 'تدوير', 'قلب', '旋转', '翻转']
      },
      {
        id: 'watermark',
        path: '/watermark',
        category: 'image',
        icon: Stamp,
        gradient: 'from-cyan-600 to-blue-600',
        badge: 'Protection',
        titleKey: 'tools.watermark.title',
        descKey: 'tools.watermark.description',
        tags: ['watermark', 'filigrane', 'texte', 'signature', 'logo', 'copyright', 'protection', 'marque', 'علامة', 'مائية', '水印']
      },

      // PDF Tools (6)
      {
        id: 'merge-pdf',
        path: '/merge-pdf',
        category: 'pdf',
        icon: Combine,
        gradient: 'from-amber-500 to-orange-600',
        badge: 'Populaire',
        titleKey: 'tools.mergePdf.title',
        descKey: 'tools.mergePdf.description',
        tags: ['merge', 'fusionner', 'assembler', 'combiner', 'unir', 'join', 'combine', 'multi', 'دمج', 'تجميع', '合并']
      },
      {
        id: 'split-pdf',
        path: '/split-pdf',
        category: 'pdf',
        icon: Scissors,
        gradient: 'from-orange-500 to-red-600',
        badge: 'Précis',
        titleKey: 'tools.splitPdf.title',
        descKey: 'tools.splitPdf.description',
        tags: ['split', 'diviser', 'séparer', 'extraire', 'découper', 'plage', 'extract', 'pages', 'تقسيم', 'استخراج', '拆分']
      },
      {
        id: 'rotate-pdf',
        path: '/rotate-pdf',
        category: 'pdf',
        icon: RotateCw,
        gradient: 'from-yellow-500 to-amber-600',
        badge: 'Orientation',
        titleKey: 'tools.rotatePdf.title',
        descKey: 'tools.rotatePdf.description',
        tags: ['rotate', 'pivoter', 'rotation', 'orientation', 'tourner', '90', '180', 'sens', 'تدوير', '旋转']
      },
      {
        id: 'delete-pdf-pages',
        path: '/delete-pdf-pages',
        category: 'pdf',
        icon: Trash2,
        gradient: 'from-rose-500 to-red-600',
        badge: 'Nettoyage',
        titleKey: 'tools.deletePdfPages.title',
        descKey: 'tools.deletePdfPages.description',
        tags: ['delete', 'supprimer', 'retirer', 'enlever', 'remove', 'pages', 'clean', 'effacer', 'حذف', 'إزالة', '删除']
      },
      {
        id: 'pdf-to-jpg',
        path: '/pdf-to-jpg',
        category: 'pdf',
        icon: FileImage,
        gradient: 'from-amber-600 to-yellow-600',
        badge: 'HD & ZIP',
        titleKey: 'tools.pdfToJpg.title',
        descKey: 'tools.pdfToJpg.description',
        tags: ['jpg', 'image', 'convert', 'extract', 'zip', 'rendu', 'dpi', 'photo', 'تحويل', 'صور', '转图片']
      },
      {
        id: 'image-to-pdf',
        path: '/image-to-pdf',
        category: 'pdf',
        icon: FileText,
        gradient: 'from-orange-600 to-amber-600',
        badge: 'Format A4',
        titleKey: 'tools.imageToPdf.title',
        descKey: 'tools.imageToPdf.description',
        tags: ['pdf', 'images', 'photos', 'créer', 'document', 'a4', 'assembler', 'jpeg', 'png', 'صور إلى', '图片转']
      }
    ],
    []
  );

  // Multi-lingual Real-time Filtering
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return tools.filter((tool) => {
      // 1. Category Filter
      if (activeCategory !== 'all' && tool.category !== activeCategory) {
        return false;
      }

      // 2. Search Query Filter
      if (!q) return true;

      const title = t(tool.titleKey).toLowerCase();
      const desc = t(tool.descKey).toLowerCase();
      const matchesText = title.includes(q) || desc.includes(q);
      const matchesTags = tool.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesText || matchesTags;
    });
  }, [tools, searchQuery, activeCategory, t]);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full flex flex-col">
      <SEO pageKey="home" canonicalPath="/" />
      
      {/* 1. Hero Section with MTM Innovation Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-secondary/5 to-slate-50 border-b border-slate-200/70 pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        
        {/* Decorative background glow circles */}
        <div className="absolute top-0 start-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 end-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-2xs text-xs font-bold text-primary mb-6 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>{t('home.heroBadge')}</span>
          </div>

          {/* Hero Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-dark tracking-tight leading-[1.15] mb-5">
            {t('home.heroTitle')}{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Image & PDF
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
            {t('home.heroSubtitle')}
          </p>

          {/* 2. Large Live Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15 transition-all p-1.5 sm:p-2">
              <div className="ps-3.5 pe-2 text-primary flex items-center pointer-events-none">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                className="w-full py-2.5 sm:py-3 pe-10 bg-transparent text-sm sm:text-base font-semibold text-dark placeholder:text-slate-400 outline-none"
              />

              {/* Reset button when search active */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={t('home.resetSearch')}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Keyboard shortcut hint */}
              {!searchQuery && (
                <div className="hidden sm:flex items-center pe-3 pointer-events-none">
                  <kbd className="px-2 py-1 text-[11px] font-mono font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded-md">
                    /
                  </kbd>
                </div>
              )}
            </div>

            {/* Live match indicator */}
            {searchQuery && (
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500 px-2 animate-in fade-in">
                <span>
                  {filteredTools.length}{' '}
                  {filteredTools.length > 1 ? 'outils trouvés' : 'outil trouvé'}
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-primary hover:underline font-bold cursor-pointer"
                >
                  {t('home.resetSearch')}
                </button>
              </div>
            )}
          </div>

          {/* 3. Trust Highlights Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs backdrop-blur-xs text-start">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-dark truncate">{t('home.trust.localTitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs backdrop-blur-xs text-start">
              <Lock className="w-4 h-4 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-dark truncate">{t('home.trust.privacyTitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs backdrop-blur-xs text-start">
              <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-dark truncate">{t('home.trust.unlimitedTitle')}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs backdrop-blur-xs text-start">
              <Sparkles className="w-4 h-4 text-secondary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-dark truncate">{t('home.trust.speedTitle')}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Main Tools Container */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Category Filter Tabs Bar (flex flex-wrap justify-center gap-3 - Never horizontal scroll!) */}
        <div className="flex flex-wrap justify-center items-center gap-3 pb-8 mb-10 border-b border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
              activeCategory === 'all'
                ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                : 'bg-white text-slate-600 hover:text-dark hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{t('home.allTools')}</span>
            <span className={`ms-2 px-2 py-0.5 rounded-full text-xs font-mono ${
              activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              12
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('image')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
              activeCategory === 'image'
                ? 'bg-primary text-white shadow-md shadow-primary/25 scale-105'
                : 'bg-white text-slate-600 hover:text-dark hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('home.imageTools')}</span>
            <span className={`ms-1 px-2 py-0.5 rounded-full text-xs font-mono ${
              activeCategory === 'image' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              6
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('pdf')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
              activeCategory === 'pdf'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25 scale-105'
                : 'bg-white text-slate-600 hover:text-dark hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t('home.pdfTools')}</span>
            <span className={`ms-1 px-2 py-0.5 rounded-full text-xs font-mono ${
              activeCategory === 'pdf' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              6
            </span>
          </button>
        </div>

        {/* 5. Tool Grid: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 */}
        {filteredTools.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto my-12 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-dark mb-1">
              {t('home.noResults')}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {t('home.noResultsSubtitle')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/95 transition-all cursor-pointer"
            >
              {t('home.resetSearch')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                ArrowIcon={ArrowIcon}
                isPdf={tool.category === 'pdf'}
              />
            ))}
          </div>
        )}

      </section>

      {/* SEO & Arabic FAQ Section (Structured Data & High Value Content) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <SeoFaqSection />
      </div>

    </div>
  );
};

// Reusable Premium Tool Card Component (Centered SaaS card)
interface ToolCardProps {
  tool: ToolDefinition;
  ArrowIcon: typeof ArrowRight;
  isPdf?: boolean;
}

const ToolCard: FC<ToolCardProps> = ({ tool, ArrowIcon, isPdf = false }) => {
  const { t } = useTranslation();
  const IconComponent = tool.icon;

  return (
    <Link
      to={tool.path}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-5 sm:p-6 flex flex-col items-center text-center cursor-pointer border border-gray-100 hover:border-primary/40 group relative overflow-hidden h-full"
    >
      {/* Top accent gradient bar on hover */}
      <div
        className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Top Badge (if applicable) */}
      <div className="w-full flex items-center justify-end mb-2 h-6">
        {tool.badge && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              tool.badge === 'Populaire'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : isPdf
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-primary/10 text-primary border border-primary/20'
            }`}
          >
            {tool.badge === 'Populaire' && <Flame className="w-3 h-3 text-amber-600" />}
            <span>{tool.badge}</span>
          </span>
        )}
      </div>

      {/* Centered Icon with Gradient */}
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md shadow-slate-200/80`}
      >
        <IconComponent className="w-7 h-7" />
      </div>

      {/* Tool Title */}
      <h3 className="text-base font-bold text-dark group-hover:text-primary transition-colors duration-200 mb-2">
        {t(tool.titleKey)}
      </h3>

      {/* Tool Description */}
      <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1 line-clamp-3">
        {t(tool.descKey)}
      </p>

      {/* Card Action Link */}
      <div className="w-full pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">
        <span>{t('home.openTool')}</span>
        <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};

export default Home;
