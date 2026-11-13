import { useState, useRef, useEffect, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Layers,
  Settings2,
  HardDrive
} from 'lucide-react';
import { formatBytes } from './CompressImage';

export interface PdfImageItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

export type PageSizeOption = 'a4' | 'original';
export type OrientationOption = 'portrait' | 'landscape';
export type MarginOption = 'small' | 'none';

export const ImageToPdf: FC = () => {
  const { t } = useTranslation();

  // Images list
  const [images, setImages] = useState<PdfImageItem[]>([]);

  // PDF Configuration options
  const [pageSize, setPageSize] = useState<PageSizeOption>('a4');
  const [orientation, setOrientation] = useState<OrientationOption>('portrait');
  const [margin, setMargin] = useState<MarginOption>('small');

  // Status & UI
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<PdfImageItem[]>([]);

  // Keep ref in sync for memory cleanup
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Clean all object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      imagesRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  // Validation
  const isValidImage = (file: File): boolean => {
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const validExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const mimeOk = validMimes.includes(file.type.toLowerCase());
    const extOk = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    return mimeOk || extOk;
  };

  // Helper to load image dimensions
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 800, height: 600 });
      img.src = url;
    });
  };

  // Add multiple files to the list
  const handleAddFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (isValidImage(f)) {
        validFiles.push(f);
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage(t('tools.imageToPdf.errorInvalidType'));
      return;
    }

    const newItems: PdfImageItem[] = [];
    for (const file of validFiles) {
      const url = URL.createObjectURL(file);
      const dims = await getImageDimensions(url);
      newItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        previewUrl: url,
        name: file.name,
        size: file.size,
        width: dims.width,
        height: dims.height,
      });
    }

    setImages((prev) => [...prev, ...newItems]);
  };

  // Item management: Delete single image
  const handleDeleteItem = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  // Item management: Move Up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setImages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  // Item management: Move Down
  const handleMoveDown = (index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  // Full reset (clear all)
  const handleClearAll = () => {
    images.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setImages([]);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (addMoreInputRef.current) addMoreInputRef.current.value = '';
  };

  // Drag and drop handlers
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
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
    }
  };

  // Generate PDF document using jsPDF (100% Client-Side)
  const handleGeneratePdf = async () => {
    if (images.length === 0) {
      setErrorMessage(t('tools.imageToPdf.errorNoImages'));
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let doc: jsPDF | null = null;

      for (let i = 0; i < images.length; i++) {
        const item = images[i];

        // Load image into an offscreen canvas to guarantee cross-browser JPEG conversion
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load ${item.name}`));
          img.src = item.previewUrl;
        });

        // Mobile Memory & Canvas Safety: Prevent massive phone photos from crashing Safari
        const maxDim = 2560;
        let drawW = img.naturalWidth;
        let drawH = img.naturalHeight;
        if (drawW > maxDim || drawH > maxDim) {
          const ratio = Math.min(maxDim / drawW, maxDim / drawH);
          drawW = Math.round(drawW * ratio);
          drawH = Math.round(drawH * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = drawW;
        canvas.height = drawH;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');

        // Solid white background for consistent rendering
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, drawW, drawH);
        ctx.drawImage(img, 0, 0, drawW, drawH);

        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.90);

        // Immediate Canvas cleanup: Free GPU backing store from memory
        ctx.clearRect(0, 0, drawW, drawH);
        canvas.width = 0;
        canvas.height = 0;

        if (pageSize === 'a4') {
          // Standard A4 dimensions in mm
          const pageW = orientation === 'portrait' ? 210 : 297;
          const pageH = orientation === 'portrait' ? 297 : 210;
          const marginMm = margin === 'small' ? 10 : 0;

          const maxW = pageW - marginMm * 2;
          const maxH = pageH - marginMm * 2;

          const imgAspect = img.naturalWidth / img.naturalHeight;
          const pageAspect = maxW / maxH;

          let renderW = maxW;
          let renderH = maxH;

          if (imgAspect > pageAspect) {
            renderW = maxW;
            renderH = maxW / imgAspect;
          } else {
            renderH = maxH;
            renderW = maxH * imgAspect;
          }

          const posX = (pageW - renderW) / 2;
          const posY = (pageH - renderH) / 2;

          if (i === 0) {
            doc = new jsPDF({
              orientation,
              unit: 'mm',
              format: 'a4',
            });
          } else {
            doc?.addPage('a4', orientation);
          }

          doc?.addImage(imgDataUrl, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
        } else {
          // 'original' mode: page size equals image dimensions in mm (96 DPI conversion)
          const imgWidthMm = (img.naturalWidth * 25.4) / 96;
          const imgHeightMm = (img.naturalHeight * 25.4) / 96;
          const pageOrientation = imgWidthMm > imgHeightMm ? 'landscape' : 'portrait';

          if (i === 0) {
            doc = new jsPDF({
              orientation: pageOrientation,
              unit: 'mm',
              format: [imgWidthMm, imgHeightMm],
            });
          } else {
            doc?.addPage([imgWidthMm, imgHeightMm], pageOrientation);
          }

          doc?.addImage(imgDataUrl, 'JPEG', 0, 0, imgWidthMm, imgHeightMm, undefined, 'FAST');
        }
      }

      if (doc) {
        doc.save('ImageTools-document.pdf');
        setSuccessMessage(t('tools.imageToPdf.statusReady'));
      }
    } catch (err) {
      console.error('PDF generation error:', err);
      setErrorMessage(t('tools.imageToPdf.errorProcessing'));
    } finally {
      setIsGenerating(false);
    }
  };

  const totalCombinedBytes = images.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('tools.imageToPdf.badge')}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark tracking-tight font-sans">
          {t('tools.imageToPdf.title')}
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-sans">
          {t('tools.imageToPdf.description')}
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Interactive Work Area */}
      {images.length === 0 ? (
        /* STEP 1: Upload Dropzone (Multiple Files) */
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
              multiple
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
                  {isDragging ? t('tools.imageToPdf.dropzoneActive') : t('tools.imageToPdf.dropzoneTitle')}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {t('tools.imageToPdf.dropzoneSubtitle')}
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
                <Plus className="w-4 h-4" />
                <span>{t('tools.imageToPdf.selectImagesBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: PDF Configuration, Image List & Ordering, Generation */
        <div className="space-y-6">
          
          {/* Top Actions: Add More, Clear All, Counters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-dark text-base sm:text-lg">
                  {images.length} {t('tools.imageToPdf.stats.totalImages')}
                </h4>
                <div dir="ltr" className="flex items-center gap-2 text-xs text-slate-500 font-medium font-mono">
                  <span>{formatBytes(totalCombinedBytes)}</span>
                  <span>•</span>
                  <span>{images.length} pages</span>
                </div>
              </div>
            </div>

            {/* Hidden Add More Input */}
            <input
              type="file"
              ref={addMoreInputRef}
              multiple
              className="hidden"
              accept="image/*,image/png,image/jpeg,image/webp"
              onChange={handleFileInputChange}
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addMoreInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('tools.imageToPdf.addMoreBtn')}</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-95 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('tools.imageToPdf.clearAllBtn')}</span>
              </button>
            </div>
          </div>

          {/* PDF Configuration Options Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-lg font-bold text-dark">
                  {t('tools.imageToPdf.optionsTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {t('tools.imageToPdf.optionsDescription')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Option 1: Page Size (A4 vs Original) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {t('tools.imageToPdf.pageSizeLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSize('a4')}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      pageSize === 'a4'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t('tools.imageToPdf.sizeA4')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageSize('original')}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      pageSize === 'original'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t('tools.imageToPdf.sizeOriginal')}
                  </button>
                </div>
              </div>

              {/* Option 2: Orientation (Portrait vs Landscape) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {t('tools.imageToPdf.orientationLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={pageSize === 'original'}
                    onClick={() => setOrientation('portrait')}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      pageSize === 'original'
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                        : orientation === 'portrait'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t('tools.imageToPdf.orientPortrait')}
                  </button>
                  <button
                    type="button"
                    disabled={pageSize === 'original'}
                    onClick={() => setOrientation('landscape')}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      pageSize === 'original'
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                        : orientation === 'landscape'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t('tools.imageToPdf.orientLandscape')}
                  </button>
                </div>
              </div>

              {/* Option 3: Margins */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {t('tools.imageToPdf.marginLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={pageSize === 'original'}
                    onClick={() => setMargin('small')}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      pageSize === 'original'
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                        : margin === 'small'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t('tools.imageToPdf.marginSmall')}
                  </button>
                  <button
                    type="button"
                    disabled={pageSize === 'original'}
                    onClick={() => setMargin('none')}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                      pageSize === 'original'
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                        : margin === 'none'
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t('tools.imageToPdf.marginNone')}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Images Grid with Reordering & Deletion Controls */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-dark flex items-center justify-between px-1">
              <span>Ordre des pages ({images.length})</span>
              <span className="text-xs text-slate-500 font-normal">
                Utilisez les flèches pour changer l’ordre
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between group"
                >
                  {/* Top Item Row: Page Badge & Delete Button */}
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <div dir="ltr" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                      <span>{t('tools.imageToPdf.pageBadge')} {index + 1}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title={t('tools.imageToPdf.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Thumbnail Image */}
                  <div className="h-44 w-full rounded-xl bg-slate-100/70 border border-slate-200/80 flex items-center justify-center overflow-hidden my-2">
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Bottom Meta & Reordering Controls */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="truncate flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <span dir="ltr" className="text-[11px] text-slate-400 font-mono">
                        {formatBytes(item.size)}
                      </span>
                    </div>

                    {/* Move Up & Move Down Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-primary/10 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title={t('tools.imageToPdf.moveUp')}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-primary/10 hover:text-primary hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title={t('tools.imageToPdf.moveDown')}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action & Download Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-start">
              <h4 className="font-bold text-dark text-base sm:text-lg flex items-center gap-2 justify-center sm:justify-start">
                <FileText className="w-5 h-5 text-primary" />
                <span>Document PDF ({images.length} pages)</span>
              </h4>
              <div dir="ltr" className="text-xs sm:text-sm text-slate-500 font-mono inline-flex items-center gap-2">
                <span>{pageSize === 'a4' ? `A4 (${orientation})` : 'Taille originale'}</span>
                <span>•</span>
                <span>{formatBytes(totalCombinedBytes)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGenerating || images.length === 0}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-primary to-secondary hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-lg shadow-primary/25 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('tools.imageToPdf.generating')}</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{t('tools.imageToPdf.generateBtn')}</span>
                </>
              )}
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
            <h4 className="font-bold text-dark text-sm">Génération Instantanée</h4>
            <p className="text-xs text-slate-500 mt-0.5">Création du document PDF 100% dans votre navigateur avec jsPDF.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Confidentialité Totale</h4>
            <p className="text-xs text-slate-500 mt-0.5">Aucun document n’est stocké ni envoyé sur un serveur.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-dark text-sm">Réorganisation Libre</h4>
            <p className="text-xs text-slate-500 mt-0.5">Ajustez l’ordre des pages facilement avant génération.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
