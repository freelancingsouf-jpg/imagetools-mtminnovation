import { useState, useRef, useEffect, useCallback, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import imageCompression from 'browser-image-compression';
import {
  UploadCloud,
  FileImage,
  Sliders,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingDown,
  HardDrive,
  Maximize2
} from 'lucide-react';

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

interface ImageMetadata {
  name: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
}

export const CompressImage: FC = () => {
  const { t } = useTranslation();

  // États pour les fichiers et prévisualisations
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalMeta, setOriginalMeta] = useState<ImageMetadata | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedMeta, setCompressedMeta] = useState<ImageMetadata | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  // Contrôles de compression (Slider de 10% à 100%)
  const [quality, setQuality] = useState<number>(75);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Références
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalUrlRef = useRef<string | null>(null);
  const compressedUrlRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Maintien des URLs actives pour révocation
  useEffect(() => {
    originalUrlRef.current = originalUrl;
  }, [originalUrl]);

  useEffect(() => {
    compressedUrlRef.current = compressedUrl;
  }, [compressedUrl]);

  // Nettoyage complet au démontage (anti-fuite mémoire)
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }
      if (compressedUrlRef.current) {
        URL.revokeObjectURL(compressedUrlRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Définition sécurisée du blob compressé avec libération de l'ancienne URL
  const safelySetCompressedUrl = useCallback((newBlob: Blob | null, meta: ImageMetadata | null) => {
    if (compressedUrlRef.current) {
      URL.revokeObjectURL(compressedUrlRef.current);
      compressedUrlRef.current = null;
    }

    if (newBlob) {
      const url = URL.createObjectURL(newBlob);
      setCompressedUrl(url);
      setCompressedBlob(newBlob);
      setCompressedMeta(meta);
    } else {
      setCompressedUrl(null);
      setCompressedBlob(null);
      setCompressedMeta(null);
    }
  }, []);

  // Réinitialisation complète
  const handleReset = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    if (compressedUrlRef.current) {
      URL.revokeObjectURL(compressedUrlRef.current);
      compressedUrlRef.current = null;
    }

    setOriginalFile(null);
    setOriginalMeta(null);
    setOriginalUrl(null);
    safelySetCompressedUrl(null, null);
    setErrorMessage(null);
    setQuality(75);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [safelySetCompressedUrl]);

  // Récupération des dimensions d'une image avec nettoyage mémoire
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        img.src = '';
        resolve({ width: w, height: h });
      };
      img.onerror = () => {
        img.src = '';
        resolve({ width: 0, height: 0 });
      };
      img.src = url;
    });
  };

  // Validation du type de fichier
  const isValidImage = (file: File): boolean => {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const mimeOk = validMimes.includes(file.type.toLowerCase());
    const extOk = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    return mimeOk || extOk;
  };

  // Exécution de browser-image-compression
  const executeCompression = useCallback(
    async (file: File, targetQuality: number) => {
      setIsCompressing(true);
      setErrorMessage(null);

      try {
        const qualityRatio = Math.max(0.05, Math.min(1, targetQuality / 100));
        const originalSizeMB = file.size / (1024 * 1024);
        const targetMaxSizeMB = Math.max(0.01, originalSizeMB * qualityRatio);

        const options = {
          maxSizeMB: targetMaxSizeMB,
          maxWidthOrHeight: 4096,
          useWebWorker: true,
          initialQuality: qualityRatio,
          alwaysKeepResolution: false, // Prevents mobile Safari canvas allocations from exceeding 4096px
          fileType: file.type || 'image/jpeg',
        };

        const compressed = await imageCompression(file, options);

        const tempUrl = URL.createObjectURL(compressed);
        const dims = await getImageDimensions(tempUrl);
        URL.revokeObjectURL(tempUrl);

        safelySetCompressedUrl(compressed, {
          name: compressed.name || file.name,
          type: compressed.type || file.type,
          size: compressed.size,
          width: dims.width,
          height: dims.height,
        });
      } catch (err) {
        console.error('Erreur compression:', err);
        setErrorMessage(t('tools.compress.errorProcessing'));
      } finally {
        setIsCompressing(false);
      }
    },
    [safelySetCompressedUrl, t]
  );

  // Changement du slider (10% à 100%) avec relance automatique
  const handleQualityChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newQuality = Number(e.target.value);
    setQuality(newQuality);

    if (!originalFile) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeCompression(originalFile, newQuality);
    }, 250);
  };

  // Préréglage rapide
  const applyPresetQuality = (presetVal: number) => {
    setQuality(presetVal);
    if (!originalFile) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    executeCompression(originalFile, presetVal);
  };

  // Traitement d'un fichier sélectionné
  const processSelectedFile = async (file: File) => {
    if (!isValidImage(file)) {
      setErrorMessage(t('tools.compress.errorInvalidType'));
      return;
    }

    setErrorMessage(null);

    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
    }
    safelySetCompressedUrl(null, null);

    const newOriginalUrl = URL.createObjectURL(file);
    const dims = await getImageDimensions(newOriginalUrl);

    setOriginalFile(file);
    setOriginalMeta({
      name: file.name,
      type: file.type || 'image/jpeg',
      size: file.size,
      width: dims.width,
      height: dims.height,
    });
    setOriginalUrl(newOriginalUrl);

    // Lance la compression immédiatement
    executeCompression(file, quality);
  };

  // Drag & drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Téléchargement sécurisé
  const handleDownload = () => {
    if (!compressedBlob || !compressedUrl || !originalMeta) return;

    const originalName = originalMeta.name;
    const dotIndex = originalName.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
    const extension = dotIndex !== -1 ? originalName.substring(dotIndex) : '.jpg';
    const downloadFileName = `${baseName}-compressed${extension}`;

    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistiques
  const originalSize = originalMeta?.size || 0;
  const compressedSize = compressedMeta?.size || 0;
  const savedBytes = originalSize > compressedSize ? originalSize - compressedSize : 0;
  const reductionPercentage =
    originalSize > 0 && compressedSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header section with Badges and Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('tools.compress.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark tracking-tight font-sans">
          {t('tools.compress.title')}
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
          {t('tools.compress.description')}
        </p>
      </div>

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Curseur de qualité global (Toujours accessible) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              <h3 className="text-base sm:text-lg font-bold text-dark">
                {t('tools.compress.qualityLabel')}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {t('tools.compress.qualityDescription')}
            </p>
          </div>

          {/* Badge % Qualité (Enveloppé en LTR pour affichage numérique parfait) */}
          <div dir="ltr" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-base sm:text-lg self-start sm:self-auto font-mono">
            <span>{quality}%</span>
          </div>
        </div>

        {/* Slider Input (type="range" de 10% à 100%) */}
        <div className="space-y-2">
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={quality}
            onChange={handleQualityChange}
            aria-label="Niveau de qualité de compression"
            className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
          />
          <div className="flex justify-between text-xs font-semibold text-slate-400">
            <span>10% ({t('tools.compress.qualityLow')})</span>
            <span>75% ({t('tools.compress.qualityBalanced')})</span>
            <span>100% ({t('tools.compress.qualityHigh')})</span>
          </div>
        </div>

        {/* Boutons de préréglages */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: '50% (Max)', val: 50 },
            { label: '70% (Standard)', val: 70 },
            { label: '80% (Recommandé)', val: 80 },
            { label: '90% (Haute qualité)', val: 90 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => applyPresetQuality(preset.val)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                quality === preset.val
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zone principale : Sélection ou Contrôles actifs */}
      {!originalFile ? (
        /* Étape 1 : Zone de dépôt (Upload) */
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-10 transition-all">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
            }}
            className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center transition-all duration-200 ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-slate-300 hover:border-primary hover:bg-slate-50/70'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,image/png,image/jpeg,image/webp"
              onChange={handleFileInputChange}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/15 to-secondary/15 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-primary group-hover:to-secondary group-hover:text-white transition-all duration-300 shadow-inner">
                <UploadCloud className="w-10 h-10 transition-colors" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">
                  {isDragging ? t('tools.compress.dropzoneActive') : t('tools.compress.dropzoneTitle')}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {t('tools.compress.dropzoneSubtitle')}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-95 active:scale-95 text-white font-semibold text-sm shadow-md shadow-primary/25 transition-all"
              >
                <FileImage className="w-4 h-4" />
                <span>{t('tools.compress.selectImageBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Étape 2 : Statistiques (avec conteneurs LTR pour les chiffres), Prévisualisations & Téléchargement */
        <div className="space-y-6">
          
          {/* Barre supérieure : Info fichier & Réinitialiser */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <FileImage className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-dark text-base sm:text-lg line-clamp-1">
                  {originalMeta?.name}
                </h4>
                {/* Zone de métadonnées avec dir="ltr" pour alignement et chiffres parfaits */}
                <div dir="ltr" className="flex items-center gap-2 text-xs text-slate-500 font-medium font-mono">
                  <span>{formatBytes(originalSize)}</span>
                  {originalMeta?.width && originalMeta?.height ? (
                    <>
                      <span>•</span>
                      <span>{originalMeta.width} × {originalMeta.height} px</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>{t('tools.compress.changeImage')}</span>
            </button>
          </div>

          {/* Grille des statistiques (Textes explicatifs en direction courante, CHIFFRES sous conteneur dir="ltr") */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* 1: Taille originale */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('tools.compress.stats.originalSize')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-slate-800 font-mono">
                  {formatBytes(originalSize)}
                </span>
              </div>
            </div>

            {/* 2: Nouvelle taille */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-primary" />
                <span>{t('tools.compress.stats.compressedSize')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                {isCompressing ? (
                  <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calcul...</span>
                  </span>
                ) : (
                  <span className="text-lg sm:text-2xl font-bold text-primary font-mono">
                    {formatBytes(compressedSize)}
                  </span>
                )}
              </div>
            </div>

            {/* 3: Pourcentage de réduction */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('tools.compress.stats.reduction')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                {isCompressing ? (
                  <span className="text-emerald-700 text-sm font-semibold">...</span>
                ) : (
                  <span className="text-lg sm:text-2xl font-black text-emerald-600 font-mono">
                    -{reductionPercentage}%
                  </span>
                )}
              </div>
            </div>

            {/* 4: Espace économisé */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
                <span>{t('tools.compress.stats.saved')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                {isCompressing ? (
                  <span className="text-slate-400 text-sm">...</span>
                ) : (
                  <span className="text-lg sm:text-2xl font-bold text-secondary font-mono">
                    {formatBytes(savedBytes)}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Prévisualisations comparatives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Carte Image Originale */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="font-bold text-sm text-slate-700">
                    {t('tools.compress.originalPreview')}
                  </span>
                </div>
                <div dir="ltr">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono">
                    {formatBytes(originalSize)}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex items-center justify-center bg-slate-100/50 min-h-[260px] sm:min-h-[320px]">
                {originalUrl && (
                  <img
                    src={originalUrl}
                    alt="Original Preview"
                    className="max-h-72 w-auto object-contain rounded-xl shadow-sm border border-slate-200/80"
                  />
                )}
              </div>

              {originalMeta?.width && originalMeta?.height ? (
                <div dir="ltr" className="p-3 text-center text-xs font-medium text-slate-500 bg-white border-t border-slate-100 flex items-center justify-center gap-1.5 font-mono">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{originalMeta.width} × {originalMeta.height} px</span>
                </div>
              ) : null}
            </div>

            {/* Carte Image Compressée */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-bold text-sm text-primary">
                    {t('tools.compress.compressedPreview')}
                  </span>
                </div>
                {compressedSize > 0 && !isCompressing && (
                  <div dir="ltr">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-mono">
                      -{reductionPercentage}%
                    </span>
                  </div>
                )}
              </div>

              <div className="relative p-4 flex-1 flex items-center justify-center bg-slate-100/50 min-h-[260px] sm:min-h-[320px]">
                {isCompressing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-sm font-semibold text-slate-600">
                      {t('tools.compress.compressing')}
                    </span>
                  </div>
                ) : compressedUrl ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed Preview"
                    className="max-h-72 w-auto object-contain rounded-xl shadow-sm border border-slate-200/80"
                  />
                ) : null}
              </div>

              {compressedMeta?.width && compressedMeta?.height ? (
                <div dir="ltr" className="p-3 text-center text-xs font-medium text-slate-500 bg-white border-t border-slate-100 flex items-center justify-center gap-1.5 font-mono">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{compressedMeta.width} × {compressedMeta.height} px</span>
                </div>
              ) : null}
            </div>

          </div>

          {/* Bouton de téléchargement */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-start">
              <h4 className="font-bold text-dark text-base sm:text-lg">
                {t('tools.compress.statusReady')}
              </h4>
              <div dir="ltr" className="text-xs sm:text-sm text-slate-500 font-mono inline-flex items-center gap-2">
                <span>{formatBytes(originalSize)}</span>
                <span>→</span>
                <strong className="text-primary">{formatBytes(compressedSize)}</strong>
                <span className="text-emerald-600 font-bold">(-{reductionPercentage}%)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isCompressing || !compressedUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-primary to-secondary hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-primary/25 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>{t('tools.compress.downloadBtn')}</span>
            </button>
          </div>

        </div>
      )}

      {/* Badges de confiance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Ultra Rapide</h4>
            <p className="text-xs text-slate-500 mt-0.5">Traitement multi-thread en arrière-plan via Web Worker.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">100% Privé</h4>
            <p className="text-xs text-slate-500 mt-0.5">Aucune donnée n’est transmise à un serveur distant.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Contrôle en temps réel</h4>
            <p className="text-xs text-slate-500 mt-0.5">Ajustement fluide avec prévisualisation immédiate.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
