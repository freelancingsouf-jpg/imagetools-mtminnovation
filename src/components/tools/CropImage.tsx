import { useState, useRef, useEffect, useCallback, type FC, type DragEvent, type ChangeEvent, type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { SEO } from '../SEO';
import { ToolInfoSection } from '../ToolInfoSection';
import {
  UploadCloud,
  FileImage,
  Crop as CropIcon,
  Sparkles,
  Download,
  RotateCcw,
  AlertCircle,
  Loader2,
  HardDrive,
  Maximize2,
  CheckCircle2,
  Square,
  Ratio,
  Maximize
} from 'lucide-react';
import { formatBytes } from './CompressImage';

interface ImageMetadata {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
}

interface AspectRatioOption {
  labelKey: string;
  val: number | undefined;
  icon: typeof CropIcon;
  badge: string;
}

const ASPECT_RATIO_PRESETS: AspectRatioOption[] = [
  { labelKey: 'tools.crop.ratioFree', val: undefined, icon: CropIcon, badge: 'Libre' },
  { labelKey: 'tools.crop.ratio1x1', val: 1, icon: Square, badge: '1:1' },
  { labelKey: 'tools.crop.ratio16x9', val: 16 / 9, icon: Maximize, badge: '16:9' },
  { labelKey: 'tools.crop.ratio4x3', val: 4 / 3, icon: Ratio, badge: '4:3' },
  { labelKey: 'tools.crop.ratio9x16', val: 9 / 16, icon: Ratio, badge: '9:16' },
];

export const CropImage: FC = () => {
  const { t } = useTranslation();

  // File states
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalMeta, setOriginalMeta] = useState<ImageMetadata | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  // Crop states
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);

  // Cropped result states
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [croppedSize, setCroppedSize] = useState<number>(0);
  const [croppedDimensions, setCroppedDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Status & UI
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const originalUrlRef = useRef<string | null>(null);
  const croppedUrlRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync ref pointers for memory safety
  useEffect(() => {
    originalUrlRef.current = originalUrl;
  }, [originalUrl]);

  useEffect(() => {
    croppedUrlRef.current = croppedUrl;
  }, [croppedUrl]);

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }
      if (croppedUrlRef.current) {
        URL.revokeObjectURL(croppedUrlRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Safe setter for cropped Blob & Object URL
  const safelySetCroppedUrl = useCallback((newBlob: Blob | null, width = 0, height = 0) => {
    if (croppedUrlRef.current) {
      URL.revokeObjectURL(croppedUrlRef.current);
      croppedUrlRef.current = null;
    }

    if (newBlob) {
      const url = URL.createObjectURL(newBlob);
      setCroppedUrl(url);
      setCroppedBlob(newBlob);
      setCroppedSize(newBlob.size);
      setCroppedDimensions({ width, height });
    } else {
      setCroppedUrl(null);
      setCroppedBlob(null);
      setCroppedSize(0);
      setCroppedDimensions({ width: 0, height: 0 });
    }
  }, []);

  // Full reset
  const handleReset = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    if (croppedUrlRef.current) {
      URL.revokeObjectURL(croppedUrlRef.current);
      croppedUrlRef.current = null;
    }

    imgRef.current = null;
    setOriginalFile(null);
    setOriginalMeta(null);
    setOriginalUrl(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setAspect(undefined);
    safelySetCroppedUrl(null);
    setErrorMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [safelySetCroppedUrl]);

  // Canvas Crop Extraction (100% Client-Side)
  const executeCanvasCrop = useCallback(
    async (pixelCrop: PixelCrop, file: File) => {
      const image = imgRef.current;
      if (!image || !pixelCrop.width || !pixelCrop.height) return;

      setIsProcessing(true);
      setErrorMessage(null);

      try {
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const targetW = Math.max(1, Math.round(pixelCrop.width * scaleX));
        const targetH = Math.max(1, Math.round(pixelCrop.height * scaleY));

        // Mobile memory guard: Clamp dimensions to prevent iOS Safari 4096px canvas limit crashes
        const maxDim = 4096;
        let finalW = targetW;
        let finalH = targetH;
        if (finalW > maxDim || finalH > maxDim) {
          const ratio = Math.min(maxDim / finalW, maxDim / finalH);
          finalW = Math.round(finalW * ratio);
          finalH = Math.round(finalH * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = finalW;
        canvas.height = finalH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw only selected crop portion from the source image
        ctx.drawImage(
          image,
          Math.round(pixelCrop.x * scaleX),
          Math.round(pixelCrop.y * scaleY),
          targetW,
          targetH,
          0,
          0,
          finalW,
          finalH
        );

        const outputType = file.type || 'image/jpeg';
        const quality = outputType === 'image/png' ? undefined : 0.95;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), outputType, quality);
        });

        // CRITICAL MEMORY CLEANUP: Release canvas buffer from GPU memory
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;

        if (blob) {
          safelySetCroppedUrl(blob, targetW, targetH);
        } else {
          throw new Error('Canvas extraction failed');
        }
      } catch (err) {
        console.error('Crop extraction error:', err);
        setErrorMessage(t('tools.crop.errorProcessing'));
      } finally {
        setIsProcessing(false);
      }
    },
    [safelySetCroppedUrl, t]
  );

  // Auto-generate cropped preview whenever completedCrop changes
  useEffect(() => {
    if (!originalFile || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeCanvasCrop(completedCrop, originalFile);
    }, 200);
  }, [completedCrop, originalFile, executeCanvasCrop]);

  // Initial crop setup when image loads in ReactCrop
  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    imgRef.current = e.currentTarget;

    setOriginalMeta((prev) =>
      prev
        ? { ...prev, width: naturalWidth, height: naturalHeight }
        : null
    );

    // Centered crop (80% of current viewport width & height)
    const initialCrop: PixelCrop = {
      unit: 'px',
      x: Math.round(width * 0.1),
      y: Math.round(height * 0.1),
      width: Math.round(width * 0.8),
      height: Math.round(height * 0.8),
    };

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  // Change Aspect Ratio
  const handleSelectAspect = (newAspect: number | undefined) => {
    setAspect(newAspect);

    const image = imgRef.current;
    if (!image) return;

    if (newAspect) {
      const newCrop = centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 80,
          },
          newAspect,
          image.width,
          image.height
        ),
        image.width,
        image.height
      );
      setCrop(newCrop);
      // Convert percent crop to pixel crop
      const pixelCrop: PixelCrop = {
        unit: 'px',
        x: Math.round((newCrop.x / 100) * image.width),
        y: Math.round((newCrop.y / 100) * image.height),
        width: Math.round((newCrop.width / 100) * image.width),
        height: Math.round((newCrop.height / 100) * image.height),
      };
      setCompletedCrop(pixelCrop);
    }
  };

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
      setErrorMessage(t('tools.crop.errorInvalidType'));
      return;
    }

    setErrorMessage(null);

    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
    }
    safelySetCroppedUrl(null);

    const newUrl = URL.createObjectURL(file);

    setOriginalFile(file);
    setOriginalMeta({
      name: file.name,
      type: file.type || 'image/jpeg',
      size: file.size,
      width: 0,
      height: 0,
    });
    setOriginalUrl(newUrl);
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

  // Download Cropped Image
  const handleDownload = () => {
    if (!croppedBlob || !croppedUrl || !originalMeta) return;

    const originalName = originalMeta.name;
    const lastDotIndex = originalName.lastIndexOf('.');
    const baseName = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
    const extension = lastDotIndex > 0 ? originalName.substring(lastDotIndex) : '.jpg';
    const downloadFileName = `${baseName}-cropped-${croppedDimensions.width}x${croppedDimensions.height}${extension}`;

    const link = document.createElement('a');
    link.href = croppedUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const originalSize = originalMeta?.size || 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <SEO pageKey="crop" canonicalPath="/crop" />
      
      {/* Header section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('tools.crop.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark tracking-tight font-sans">
          {t('tools.crop.title')}
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
          {t('tools.crop.description')}
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
                ? 'border-secondary bg-secondary/5 scale-[1.01]'
                : 'border-slate-300 hover:border-secondary hover:bg-slate-50/70'
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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-secondary/15 to-primary/15 flex items-center justify-center text-secondary group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-secondary group-hover:to-primary group-hover:text-white transition-all duration-300 shadow-inner">
                <UploadCloud className="w-10 h-10 transition-colors" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-dark group-hover:text-secondary transition-colors">
                  {isDragging ? t('tools.crop.dropzoneActive') : t('tools.crop.dropzoneTitle')}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {t('tools.crop.dropzoneSubtitle')}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-secondary to-primary hover:opacity-95 active:scale-95 text-white font-semibold text-sm shadow-md shadow-secondary/25 transition-all"
              >
                <FileImage className="w-4 h-4" />
                <span>{t('tools.crop.selectImageBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: Aspect Ratio Buttons, ReactCrop Interactive Area, Previews & Download */
        <div className="space-y-6">
          
          {/* Top Bar: File Info & Reset */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
                <FileImage className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-dark text-base sm:text-lg line-clamp-1">
                  {originalMeta?.name}
                </h4>
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
              <span>{t('tools.crop.changeImage')}</span>
            </button>
          </div>

          {/* Aspect Ratio Presets Bar */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <CropIcon className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-bold text-dark">
                    {t('tools.crop.aspectRatiosLabel')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t('tools.crop.aspectRatiosDescription')}
                </p>
              </div>

              {/* Current Aspect Badge */}
              <div dir="ltr" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary font-bold text-sm font-mono self-start sm:self-auto">
                <span>{aspect ? `${aspect.toFixed(2)}:1` : 'Libre'}</span>
              </div>
            </div>

            {/* Quick Ratio Buttons */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {ASPECT_RATIO_PRESETS.map((preset) => {
                const isSelected = aspect === preset.val;
                return (
                  <button
                    key={preset.badge}
                    type="button"
                    onClick={() => handleSelectAspect(preset.val)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      isSelected
                        ? 'bg-secondary text-white border-secondary shadow-md shadow-secondary/20 ring-2 ring-secondary/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <preset.icon className="w-4 h-4" />
                    <span>{t(preset.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive ReactCrop Workspace */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-dark flex items-center gap-2">
                <CropIcon className="w-4 h-4 text-secondary" />
                <span>{t('tools.crop.originalPreview')}</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {t('tools.crop.cropInstructions')}
              </span>
            </div>

            <div className="flex items-center justify-center p-4 rounded-2xl bg-slate-100/70 border border-slate-200/80 min-h-[300px] overflow-hidden">
              {originalUrl && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  className="max-h-[500px] max-w-full rounded-xl shadow-md border border-slate-300/80"
                >
                  <img
                    ref={imgRef}
                    src={originalUrl}
                    alt="Source to Crop"
                    onLoad={onImageLoad}
                    className="max-h-[500px] w-auto object-contain block select-none"
                  />
                </ReactCrop>
              )}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* 1: Original Dimensions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Dimensions d’origine</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-slate-800 font-mono">
                  {originalMeta?.width} × {originalMeta?.height}
                </span>
              </div>
            </div>

            {/* 2: Cropped Dimensions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <CropIcon className="w-3.5 h-3.5 text-secondary" />
                <span>{t('tools.crop.croppedDimensions')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-secondary font-mono">
                  {croppedDimensions.width} × {croppedDimensions.height} px
                </span>
              </div>
            </div>

            {/* 3: Original Size */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Poids d’origine</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-slate-800 font-mono">
                  {formatBytes(originalSize)}
                </span>
              </div>
            </div>

            {/* 4: Cropped File Size */}
            <div className="p-4 sm:p-5 rounded-2xl bg-secondary/5 border border-secondary/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-secondary" />
                <span>{t('tools.crop.croppedSize')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                {isProcessing ? (
                  <span className="inline-flex items-center gap-1.5 text-secondary text-sm font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calcul...</span>
                  </span>
                ) : (
                  <span className="text-lg sm:text-2xl font-bold text-secondary font-mono">
                    {formatBytes(croppedSize)}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Cropped Preview Card */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 bg-secondary/5 border-b border-secondary/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-bold text-sm text-secondary">
                  {t('tools.crop.croppedPreview')}
                </span>
              </div>
              <div dir="ltr">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-secondary/15 text-secondary font-mono">
                  {croppedDimensions.width} × {croppedDimensions.height} px
                </span>
              </div>
            </div>

            <div className="relative p-6 flex-1 flex items-center justify-center bg-slate-100/50 min-h-[220px]">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-secondary animate-spin" />
                  <span className="text-sm font-semibold text-slate-600">
                    {t('tools.crop.processing')}
                  </span>
                </div>
              ) : croppedUrl ? (
                <img
                  src={croppedUrl}
                  alt="Cropped Preview"
                  className="max-h-80 w-auto object-contain rounded-xl shadow-md border border-slate-200/80"
                />
              ) : null}
            </div>
          </div>

          {/* Action & Download Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-start">
              <h4 className="font-bold text-dark text-base sm:text-lg">
                {t('tools.crop.readyStatus')}
              </h4>
              <div dir="ltr" className="text-xs sm:text-sm text-slate-500 font-mono inline-flex items-center gap-2">
                <span>{originalMeta?.width} × {originalMeta?.height} px</span>
                <span>→</span>
                <strong className="text-secondary">{croppedDimensions.width} × {croppedDimensions.height} px</strong>
                <span className="text-slate-600 font-semibold">({formatBytes(croppedSize)})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isProcessing || !croppedUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-secondary via-secondary to-primary hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-secondary/25 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>{t('tools.crop.downloadBtn')}</span>
            </button>
          </div>

        </div>
      )}

      {/* Trust Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Précision au Pixel près</h4>
            <p className="text-xs text-slate-500 mt-0.5">Extraction exacte des coordonnées de l’image source.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">100% Client-Side</h4>
            <p className="text-xs text-slate-500 mt-0.5">Aucune donnée n’est transmise à un serveur externe.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
            <Square className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Ratios Prédéfinis</h4>
            <p className="text-xs text-slate-500 mt-0.5">Formats optimisés pour les réseaux sociaux (1:1, 16:9, etc.).</p>
          </div>
        </div>
      </div>

      {/* Enrichissement du contenu SEO & Anti-Thin Content */}
      <ToolInfoSection toolId="crop" />

    </div>
  );
};
