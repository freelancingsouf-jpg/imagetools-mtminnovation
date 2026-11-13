import { useState, useRef, useEffect, useCallback, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '../SEO';
import { ToolInfoSection } from '../ToolInfoSection';
import {
  UploadCloud,
  FileImage,
  Stamp,
  Sparkles,
  Download,
  AlertCircle,
  Loader2,
  HardDrive,
  CheckCircle2,
  Type,
  Palette,
  Eye,
  Sliders,
  Grid
} from 'lucide-react';
import { formatBytes } from './CompressImage';

interface ImageMetadata {
  name: string;
  type: string;
  size: number;
  width: number;
  height: number;
}

type WatermarkPosition = 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export const WatermarkImage: FC = () => {
  const { t } = useTranslation();

  // File states
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalMeta, setOriginalMeta] = useState<ImageMetadata | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  // Watermark parameters
  const [watermarkText, setWatermarkText] = useState<string>('MTM Innovation');
  const [watermarkColor, setWatermarkColor] = useState<string>('#ffffff');
  const [opacity, setOpacity] = useState<number>(0.85); // 0.1 to 1.0
  const [position, setPosition] = useState<WatermarkPosition>('bottom-right');
  const [fontSize, setFontSize] = useState<number>(36); // in pixels
  const [addShadow, setAddShadow] = useState<boolean>(true);

  // Processed states
  const [watermarkedBlob, setWatermarkedBlob] = useState<Blob | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);
  const [watermarkedSize, setWatermarkedSize] = useState<number>(0);

  // Status & UI
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalUrlRef = useRef<string | null>(null);
  const watermarkedUrlRef = useRef<string | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync ref pointers for memory cleanup
  useEffect(() => {
    originalUrlRef.current = originalUrl;
  }, [originalUrl]);

  useEffect(() => {
    watermarkedUrlRef.current = watermarkedUrl;
  }, [watermarkedUrl]);

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }
      if (watermarkedUrlRef.current) {
        URL.revokeObjectURL(watermarkedUrlRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Main Canvas Watermarking Logic
  const applyWatermark = useCallback(() => {
    const img = loadedImageRef.current;
    if (!img || !originalFile) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // 1. Mobile memory guard: Clamp dimensions to prevent iOS Safari 4096px canvas limit crashes
      const maxDim = 4096;
      let targetW = img.naturalWidth;
      let targetH = img.naturalHeight;
      if (targetW > maxDim || targetH > maxDim) {
        const ratio = Math.min(maxDim / targetW, maxDim / targetH);
        targetW = Math.round(targetW * ratio);
        targetH = Math.round(targetH * ratio);
      }

      canvas.width = targetW;
      canvas.height = targetH;

      // 2. Draw original image
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // 3. Render Watermark text if not empty
      const trimmedText = watermarkText.trim();
      if (trimmedText) {
        ctx.save();

        // Adjust font size proportionally if image was scaled
        const scaleFactor = targetW / img.naturalWidth;
        const effectiveFontSize = Math.max(12, Math.round(fontSize * scaleFactor));

        // Configure font
        ctx.font = `bold ${effectiveFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;
        ctx.textBaseline = 'top';

        // Measure text width
        const metrics = ctx.measureText(trimmedText);
        const textWidth = metrics.width;
        const textHeight = effectiveFontSize;

        // Dynamic margin based on image size (approx 3.5% of dimension, min 16px)
        const margin = Math.max(16, Math.round(Math.min(canvas.width, canvas.height) * 0.035));

        let x = margin;
        let y = margin;

        switch (position) {
          case 'center':
            x = (canvas.width - textWidth) / 2;
            y = (canvas.height - textHeight) / 2;
            break;
          case 'bottom-right':
            x = canvas.width - textWidth - margin;
            y = canvas.height - textHeight - margin;
            break;
          case 'bottom-left':
            x = margin;
            y = canvas.height - textHeight - margin;
            break;
          case 'top-right':
            x = canvas.width - textWidth - margin;
            y = margin;
            break;
          case 'top-left':
          default:
            x = margin;
            y = margin;
            break;
        }

        // Apply Opacity
        ctx.globalAlpha = Math.max(0.05, Math.min(1.0, opacity));

        // Optional legibility drop shadow
        if (addShadow) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = Math.max(2, Math.round(effectiveFontSize * 0.12));
          ctx.shadowOffsetX = Math.max(1, Math.round(effectiveFontSize * 0.04));
          ctx.shadowOffsetY = Math.max(1, Math.round(effectiveFontSize * 0.04));
        }

        // Apply Fill Style & Render Text
        ctx.fillStyle = watermarkColor;
        ctx.fillText(trimmedText, x, y);

        ctx.restore();
      }

      // 4. Export Canvas to Blob
      const outputMime = originalFile.type || 'image/png';
      canvas.toBlob(
        (blob) => {
          // CRITICAL MEMORY CLEANUP: Immediately release canvas memory buffer from GPU
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          canvas.width = 0;
          canvas.height = 0;

          if (!blob) {
            setIsProcessing(false);
            setErrorMessage(t('tools.watermark.errorProcessing'));
            return;
          }

          // Revoke previous watermarked URL to prevent memory leaks
          if (watermarkedUrlRef.current) {
            URL.revokeObjectURL(watermarkedUrlRef.current);
          }

          const newUrl = URL.createObjectURL(blob);
          watermarkedUrlRef.current = newUrl;

          setWatermarkedBlob(blob);
          setWatermarkedUrl(newUrl);
          setWatermarkedSize(blob.size);
          setIsProcessing(false);
        },
        outputMime,
        0.95
      );
    } catch (err) {
      console.error('Watermark error:', err);
      setIsProcessing(false);
      setErrorMessage(t('tools.watermark.errorProcessing'));
    }
  }, [watermarkText, watermarkColor, opacity, position, fontSize, addShadow, originalFile, t]);

  // Debounced auto-render whenever parameters change
  useEffect(() => {
    if (!originalFile || !loadedImageRef.current) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      applyWatermark();
    }, 160);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [applyWatermark]);

  // Load and inspect image file
  const handleImageFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(t('tools.watermark.errorInvalidType'));
      return;
    }

    setErrorMessage(null);

    // Revoke previous URLs
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
    if (watermarkedUrlRef.current) {
      URL.revokeObjectURL(watermarkedUrlRef.current);
      watermarkedUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    originalUrlRef.current = objectUrl;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImageRef.current = img;

      const meta: ImageMetadata = {
        name: file.name,
        type: file.type,
        size: file.size,
        width: img.naturalWidth,
        height: img.naturalHeight
      };

      setOriginalFile(file);
      setOriginalMeta(meta);
      setOriginalUrl(objectUrl);

      // Proportional initial font size based on image resolution
      const initialSize = Math.max(24, Math.min(120, Math.round(Math.min(img.naturalWidth, img.naturalHeight) / 22)));
      setFontSize(initialSize);
    };

    img.onerror = () => {
      setErrorMessage(t('tools.watermark.errorProcessing'));
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  };

  // Drag & drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  // Download Handler
  const handleDownload = () => {
    if (!watermarkedBlob || !originalFile) return;

    const dotIndex = originalFile.name.lastIndexOf('.');
    const baseName = dotIndex !== -1 ? originalFile.name.substring(0, dotIndex) : originalFile.name;
    const ext = dotIndex !== -1 ? originalFile.name.substring(dotIndex) : '.png';

    const filename = `${baseName}-watermark${ext}`;
    const link = document.createElement('a');
    link.href = watermarkedUrl || URL.createObjectURL(watermarkedBlob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Preset Colors
  const presetColors = [
    { hex: '#ffffff', label: 'White' },
    { hex: '#000000', label: 'Black' },
    { hex: '#438fe9', label: 'Primary Blue' },
    { hex: '#655ce8', label: 'Secondary Purple' },
    { hex: '#ef4444', label: 'Red' },
    { hex: '#f59e0b', label: 'Amber' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO pageKey="watermark" canonicalPath="/watermark" />
      {/* Header section with badge */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
          <Stamp className="w-3.5 h-3.5" />
          <span>{t('tools.watermark.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-3">
          {t('tools.watermark.title')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {t('tools.watermark.description')}
        </p>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Upload Dropzone (When no image is loaded) */}
      {!originalFile ? (
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
          className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-16 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center bg-white shadow-sm group hover:border-primary/80 hover:bg-slate-50/50 ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.008]'
              : 'border-slate-300'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-md transition-all duration-200 mb-6">
            <UploadCloud className="w-10 h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2">
            {isDragging
              ? t('tools.watermark.dropzoneActive')
              : t('tools.watermark.dropzoneTitle')}
          </h3>

          <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            {t('tools.watermark.dropzoneSubtitle')}
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/25 hover:bg-primary/95 transition-all"
          >
            <FileImage className="w-4 h-4" />
            <span>{t('tools.watermark.selectImageBtn')}</span>
          </button>
        </div>
      ) : (
        /* Workspace when image is loaded */
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Top Bar: Active Image Summary & Change Button */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <FileImage className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-dark truncate max-w-xs sm:max-w-md">
                  {originalMeta?.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-primary uppercase">
                    {originalMeta?.type.split('/')[1]}
                  </span>
                  <span>•</span>
                  <span dir="ltr" className="font-mono">
                    {originalMeta ? formatBytes(originalMeta.size) : ''}
                  </span>
                  <span>•</span>
                  <span dir="ltr" className="font-mono">
                    {originalMeta?.width} × {originalMeta?.height} px
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{t('tools.watermark.changeImage')}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Watermark Controls & Customization Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <div className="border-b border-slate-100 pb-5 mb-6">
              <div className="flex items-center gap-2.5 mb-1">
                <Stamp className="w-5 h-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-dark">
                  {t('tools.watermark.controlsTitle')}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('tools.watermark.controlsDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* 1. Watermark Text Input */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Type className="w-4 h-4 text-primary" />
                  <span>{t('tools.watermark.textLabel')}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder={t('tools.watermark.textPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-semibold text-dark outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Saisissez votre nom, marque ou mention légale.
                </p>
              </div>

              {/* 2. Color Picker & Presets */}
              <div className="space-y-3">
                <label className="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-secondary" />
                    <span>{t('tools.watermark.colorLabel')}</span>
                  </span>
                  <span dir="ltr" className="text-xs font-mono font-bold text-slate-500 uppercase">
                    {watermarkColor}
                  </span>
                </label>

                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-12 h-11 rounded-xl border border-slate-300 shadow-sm overflow-hidden flex-shrink-0 cursor-pointer hover:border-primary transition-all">
                    <input
                      type="color"
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: watermarkColor }}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {presetColors.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setWatermarkColor(color.hex)}
                        title={color.label}
                        className={`w-7 h-7 rounded-lg border transition-all ${
                          watermarkColor.toLowerCase() === color.hex.toLowerCase()
                            ? 'ring-2 ring-primary ring-offset-1 scale-110 border-slate-400'
                            : 'border-slate-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Drop shadow toggle for legibility */}
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={addShadow}
                    onChange={(e) => setAddShadow(e.target.checked)}
                    className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary cursor-pointer"
                  />
                  <span>Ombre portée (lisibilité sur tout arrière-plan)</span>
                </label>
              </div>

              {/* 3. Opacity Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Eye className="w-4 h-4 text-primary" />
                    <span>{t('tools.watermark.opacityLabel')}</span>
                  </label>
                  <span dir="ltr" className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary/10 text-primary">
                    {Math.round(opacity * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0.10"
                  max="1.00"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                />

                <div className="flex justify-between text-[11px] font-semibold text-slate-400" dir="ltr">
                  <span>10% (Discret)</span>
                  <span>50%</span>
                  <span>100% (Opaque)</span>
                </div>
              </div>

              {/* 4. Position Selector */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Grid className="w-4 h-4 text-secondary" />
                  <span>{t('tools.watermark.positionLabel')}</span>
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPosition('bottom-right')}
                    className={`px-3 py-2 rounded-xl font-bold transition-all border text-start ${
                      position === 'bottom-right'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ↘ {t('tools.watermark.posBottomRight')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPosition('bottom-left')}
                    className={`px-3 py-2 rounded-xl font-bold transition-all border text-start ${
                      position === 'bottom-left'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ↙ {t('tools.watermark.posBottomLeft')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPosition('center')}
                    className={`px-3 py-2 rounded-xl font-bold transition-all border col-span-2 text-center ${
                      position === 'center'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ✦ {t('tools.watermark.posCenter')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPosition('top-right')}
                    className={`px-3 py-2 rounded-xl font-bold transition-all border text-start ${
                      position === 'top-right'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ↗ {t('tools.watermark.posTopRight')}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPosition('top-left')}
                    className={`px-3 py-2 rounded-xl font-bold transition-all border text-start ${
                      position === 'top-left'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ↖ {t('tools.watermark.posTopLeft')}
                  </button>
                </div>
              </div>

              {/* 5. Font Size Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <Sliders className="w-4 h-4 text-primary" />
                    <span>{t('tools.watermark.fontSizeLabel')}</span>
                  </label>
                  <span dir="ltr" className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-secondary/10 text-secondary">
                    {fontSize} px
                  </span>
                </div>

                <input
                  type="range"
                  min="16"
                  max="140"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-secondary focus:outline-none"
                />

                <div className="flex justify-between text-[11px] font-semibold text-slate-400" dir="ltr">
                  <span>16 px (Petit)</span>
                  <span>48 px</span>
                  <span>140 px (Grand)</span>
                </div>
              </div>

              {/* 6. Quick Action & Status */}
              <div className="flex flex-col justify-end space-y-3">
                {isProcessing ? (
                  <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center gap-2 text-slate-600 text-xs font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>{t('tools.watermark.processing')}</span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center gap-2 text-emerald-700 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{t('tools.watermark.statusReady')}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!watermarkedBlob || isProcessing}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary/95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('tools.watermark.downloadBtn')}</span>
                </button>
              </div>

            </div>
          </div>

          {/* Side-by-Side Visual Preview & Verification Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Original Preview Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('tools.watermark.previewOriginal')}
                </span>
                <span dir="ltr" className="text-xs font-mono font-semibold text-slate-400">
                  {originalMeta?.width} × {originalMeta?.height} px
                </span>
              </div>

              <div className="flex-1 min-h-[300px] max-h-[460px] rounded-2xl bg-slate-100/70 border border-slate-200 flex items-center justify-center overflow-hidden p-3 relative group">
                {originalUrl && (
                  <img
                    src={originalUrl}
                    alt="Original Preview"
                    className="max-w-full max-h-[420px] object-contain rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-[1.01]"
                  />
                )}
              </div>
            </div>

            {/* Watermarked Preview Card */}
            <div className="bg-white rounded-3xl p-5 border-2 border-primary/20 shadow-md shadow-primary/5 flex flex-col relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('tools.watermark.previewWatermarked')}</span>
                </span>
                <div className="flex items-center gap-2">
                  {isProcessing && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  )}
                  <span dir="ltr" className="text-xs font-mono font-semibold text-primary">
                    {watermarkedSize > 0 ? formatBytes(watermarkedSize) : ''}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-h-[300px] max-h-[460px] rounded-2xl bg-slate-100/70 border border-slate-200 flex items-center justify-center overflow-hidden p-3 relative group">
                {watermarkedUrl ? (
                  <img
                    src={watermarkedUrl}
                    alt="Watermarked Preview"
                    className="max-w-full max-h-[420px] object-contain rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-[1.01]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    <span className="text-xs font-semibold">{t('tools.watermark.processing')}</span>
                  </div>
                )}
              </div>

              {/* Bottom Quick Download bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <HardDrive className="w-4 h-4 text-primary" />
                  <span dir="ltr">{originalMeta?.name}</span>
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!watermarkedBlob || isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs shadow-sm hover:bg-primary/95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('tools.watermark.downloadBtn')}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Enrichissement du contenu SEO & Anti-Thin Content */}
      <ToolInfoSection toolId="watermark" />
    </div>
  );
};

export default WatermarkImage;
