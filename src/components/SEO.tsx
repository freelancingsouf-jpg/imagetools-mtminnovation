import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export interface SEOProps {
  pageKey?: string;
  title?: string;
  description?: string;
  canonicalPath?: string;
}

const DEFAULT_DESCRIPTION: Record<string, string> = {
  fr: 'Boîte à outils en ligne gratuite, 100% locale et privée pour traiter vos images et fichiers PDF. Aucun envoi sur serveur, sécurité maximale.',
  en: 'Free, 100% client-side and private online toolkit for your images and PDF files. Zero server uploads, maximum security.',
  ar: 'مجموعة أدوات مجانية عبر الإنترنت، محلية وخاصة بنسبة 100٪ لمعالجة الصور وملفات PDF. بدون رفع إلى الخوادم، أمان فائق.',
  zh: '免费、100% 浏览器本地计算且注重隐私的在线图片与 PDF 工具箱。无需上传服务器，安全极速。',
};

export const SEO: FC<SEOProps> = ({ pageKey, title, description, canonicalPath }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split('-')[0] || 'fr';
  const defaultDesc = DEFAULT_DESCRIPTION[currentLang] || DEFAULT_DESCRIPTION.fr;

  const translatedTitle = pageKey ? t(`seo.${pageKey}.title`) : undefined;
  const translatedDesc = pageKey ? t(`seo.${pageKey}.description`) : undefined;

  const pageTitle = title || translatedTitle || 'Outils Images & PDF 100% Locaux';
  const metaDescription = description || translatedDesc || defaultDesc;

  // Format: "Compresser des images en ligne - ImageTools"
  const fullTitle = `${pageTitle} - ImageTools`;
  const canonicalUrl = canonicalPath ? `https://imagetools-mtminnovation.pages.dev${canonicalPath}` : undefined;

  return (
    <Helmet>
      <html lang={currentLang} dir={i18n.dir()} />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:site_name" content="ImageTools by MTM Innovation" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />

      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
};
