import { useState, useRef, useEffect, useCallback, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../SEO';
import { ToolInfoSection } from '../ToolInfoSection';
import {
  UploadCloud,
  FileImage,
  Maximize2,
  Sparkles,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Unlock,
  HardDrive,
  Scaling,
  Percent
} from 'lucide-react';
import { formatBytes } from './CompressImage';

interface ImageMetadata {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
  aspectRatio: number; // width / height
}

export const ResizeImage: FC = () => {
  const { t } = useTranslation();

  // File states
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalMeta, setOriginalMeta] = useState<ImageMetadata | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  // Resize dimension inputs
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);

  // Resized result states
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [resizedSize, setResizedSize] = useState<number>(0);

  // Status & UI
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for cleanup
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalUrlRef = useRef<string | null>(null);
  const resizedUrlRef = useRef<string | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  // Keep ref pointers synchronized
  useEffect(() => {
    originalUrlRef.current = originalUrl;
  }, [originalUrl]);

  useEffect(() => {
    resizedUrlRef.current = resizedUrl;
  }, [resizedUrl]);

  // Clean memory leaks on unmount
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }
      if (resizedUrlRef.current) {
        URL.revokeObjectURL(resizedUrlRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Safe setter for resized Blob & Object URL
  const safelySetResizedUrl = useCallback((newBlob: Blob | null) => {
    if (resizedUrlRef.current) {
      URL.revokeObjectURL(resizedUrlRef.current);
      resizedUrlRef.current = null;
    }

    if (newBlob) {
      const url = URL.createObjectURL(newBlob);
      setResizedUrl(url);
      setResizedBlob(newBlob);
      setResizedSize(newBlob.size);
    } else {
      setResizedUrl(null);
      setResizedBlob(null);
      setResizedSize(0);
    }
  }, []);

  // Full reset
  const handleReset = useCallback(() => {
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    if (resizedUrlRef.current) {
      URL.revokeObjectURL(resizedUrlRef.current);
      resizedUrlRef.current = null;
    }

    loadedImageRef.current = null;
    setOriginalFile(null);
    setOriginalMeta(null);
    setOriginalUrl(null);
    safelySetResizedUrl(null);
    setTargetWidth(0);
    setTargetHeight(0);
    setMaintainAspectRatio(true);
    setErrorMessage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [safelySetResizedUrl]);

  // Core Canvas Resizing Logic (100% Client-Side)
  const executeCanvasResize = useCallback(
    async (width: number, height: number, file: File) => {
      if (width <= 0 || height <= 0) return;
      setIsProcessing(true);
      setErrorMessage(null);

      try {
        let img = loadedImageRef.current;
        if (!img && originalUrlRef.current) {
          img = new Image();
          await new Promise<void>((resolve, reject) => {
            if (!img) return reject();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = originalUrlRef.current!;
          });
          loadedImageRef.current = img;
        }

        if (!img) {
          throw new Error('Image source is missing');
        }

        // Mobile memory guard: Clamp dimensions to prevent iOS Safari 4096px canvas limit crashes
        const maxDim = 4096;
        let finalW = Math.round(width);
        let finalH = Math.round(height);
        if (finalW > maxDim || finalH > maxDim) {
          const ratio = Math.min(maxDim / finalW, maxDim / finalH);
          finalW = Math.round(finalW * ratio);
          finalH = Math.round(finalH * ratio);
        }

        // Create an off-screen Canvas
        const canvas = document.createElement('canvas');
        canvas.width = finalW;
        canvas.height = finalH;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get Canvas 2D context');
        }

        // High quality interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas with target dimensions
        ctx.drawImage(img, 0, 0, finalW, finalH);

        // Determine output MIME type and export blob
        const outputType = file.type || 'image/jpeg';
        const quality = outputType === 'image/png' ? undefined : 0.92;

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), outputType, quality);
        });

        // CRITICAL MEMORY CLEANUP: Release canvas buffer from GPU memory
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;

        if (blob) {
          safelySetResizedUrl(blob);
        } else {
          throw new Error('Canvas toBlob failed');
        }
      } catch (err) {
        console.error('Resize error:', err);
        setErrorMessage(t('tools.resize.errorProcessing'));
      } finally {
        setIsProcessing(false);
      }
    },
    [safelySetResizedUrl, t]
  );

  // Trigger resize with debounce
  const triggerDebouncedResize = useCallback(
    (w: number, h: number) => {
      if (!originalFile || w <= 0 || h <= 0) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        executeCanvasResize(w, h, originalFile);
      }, 300);
    },
    [originalFile, executeCanvasResize]
  );

  // Handle Width input change
  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const newWidth = Math.max(1, parseInt(rawVal, 10) || 0);
    setTargetWidth(newWidth);

    if (maintainAspectRatio && originalMeta && originalMeta.aspectRatio > 0) {
      const calculatedHeight = Math.max(1, Math.round(newWidth / originalMeta.aspectRatio));
      setTargetHeight(calculatedHeight);
      triggerDebouncedResize(newWidth, calculatedHeight);
    } else {
      triggerDebouncedResize(newWidth, targetHeight);
    }
  };

  // Handle Height input change
  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const newHeight = Math.max(1, parseInt(rawVal, 10) || 0);
    setTargetHeight(newHeight);

    if (maintainAspectRatio && originalMeta && originalMeta.aspectRatio > 0) {
      const calculatedWidth = Math.max(1, Math.round(newHeight * originalMeta.aspectRatio));
      setTargetWidth(calculatedWidth);
      triggerDebouncedResize(calculatedWidth, newHeight);
    } else {
      triggerDebouncedResize(targetWidth, newHeight);
    }
  };

  // Quick Preset Scale button (e.g. 25%, 50%, 75%, 100%, 150%, 200%)
  const applyPresetScale = (percentage: number) => {
    if (!originalMeta) return;

    const scale = percentage / 100;
    const newW = Math.max(1, Math.round(originalMeta.width * scale));
    const newH = Math.max(1, Math.round(originalMeta.height * scale));

    setTargetWidth(newW);
    setTargetHeight(newH);
    triggerDebouncedResize(newW, newH);
  };

  // Toggle Maintain Aspect Ratio checkbox
  const handleMaintainRatioToggle = () => {
    const nextVal = !maintainAspectRatio;
    setMaintainAspectRatio(nextVal);

    if (nextVal && originalMeta && originalMeta.aspectRatio > 0) {
      // Re-align height with current width
      const alignedH = Math.max(1, Math.round(targetWidth / originalMeta.aspectRatio));
      setTargetHeight(alignedH);
      triggerDebouncedResize(targetWidth, alignedH);
    }
  };

  // File Validation
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
      setErrorMessage(t('tools.resize.errorInvalidType'));
      return;
    }

    setErrorMessage(null);

    // Clean previous URLs
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
    }
    safelySetResizedUrl(null);

    const newUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      loadedImageRef.current = img;
      const naturalW = img.naturalWidth || 800;
      const naturalH = img.naturalHeight || 600;
      const aspect = naturalW / naturalH;

      setOriginalFile(file);
      setOriginalMeta({
        name: file.name,
        type: file.type || 'image/jpeg',
        size: file.size,
        width: naturalW,
        height: naturalH,
        aspectRatio: aspect,
      });
      setOriginalUrl(newUrl);

      // Default target dimensions match original initially
      setTargetWidth(naturalW);
      setTargetHeight(naturalH);

      // Perform initial render
      executeCanvasResize(naturalW, naturalH, file);
    };

    img.onerror = () => {
      setErrorMessage(t('tools.resize.errorProcessing'));
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

  // Download Resized Image
  const handleDownload = () => {
    if (!resizedBlob || !resizedUrl || !originalMeta) return;

    const originalName = originalMeta.name;
    const dotIndex = originalName.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? originalName.substring(0, dotIndex) : originalName;
    const extension = dotIndex !== -1 ? originalName.substring(dotIndex) : '.jpg';
    const downloadFileName = `${baseName}-${targetWidth}x${targetHeight}${extension}`;

    const link = document.createElement('a');
    link.href = resizedUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const originalSize = originalMeta?.size || 0;
  const originalW = originalMeta?.width || 0;
  const originalH = originalMeta?.height || 0;
  const scalePercent = originalW > 0 ? Math.round((targetWidth / originalW) * 100) : 100;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <SEO pageKey="resize" canonicalPath="/resize" />
      
      {/* Header section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('tools.resize.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark tracking-tight font-sans">
          {t('tools.resize.title')}
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
          {t('tools.resize.description')}
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
                  {isDragging ? t('tools.resize.dropzoneActive') : t('tools.resize.dropzoneTitle')}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {t('tools.resize.dropzoneSubtitle')}
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
                <span>{t('tools.resize.selectImageBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: Resize Controls, Dimension Inputs, Aspect Ratio & Previews */
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
                  <span>•</span>
                  <span>{originalW} × {originalH} px</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>{t('tools.resize.changeImage')}</span>
            </button>
          </div>

          {/* Dimension Controls & Aspect Ratio Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-secondary" />
                  <h3 className="text-lg font-bold text-dark">
                    {t('tools.resize.controlsTitle')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t('tools.resize.controlsDescription')}
                </p>
              </div>

              {/* Scale Indicator Badge */}
              <div dir="ltr" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary font-bold text-sm sm:text-base font-mono self-start sm:self-auto">
                <Percent className="w-3.5 h-3.5" />
                <span>{scalePercent}%</span>
              </div>
            </div>

            {/* Inputs: Width & Height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Width Input */}
              <div className="space-y-1.5">
                <label htmlFor="resize-width" className="block text-xs font-bold text-slate-700">
                  {t('tools.resize.width')} (px)
                </label>
                <div className="relative">
                  <input
                    id="resize-width"
                    type="number"
                    min="1"
                    max="10000"
                    value={targetWidth || ''}
                    onChange={handleWidthChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-base font-bold text-dark focus:bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/30 outline-none transition-all"
                  />
                  <span className="absolute end-4 top-3.5 text-xs font-semibold text-slate-400">
                    px
                  </span>
                </div>
              </div>

              {/* Height Input */}
              <div className="space-y-1.5">
                <label htmlFor="resize-height" className="block text-xs font-bold text-slate-700">
                  {t('tools.resize.height')} (px)
                </label>
                <div className="relative">
                  <input
                    id="resize-height"
                    type="number"
                    min="1"
                    max="10000"
                    value={targetHeight || ''}
                    onChange={handleHeightChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-base font-bold text-dark focus:bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/30 outline-none transition-all"
                  />
                  <span className="absolute end-4 top-3.5 text-xs font-semibold text-slate-400">
                    px
                  </span>
                </div>
              </div>

            </div>

            {/* Maintain Aspect Ratio Checkbox */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <input
                id="maintain-ratio-checkbox"
                type="checkbox"
                checked={maintainAspectRatio}
                onChange={handleMaintainRatioToggle}
                className="w-5 h-5 rounded-lg border-slate-300 text-secondary focus:ring-secondary/40 accent-secondary cursor-pointer"
              />
              <label
                htmlFor="maintain-ratio-checkbox"
                className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer select-none"
              >
                {maintainAspectRatio ? (
                  <Lock className="w-4 h-4 text-secondary" />
                ) : (
                  <Unlock className="w-4 h-4 text-slate-400" />
                )}
                <span>{t('tools.resize.maintainRatio')}</span>
              </label>
            </div>

            {/* Preset Scale Buttons */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('tools.resize.presetsLabel')}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '25%', val: 25 },
                  { label: '50%', val: 50 },
                  { label: '75%', val: 75 },
                  { label: '100% (Original)', val: 100 },
                  { label: '150%', val: 150 },
                  { label: '200%', val: 200 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => applyPresetScale(preset.val)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      scalePercent === preset.val
                        ? 'bg-secondary text-white border-secondary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* 1: Original Dimensions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('tools.resize.originalDimensions')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-slate-800 font-mono">
                  {originalW} × {originalH}
                </span>
              </div>
            </div>

            {/* 2: New Dimensions */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Scaling className="w-3.5 h-3.5 text-secondary" />
                <span>{t('tools.resize.newDimensions')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-bold text-secondary font-mono">
                  {targetWidth} × {targetHeight}
                </span>
              </div>
            </div>

            {/* 3: Scale Factor */}
            <div className="p-4 sm:p-5 rounded-2xl bg-secondary/5 border border-secondary/20 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-secondary flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-secondary" />
                <span>{t('tools.resize.scaleFactor')}</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                <span className="text-lg sm:text-2xl font-black text-secondary font-mono">
                  {scalePercent}%
                </span>
              </div>
            </div>

            {/* 4: New File Size */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Poids estimé</span>
              </span>
              <div dir="ltr" className="mt-2 text-start">
                {isProcessing ? (
                  <span className="inline-flex items-center gap-1.5 text-secondary text-sm font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calcul...</span>
                  </span>
                ) : (
                  <span className="text-lg sm:text-2xl font-bold text-slate-700 font-mono">
                    {formatBytes(resizedSize || originalSize)}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Comparative Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Original Preview */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span className="font-bold text-sm text-slate-700">
                    {t('tools.resize.originalPreview')}
                  </span>
                </div>
                <div dir="ltr">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono">
                    {originalW} × {originalH} px
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

            {/* Resized Preview */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 bg-secondary/5 border-b border-secondary/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-bold text-sm text-secondary">
                    {t('tools.resize.resizedPreview')}
                  </span>
                </div>
                <div dir="ltr">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-secondary/15 text-secondary font-mono">
                    {targetWidth} × {targetHeight} px
                  </span>
                </div>
              </div>

              <div className="relative p-4 flex-1 flex items-center justify-center bg-slate-100/50 min-h-[260px] sm:min-h-[320px]">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-secondary animate-spin" />
                    <span className="text-sm font-semibold text-slate-600">
                      {t('tools.resize.processing')}
                    </span>
                  </div>
                ) : resizedUrl ? (
                  <img
                    src={resizedUrl}
                    alt="Resized Preview"
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
                {t('tools.resize.statusReady')}
              </h4>
              <div dir="ltr" className="text-xs sm:text-sm text-slate-500 font-mono inline-flex items-center gap-2">
                <span>{originalW} × {originalH} px</span>
                <span>→</span>
                <strong className="text-secondary">{targetWidth} × {targetHeight} px</strong>
                <span className="text-slate-600 font-semibold">({formatBytes(resizedSize)})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isProcessing || !resizedUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-secondary via-secondary to-primary hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-secondary/25 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>{t('tools.resize.downloadBtn')}</span>
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
            <h4 className="font-bold text-dark text-sm">Interpolation Haute Fidélité</h4>
            <p className="text-xs text-slate-500 mt-0.5">Algorithme d’échantillonnage Canvas haute résolution.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">100% Client-Side</h4>
            <p className="text-xs text-slate-500 mt-0.5">Aucun octet n’est envoyé à un serveur externe.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Verrouillage des Proportions</h4>
            <p className="text-xs text-slate-500 mt-0.5">Préserve fidèlement le ratio sans déformation.</p>
          </div>
        </div>
      </div>

      {/* Enrichissement du contenu SEO & Anti-Thin Content */}
      <ToolInfoSection toolId="resize" />

    </div>
  );
};
