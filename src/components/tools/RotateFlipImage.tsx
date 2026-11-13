import { useState, useRef, useEffect, useCallback, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UploadCloud,
  FileImage,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Rotate3d,
  Sparkles,
  Download,
  AlertCircle,
  Loader2,
  HardDrive,
  Maximize2,
  CheckCircle2,
  Undo2
} from 'lucide-react';
import { formatBytes } from './CompressImage';

interface ImageMetadata {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
}

export const RotateFlipImage: FC = () => {
  const { t } = useTranslation();

  // File states
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalMeta, setOriginalMeta] = useState<ImageMetadata | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  // Cumulative Transformation states
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Result states
  const [transformedBlob, setTransformedBlob] = useState<Blob | null>(null);
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null);
  const [transformedSize, setTransformedSize] = useState<number>(0);
  const [transformedDimensions, setTransformedDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Status & UI
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalUrlRef = useRef<string | null>(null);
  const transformedUrlRef = useRef<string | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync ref pointers for memory cleanup
  useEffect(() => {
    originalUrlRef.current = originalUrl;
  }, [originalUrl]);

  useEffect(() => {
    transformedUrlRef.current = transformedUrl;
  }, [transformedUrl]);

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }
      if (transformedUrlRef.current) {
        URL.revokeObjectURL(transformedUrlRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Safe setter for transformed Blob & Object URL
  const safelySetTransformedUrl = useCallback((newBlob: Blob | null, width = 0, height = 0) => {
    if (transformedUrlRef.current) {
      URL.revokeObjectURL(transformedUrlRef.current);
      transformedUrlRef.current = null;
    }

    if (newBlob) {
      const url = URL.createObjectURL(newBlob);
      setTransformedUrl(url);
      setTransformedBlob(newBlob);
      setTransformedSize(newBlob.size);
      setTransformedDimensions({ width, height });
    } else {
      setTransformedUrl(null);
      setTransformedBlob(null);
      setTransformedSize(0);
      setTransformedDimensions({ width: 0, height: 0 });
    }
  }, []);

  // Full reset
  const handleFullReset = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    if (transformedUrlRef.current) {
      URL.revokeObjectURL(transformedUrlRef.current);
      transformedUrlRef.current = null;
    }

    loadedImageRef.current = null;
    setOriginalFile(null);
    setOriginalMeta(null);
    setOriginalUrl(null);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    safelySetTransformedUrl(null);
    setErrorMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [safelySetTransformedUrl]);

  // Reset only transforms (keeps current image)
  const handleResetTransforms = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  // Core Canvas Transformation Logic (100% Client-Side)
  // Uses ctx.translate, ctx.rotate, ctx.scale cumulatively
  const executeCanvasTransform = useCallback(
    async (rot: number, fH: boolean, fV: boolean, file: File) => {
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
          throw new Error('Image source is missing');
        }

        const normRotation = ((rot % 360) + 360) % 360;
        const is90or270 = normRotation === 90 || normRotation === 270;

        // When rotated 90 or 270 deg, canvas width and height swap!
        const targetWidth = is90or270 ? img.naturalHeight : img.naturalWidth;
        const targetHeight = is90or270 ? img.naturalWidth : img.naturalHeight;

        // Mobile memory guard: Clamp dimensions to prevent iOS Safari 4096px canvas limit crashes
        const maxDim = 4096;
        let tW = targetWidth;
        let tH = targetHeight;
        let scaleFactor = 1;
        if (tW > maxDim || tH > maxDim) {
          scaleFactor = Math.min(maxDim / tW, maxDim / tH);
          tW = Math.round(tW * scaleFactor);
          tH = Math.round(tH * scaleFactor);
        }

        const canvas = document.createElement('canvas');
        canvas.width = tW;
        canvas.height = tH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context unavailable');
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 1. Move origin to center of new canvas bounds
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // 2. Rotate by normalized angle in radians
        ctx.rotate((normRotation * Math.PI) / 180);

        // 3. Apply mirror scale (Flip H / Flip V)
        ctx.scale((fH ? -1 : 1) * scaleFactor, (fV ? -1 : 1) * scaleFactor);

        // 4. Draw image centered around the origin
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

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
          safelySetTransformedUrl(blob, targetWidth, targetHeight);
        } else {
          throw new Error('Canvas transform failed');
        }
      } catch (err) {
        console.error('Transform error:', err);
        setErrorMessage(t('tools.rotateFlip.errorProcessing'));
      } finally {
        setIsProcessing(false);
      }
    },
    [safelySetTransformedUrl, t]
  );

  // Automatic real-time re-rendering on transformation state change
  useEffect(() => {
    if (!originalFile || !originalUrl) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeCanvasTransform(rotation, flipH, flipV, originalFile);
    }, 150);
  }, [rotation, flipH, flipV, originalFile, originalUrl, executeCanvasTransform]);

  // Transformation Action Handlers
  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleToggleFlipH = () => {
    setFlipH((prev) => !prev);
  };

  const handleToggleFlipV = () => {
    setFlipV((prev) => !prev);
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
      setErrorMessage(t('tools.rotateFlip.errorInvalidType'));
      return;
    }

    setErrorMessage(null);

    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
    }
    safelySetTransformedUrl(null);

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
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      executeCanvasTransform(0, false, false, file);
    };

    img.onerror = () => {
      setErrorMessage(t('tools.rotateFlip.errorProcessing'));
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

  // Download Transformed Image
  const handleDownload = () => {
    if (!transformedBlob || !transformedUrl || !originalMeta) return;

    const originalName = originalMeta.name;
    const lastDotIndex = originalName.lastIndexOf('.');
    const baseName = lastDotIndex > 0 ? originalName.substring(0, lastDotIndex) : originalName;
    const extension = lastDotIndex > 0 ? originalName.substring(lastDotIndex) : '.jpg';

    const tags: string[] = [];
    if (rotation !== 0) tags.push(`${rotation}deg`);
    if (flipH) tags.push('flipH');
    if (flipV) tags.push('flipV');
    const suffix = tags.length > 0 ? `-${tags.join('-')}` : '-transformed';

    const downloadFileName = `${baseName}${suffix}${extension}`;

    const link = document.createElement('a');
    link.href = transformedUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const originalSize = originalMeta?.size || 0;
  const hasModifications = rotation !== 0 || flipH || flipV;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('tools.rotateFlip.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark tracking-tight font-sans">
          {t('tools.rotateFlip.title')}
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
          {t('tools.rotateFlip.description')}
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
                  {isDragging ? t('tools.rotateFlip.dropzoneActive') : t('tools.rotateFlip.dropzoneTitle')}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {t('tools.rotateFlip.dropzoneSubtitle')}
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
                <span>{t('tools.rotateFlip.selectImageBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: Rotate & Flip Action Controls, Previews & Download */
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
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFullReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>{t('tools.rotateFlip.changeImage')}</span>
            </button>
          </div>

          {/* Transformation Controls Card (Buttons) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Rotate3d className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-dark">
                    {t('tools.rotateFlip.controlsTitle')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t('tools.rotateFlip.controlsDescription')}
                </p>
              </div>

              {/* Status indicators */}
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <div dir="ltr" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm font-mono">
                  <span>{rotation}°</span>
                </div>
                {flipH && (
                  <span className="px-2.5 py-1 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold">
                    Flip H
                  </span>
                )}
                {flipV && (
                  <span className="px-2.5 py-1 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold">
                    Flip V
                  </span>
                )}
                {hasModifications && (
                  <button
                    type="button"
                    onClick={handleResetTransforms}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>{t('tools.rotateFlip.resetTransform')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              
              {/* 1: Rotation Droite (+90°) */}
              <button
                type="button"
                onClick={handleRotateRight}
                className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-primary/5 hover:border-primary/40 hover:text-primary active:scale-95 transition-all text-slate-800 group shadow-sm"
              >
                <div className="p-3 rounded-xl bg-white border border-slate-200 group-hover:border-primary/30 group-hover:bg-primary/10 text-primary transition-all">
                  <RotateCw className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-center">
                  {t('tools.rotateFlip.rotateRight')}
                </span>
              </button>

              {/* 2: Rotation Gauche (-90°) */}
              <button
                type="button"
                onClick={handleRotateLeft}
                className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-primary/5 hover:border-primary/40 hover:text-primary active:scale-95 transition-all text-slate-800 group shadow-sm"
              >
                <div className="p-3 rounded-xl bg-white border border-slate-200 group-hover:border-primary/30 group-hover:bg-primary/10 text-primary transition-all">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-center">
                  {t('tools.rotateFlip.rotateLeft')}
                </span>
              </button>

              {/* 3: Miroir Horizontal (Flip H) */}
              <button
                type="button"
                onClick={handleToggleFlipH}
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all active:scale-95 shadow-sm group ${
                  flipH
                    ? 'border-secondary bg-secondary/10 text-secondary ring-2 ring-secondary/30'
                    : 'border-slate-200 bg-slate-50 hover:bg-secondary/5 hover:border-secondary/40 text-slate-800'
                }`}
              >
                <div className={`p-3 rounded-xl border transition-all ${
                  flipH
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-white border-slate-200 text-secondary group-hover:bg-secondary/10'
                }`}>
                  <FlipHorizontal className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-center">
                  {t('tools.rotateFlip.flipH')}
                </span>
              </button>

              {/* 4: Miroir Vertical (Flip V) */}
              <button
                type="button"
                onClick={handleToggleFlipV}
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all active:scale-95 shadow-sm group ${
                  flipV
                    ? 'border-secondary bg-secondary/10 text-secondary ring-2 ring-secondary/30'
                    : 'border-slate-200 bg-slate-50 hover:bg-secondary/5 hover:border-secondary/40 text-slate-800'
                }`}
              >
                <div className={`p-3 rounded-xl border transition-all ${
                  flipV
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-white border-slate-200 text-secondary group-hover:bg-secondary/10'
                }`}>
                  <FlipVertical className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-center">
                  {t('tools.rotateFlip.flipV')}
                </span>
              </button>

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

            {/* 2: Transformed Dimensions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Rotate3d className="w-3.5 h-3.5 text-primary" />
                <span>{t('tools.rotateFlip.dimensions')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-primary font-mono">
                  {transformedDimensions.width} × {transformedDimensions.height} px
                </span>
              </div>
            </div>

            {/* 3: Angle actuel */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-secondary" />
                <span>{t('tools.rotateFlip.currentAngle')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-secondary font-mono">
                  {rotation}°
                </span>
              </div>
            </div>

            {/* 4: File Size */}
            <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-primary" />
                <span>{t('tools.rotateFlip.size')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                {isProcessing ? (
                  <span className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calcul...</span>
                  </span>
                ) : (
                  <span className="text-lg sm:text-2xl font-bold text-primary font-mono">
                    {formatBytes(transformedSize || originalSize)}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Comparative Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Original Source Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="font-bold text-sm text-slate-700">
                    {t('tools.rotateFlip.originalPreview')}
                  </span>
                </div>
                <div dir="ltr">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono">
                    {originalMeta?.width} × {originalMeta?.height} px
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

            {/* Transformed Result Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                  <span className="font-bold text-sm text-primary">
                    {t('tools.rotateFlip.transformedPreview')}
                  </span>
                </div>
                <div dir="ltr" className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/20 text-primary font-mono">
                    {transformedDimensions.width} × {transformedDimensions.height} px
                  </span>
                </div>
              </div>

              <div className="relative p-4 flex-1 flex items-center justify-center bg-slate-100/50 min-h-[260px] sm:min-h-[320px]">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <span className="text-sm font-semibold text-slate-600">
                      {t('tools.rotateFlip.processing')}
                    </span>
                  </div>
                ) : transformedUrl ? (
                  <img
                    src={transformedUrl}
                    alt="Transformed Preview"
                    className="max-h-72 w-auto object-contain rounded-xl shadow-md border border-slate-200/80 transition-all duration-200"
                  />
                ) : null}
              </div>
            </div>

          </div>

          {/* Action & Download Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-start">
              <h4 className="font-bold text-dark text-base sm:text-lg">
                {t('tools.rotateFlip.readyStatus')}
              </h4>
              <div dir="ltr" className="text-xs sm:text-sm text-slate-500 font-mono inline-flex items-center gap-2">
                <span>{originalMeta?.width} × {originalMeta?.height} px</span>
                <span>→</span>
                <strong className="text-primary">{transformedDimensions.width} × {transformedDimensions.height} px</strong>
                <span className="text-slate-600 font-semibold">({formatBytes(transformedSize)})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isProcessing || !transformedUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-primary to-secondary hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-primary/25 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>{t('tools.rotateFlip.downloadBtn')}</span>
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
            <h4 className="font-bold text-dark text-sm">Transformations Cumulatives</h4>
            <p className="text-xs text-slate-500 mt-0.5">Combinez plusieurs rotations et inversions sans perte.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">100% Client-Side</h4>
            <p className="text-xs text-slate-500 mt-0.5">Calcul matriciel Canvas instantané sur votre appareil.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Rotate3d className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Conservation du Ratio</h4>
            <p className="text-xs text-slate-500 mt-0.5">Adaptation automatique des dimensions $L \times H$ selon l'angle.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
