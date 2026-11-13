import { useState, useRef, useEffect, useCallback, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../SEO';
import { ToolInfoSection } from '../ToolInfoSection';
import {
  UploadCloud,
  FileImage,
  RefreshCw,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Info,
  Layers,
  HardDrive,
  ChevronDown
} from 'lucide-react';
import { formatBytes } from './CompressImage';

export type SupportedFormat = 'image/jpeg' | 'image/png' | 'image/webp';

interface FormatOption {
  mime: SupportedFormat;
  ext: string;
  label: string;
  badge: string;
  supportsAlpha: boolean;
  description: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    mime: 'image/jpeg',
    ext: '.jpg',
    label: 'JPG / JPEG (.jpg)',
    badge: 'JPG',
    supportsAlpha: false,
    description: 'Format idéal pour les photographies (fond blanc automatique)',
  },
  {
    mime: 'image/png',
    ext: '.png',
    label: 'PNG (.png)',
    badge: 'PNG',
    supportsAlpha: true,
    description: 'Haute fidélité sans perte avec support de la transparence',
  },
  {
    mime: 'image/webp',
    ext: '.webp',
    label: 'WebP (.webp)',
    badge: 'WebP',
    supportsAlpha: true,
    description: 'Format web ultra-léger et moderne avec transparence',
  },
];

interface ImageMetadata {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
}

export const ConvertImage: FC = () => {
  const { t } = useTranslation();

  // File states
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalMeta, setOriginalMeta] = useState<ImageMetadata | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  // Target Format state (JPG, PNG, WebP)
  const [targetFormat, setTargetFormat] = useState<SupportedFormat>('image/jpeg');

  // Converted result states
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number>(0);

  // Status & UI
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for cleanup and memory safety
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalUrlRef = useRef<string | null>(null);
  const convertedUrlRef = useRef<string | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Sync ref pointers for clean revoke on unmount or replacements
  useEffect(() => {
    originalUrlRef.current = originalUrl;
  }, [originalUrl]);

  useEffect(() => {
    convertedUrlRef.current = convertedUrl;
  }, [convertedUrl]);

  // Clean memory leaks on unmount
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }
      if (convertedUrlRef.current) {
        URL.revokeObjectURL(convertedUrlRef.current);
      }
    };
  }, []);

  // Safe setter for converted Blob & Object URL
  const safelySetConvertedUrl = useCallback((newBlob: Blob | null) => {
    if (convertedUrlRef.current) {
      URL.revokeObjectURL(convertedUrlRef.current);
      convertedUrlRef.current = null;
    }

    if (newBlob) {
      const url = URL.createObjectURL(newBlob);
      setConvertedUrl(url);
      setConvertedBlob(newBlob);
      setConvertedSize(newBlob.size);
    } else {
      setConvertedUrl(null);
      setConvertedBlob(null);
      setConvertedSize(0);
    }
  }, []);

  // Full reset
  const handleReset = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    if (convertedUrlRef.current) {
      URL.revokeObjectURL(convertedUrlRef.current);
      convertedUrlRef.current = null;
    }

    loadedImageRef.current = null;
    setOriginalFile(null);
    setOriginalMeta(null);
    setOriginalUrl(null);
    safelySetConvertedUrl(null);
    setTargetFormat('image/jpeg');
    setErrorMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [safelySetConvertedUrl]);

  // Core Canvas Conversion Logic (100% Client-Side)
  // Handles JPG ↔ PNG ↔ WebP seamlessly in all directions
  const executeConversion = useCallback(
    async (format: SupportedFormat) => {
      if (!originalUrlRef.current) return;
      setIsProcessing(true);
      setErrorMessage(null);

      try {
        let img = loadedImageRef.current;
        if (!img || !img.complete || img.naturalWidth === 0) {
          img = new Image();
          await new Promise<void>((resolve, reject) => {
            if (!img) return reject();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = originalUrlRef.current!;
          });
          loadedImageRef.current = img;
        }

        if (!img || img.naturalWidth === 0) {
          throw new Error('Image source is missing or invalid');
        }

        // Mobile memory guard: Clamp dimensions to prevent iOS Safari 4096px canvas limit crashes
        const maxDim = 4096;
        let targetW = img.naturalWidth;
        let targetH = img.naturalHeight;
        if (targetW > maxDim || targetH > maxDim) {
          const ratio = Math.min(maxDim / targetW, maxDim / targetH);
          targetW = Math.round(targetW * ratio);
          targetH = Math.round(targetH * ratio);
        }

        // Create off-screen canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get Canvas 2D context');
        }

        // 1. Clear any previous canvas artifacts
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. CORRECTION CRUCIALE 1 : GESTION DE LA TRANSPARENCE
        // Si le format cible est JPG (image/jpeg), remplir obligatoirement
        // le fond avec du blanc (#ffffff) pour que la transparence ne devienne pas noire !
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 3. Dessiner l'image sur le canvas
        ctx.drawImage(img, 0, 0, targetW, targetH);

        // Quality: 0.95 for JPG/WebP (PNG is lossless and ignores quality parameter)
        const quality = format === 'image/png' ? undefined : 0.95;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), format, quality);
        });

        // CRITICAL MEMORY CLEANUP: Release canvas buffer from GPU memory
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;

        if (blob) {
          safelySetConvertedUrl(blob);
        } else {
          throw new Error('Canvas toBlob conversion failed');
        }
      } catch (err) {
        console.error('Conversion error:', err);
        setErrorMessage(t('tools.convert.errorProcessing'));
      } finally {
        setIsProcessing(false);
      }
    },
    [safelySetConvertedUrl, t]
  );

  // CORRECTION CRUCIALE 2 : RÉACTIVITÉ AUTOMATIQUE (RE-RENDER)
  // Utilisation d'un useEffect sur la variable targetFormat
  // La conversion se relance automatiquement dès que l'utilisateur choisit un nouveau format !
  useEffect(() => {
    if (originalFile && originalUrl) {
      executeConversion(targetFormat);
    }
  }, [targetFormat, originalFile, originalUrl, executeConversion]);

  // Validation
  const isValidImage = (file: File): boolean => {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const mimeOk = validMimes.includes(file.type.toLowerCase());
    const extOk = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    return mimeOk || extOk;
  };

  // Process selected file
  const processSelectedFile = async (file: File) => {
    if (!isValidImage(file)) {
      setErrorMessage(t('tools.convert.errorInvalidType'));
      return;
    }

    setErrorMessage(null);

    // Clean previous URLs
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
    }
    safelySetConvertedUrl(null);

    const newUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      loadedImageRef.current = img;
      setOriginalFile(file);
      setOriginalMeta({
        name: file.name,
        type: file.type || 'image/jpeg',
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setOriginalUrl(newUrl);

      // Intelligent default target format based on uploaded file:
      // If uploading JPEG -> default to PNG
      // If uploading PNG -> default to WebP
      // If uploading WebP -> default to PNG
      let nextTarget: SupportedFormat = 'image/jpeg';
      if (file.type === 'image/jpeg') {
        nextTarget = 'image/png';
      } else if (file.type === 'image/png') {
        nextTarget = 'image/webp';
      } else {
        nextTarget = 'image/png';
      }
      setTargetFormat(nextTarget);
      // Notice: the useEffect([targetFormat, ...]) will trigger the conversion!
    };

    img.onerror = () => {
      setErrorMessage(t('tools.convert.errorProcessing'));
      URL.revokeObjectURL(newUrl);
    };

    img.src = newUrl;
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

  // CORRECTION CRUCIALE 3 : EXTENSION EXACTE DU FICHIER TÉLÉCHARGÉ
  // Remplace l'extension d'origine (.png, .jpg, .webp, etc.) par l'extension exacte du format choisi
  const handleDownload = () => {
    if (!convertedBlob || !convertedUrl || !originalMeta) return;

    // Exact extension mapping
    const extensionMap: Record<SupportedFormat, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    const targetExt = extensionMap[targetFormat] || '.jpg';

    // Extraction du nom de base sans l'ancienne extension
    const originalName = originalMeta.name;
    const lastDotIndex = originalName.lastIndexOf('.');
    const baseName = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;

    // Nouveau nom complet avec la nouvelle extension
    const downloadFileName = `${baseName}-converted${targetExt}`;

    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Formats lisibles
  const getReadableFormat = (mimeType: string) => {
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPG';
    if (mimeType.includes('png')) return 'PNG';
    if (mimeType.includes('webp')) return 'WebP';
    return 'Image';
  };

  const originalSize = originalMeta?.size || 0;
  const originalFormatBadge = originalMeta ? getReadableFormat(originalMeta.type) : '';
  const targetOption = FORMAT_OPTIONS.find((f) => f.mime === targetFormat) || FORMAT_OPTIONS[0];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <SEO pageKey="convert" canonicalPath="/convert" />
      
      {/* Header section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('tools.convert.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark tracking-tight font-sans">
          {t('tools.convert.title')}
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
          {t('tools.convert.description')}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Interactive Work Area */}
      {!originalFile ? (
        /* STEP 1: Upload Dropzone */
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
                  {isDragging ? t('tools.convert.dropzoneActive') : t('tools.convert.dropzoneTitle')}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {t('tools.convert.dropzoneSubtitle')}
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
                <span>{t('tools.convert.selectImageBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: Target Format Selection (Select & Buttons), Previews & Download */
        <div className="space-y-6">
          
          {/* Top Bar: File Info & Reset */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <FileImage className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-dark text-base sm:text-lg line-clamp-1">
                  {originalMeta?.name}
                </h4>
                <div dir="ltr" className="flex items-center gap-2 text-xs text-slate-500 font-medium font-mono">
                  <span>{formatBytes(originalSize)}</span>
                  <span>•</span>
                  <span>{originalMeta?.width} × {originalMeta?.height} px</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                    {originalFormatBadge}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>{t('tools.convert.changeImage')}</span>
            </button>
          </div>

          {/* Format Selection Card with SELECT dropdown and Quick Click Options */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-dark">
                    {t('tools.convert.targetFormatLabel')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t('tools.convert.targetFormatDescription')}
                </p>
              </div>

              {/* Format Badge Indicator */}
              <div dir="ltr" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-base font-mono self-start sm:self-auto">
                <span>{originalFormatBadge}</span>
                <ArrowRight className="w-4 h-4" />
                <span className="text-secondary">{targetOption.badge}</span>
              </div>
            </div>

            {/* Menu Déroulant (SELECT) pour changer de format */}
            <div className="space-y-2">
              <label htmlFor="target-format-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Choisir le format de destination :
              </label>
              <div className="relative">
                <select
                  id="target-format-select"
                  aria-label="Format de destination"
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as SupportedFormat)}
                  className="w-full appearance-none px-4 py-3.5 pe-10 rounded-2xl border-2 border-slate-200 bg-slate-50/80 font-bold text-base text-dark hover:border-primary focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/20 outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="image/jpeg">📸 JPG / JPEG (.jpg) — Idéal photos (fond blanc opaque)</option>
                  <option value="image/png">🖼️ PNG (.png) — Sans perte avec transparence</option>
                  <option value="image/webp">🌐 WebP (.webp) — Léger & moderne avec transparence</option>
                </select>
                <div className="absolute inset-y-0 end-0 flex items-center pe-4 pointer-events-none text-primary">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Boutons d'accès rapide 1-clic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {FORMAT_OPTIONS.map((opt) => {
                const isSelected = targetFormat === opt.mime;
                return (
                  <button
                    key={opt.mime}
                    type="button"
                    onClick={() => setTargetFormat(opt.mime)}
                    className={`p-4 rounded-2xl border text-start transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/30'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-base text-dark font-sans">
                        {opt.label}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300" />
                      )}
                    </div>

                    <div className="mt-2 text-xs text-slate-500 font-medium">
                      {opt.supportsAlpha ? 'Transparence conservée' : 'Fond blanc automatique'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Smart Transparency Notice (Shown when converting to JPG) */}
            {targetFormat === 'image/jpeg' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-800 text-xs sm:text-sm font-medium flex items-center gap-2.5">
                <Info className="w-4 h-4 flex-shrink-0 text-amber-600" />
                <span>{t('tools.convert.whiteBgNotice')}</span>
              </div>
            )}
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* 1: Original Format */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('tools.convert.originalFormat')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-slate-800 font-mono">
                  {originalFormatBadge}
                </span>
              </div>
            </div>

            {/* 2: Converted Target Format */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>{t('tools.convert.convertedFormat')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-primary font-mono">
                  {targetOption.badge}
                </span>
              </div>
            </div>

            {/* 3: Original Size */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('tools.convert.originalSize')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-slate-800 font-mono">
                  {formatBytes(originalSize)}
                </span>
              </div>
            </div>

            {/* 4: Converted Size */}
            <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-primary" />
                <span>{t('tools.convert.convertedSize')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                {isProcessing ? (
                  <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conversion...</span>
                  </span>
                ) : (
                  <span className="text-lg sm:text-2xl font-bold text-primary font-mono">
                    {formatBytes(convertedSize)}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Comparative Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Original Preview Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="font-bold text-sm text-slate-700">
                    {t('tools.convert.originalPreview')}
                  </span>
                </div>
                <div dir="ltr" className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono">
                    {originalFormatBadge}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
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
            </div>

            {/* Converted Preview Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-bold text-sm text-primary">
                    {t('tools.convert.convertedPreview')}
                  </span>
                </div>
                <div dir="ltr" className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/20 text-primary font-mono">
                    {targetOption.badge}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-mono">
                    {formatBytes(convertedSize)}
                  </span>
                </div>
              </div>

              <div className="relative p-4 flex-1 flex items-center justify-center bg-slate-100/50 min-h-[260px] sm:min-h-[320px]">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-sm font-semibold text-slate-600">
                      {t('tools.convert.processing')}
                    </span>
                  </div>
                ) : convertedUrl ? (
                  <img
                    src={convertedUrl}
                    alt="Converted Preview"
                    className="max-h-72 w-auto object-contain rounded-xl shadow-sm border border-slate-200/80"
                  />
                ) : null}
              </div>
            </div>

          </div>

          {/* Action & Download Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-start">
              <h4 className="font-bold text-dark text-base sm:text-lg">
                {t('tools.convert.readyStatus')}
              </h4>
              <div dir="ltr" className="text-xs sm:text-sm text-slate-500 font-mono inline-flex items-center gap-2">
                <span className="font-bold text-slate-700">{originalFormatBadge} ({formatBytes(originalSize)})</span>
                <span>→</span>
                <strong className="text-primary font-bold">{targetOption.badge} ({formatBytes(convertedSize)})</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isProcessing || !convertedUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-primary to-secondary hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-primary/25 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>{t('tools.convert.downloadBtn')}</span>
            </button>
          </div>

        </div>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Conversion Instantanée</h4>
            <p className="text-xs text-slate-500 mt-0.5">Encodage immédiat en mémoire vive via Canvas.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Confidentialité Totale</h4>
            <p className="text-xs text-slate-500 mt-0.5">Vos images ne sont jamais téléchargées sur un serveur.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Gestion de la Transparence</h4>
            <p className="text-xs text-slate-500 mt-0.5">Traitement intelligent du canal alpha selon le format.</p>
          </div>
        </div>
      </div>

      {/* Enrichissement du contenu SEO & Anti-Thin Content */}
      <ToolInfoSection toolId="convert" />

    </div>
  );
};
