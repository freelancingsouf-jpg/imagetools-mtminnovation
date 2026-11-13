import { useState, useRef, useEffect, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { SEO } from '../SEO';
import { ToolInfoSection } from '../ToolInfoSection';
import {
  UploadCloud,
  FileText,
  FileImage,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Archive,
  Image as ImageIcon
} from 'lucide-react';
import { formatBytes } from './CompressImage';

// Configure pdfjs worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfFileMetadata {
  file: File;
  name: string;
  size: number;
  totalPages: number;
  arrayBuffer: ArrayBuffer;
}

interface RenderedPage {
  pageNum: number;
  url: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
}

export const PdfToJpg: FC = () => {
  const { t } = useTranslation();

  // File states
  const [loadedPdf, setLoadedPdf] = useState<PdfFileMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Conversion Progress & Quality
  const [currentProgress, setCurrentProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [scale, setScale] = useState<number>(1.5); // 1.0 = 72 DPI, 1.5 = 108 DPI, 2.0 = 144 DPI

  // Result state
  const [renderedPages, setRenderedPages] = useState<RenderedPage[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Refs for memory cleanup
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderedPagesRef = useRef<RenderedPage[]>([]);

  useEffect(() => {
    renderedPagesRef.current = renderedPages;
  }, [renderedPages]);

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      renderedPagesRef.current.forEach((page) => {
        URL.revokeObjectURL(page.url);
      });
    };
  }, []);

  // Handle incoming PDF file
  const handlePdfFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage(t('tools.pdfToJpg.errorInvalidType'));
      return;
    }

    setErrorMessage(null);
    setIsSuccess(false);

    // Revoke previous URLs
    renderedPagesRef.current.forEach((page) => {
      URL.revokeObjectURL(page.url);
    });
    setRenderedPages([]);

    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
      const doc = await loadingTask.promise;
      const totalPages = doc.numPages;

      setLoadedPdf({
        file,
        name: file.name,
        size: file.size,
        totalPages,
        arrayBuffer: buffer
      });
    } catch (err) {
      console.error('Inspection error:', err);
      setErrorMessage(t('tools.pdfToJpg.errorProcessing'));
    }
  };

  // Drag and Drop handlers
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
      handlePdfFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePdfFile(e.target.files[0]);
    }
    e.target.value = '';
  };

  // Convert PDF pages to JPG using pdfjs-dist and Canvas
  const handleConvertToJpg = async () => {
    if (!loadedPdf) return;

    setErrorMessage(null);
    setIsProcessing(true);
    setIsSuccess(false);

    // Clear previous pages
    renderedPagesRef.current.forEach((page) => URL.revokeObjectURL(page.url));
    setRenderedPages([]);

    try {
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(loadedPdf.arrayBuffer) });
      const doc = await loadingTask.promise;
      const total = doc.numPages;

      const outputPages: RenderedPage[] = [];

      for (let pageNum = 1; pageNum <= total; pageNum++) {
        setCurrentProgress({ current: pageNum, total });

        const page = await doc.getPage(pageNum);

        // Mobile memory guard: Clamp scale if page dimensions would exceed 3072px
        let currentScale = scale;
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        if (unscaledViewport.width * currentScale > 3072 || unscaledViewport.height * currentScale > 3072) {
          currentScale = Math.min(3072 / unscaledViewport.width, 3072 / unscaledViewport.height);
        }
        const viewport = page.getViewport({ scale: currentScale });

        // Render onto offscreen canvas
        const canvas = document.createElement('canvas');
        const cWidth = Math.round(viewport.width);
        const cHeight = Math.round(viewport.height);
        canvas.width = cWidth;
        canvas.height = cHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) continue;

        // White background for JPG transparency safety
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cWidth, cHeight);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas
        };

        await page.render(renderContext).promise;

        // Export to JPG blob
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
        });

        // CRITICAL MEMORY CLEANUP: Release canvas backing store from GPU/Safari memory
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0;
        canvas.height = 0;

        if (blob) {
          const url = URL.createObjectURL(blob);
          outputPages.push({
            pageNum,
            url,
            blob,
            width: cWidth,
            height: cHeight,
            size: blob.size
          });
        }
      }

      setRenderedPages(outputPages);
      setIsSuccess(true);
    } catch (err) {
      console.error('PDF to JPG conversion error:', err);
      setErrorMessage(t('tools.pdfToJpg.errorProcessing'));
    } finally {
      setIsProcessing(false);
      setCurrentProgress({ current: 0, total: 0 });
    }
  };

  // Download individual JPG page
  const handleDownloadPage = (page: RenderedPage) => {
    if (!loadedPdf) return;
    const baseName = loadedPdf.name.replace(/\.pdf$/i, '');
    const filename = `${baseName}-page-${page.pageNum}.jpg`;

    const link = document.createElement('a');
    link.href = page.url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all pages packed in a ZIP archive
  const handleDownloadAllZip = async () => {
    if (renderedPages.length === 0 || !loadedPdf) return;

    setIsZipping(true);

    try {
      const zip = new JSZip();
      const baseName = loadedPdf.name.replace(/\.pdf$/i, '');

      renderedPages.forEach((page) => {
        zip.file(`${baseName}-page-${page.pageNum}.jpg`, page.blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);

      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `${baseName}-all-pages-jpg.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(zipUrl), 3000);
    } catch (err) {
      console.error('ZIP generation error:', err);
      setErrorMessage('Une erreur est survenue lors de la création de l’archive ZIP.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO pageKey="pdfToJpg" canonicalPath="/pdf-to-jpg" />
      {/* Header section with badge */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{t('tools.pdfToJpg.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-3">
          {t('tools.pdfToJpg.title')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {t('tools.pdfToJpg.description')}
        </p>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Upload Dropzone (When no file is loaded yet) */}
      {!loadedPdf ? (
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
            accept="application/pdf,.pdf"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-md transition-all duration-200 mb-6">
            <FileImage className="w-10 h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2">
            {isDragging
              ? t('tools.pdfToJpg.dropzoneActive')
              : t('tools.pdfToJpg.dropzoneTitle')}
          </h3>

          <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            {t('tools.pdfToJpg.dropzoneSubtitle')}
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/25 hover:bg-primary/95 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t('tools.pdfToJpg.selectFileBtn')}</span>
          </button>
        </div>
      ) : (
        /* Workspace when PDF is loaded */
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Top Summary Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm sm:text-base font-bold text-dark truncate max-w-xs sm:max-w-md">
                  {loadedPdf.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10" dir="ltr">
                    {loadedPdf.totalPages} {loadedPdf.totalPages > 1 ? 'pages' : 'page'}
                  </span>
                  <span>•</span>
                  <span className="font-mono" dir="ltr">
                    {formatBytes(loadedPdf.size)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isZipping}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('tools.pdfToJpg.changeFile')}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Quality Options & Action Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2.5 mb-1">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-dark">
                  {t('tools.pdfToJpg.controlsTitle')}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('tools.pdfToJpg.controlsDescription')}
              </p>
            </div>

            {/* Resolution Buttons */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('tools.pdfToJpg.qualityLabel')}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setScale(1.0)}
                  disabled={isProcessing}
                  className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                    scale === 1.0
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold">{t('tools.pdfToJpg.scaleStandard')}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Rapide & léger</p>
                </button>

                <button
                  type="button"
                  onClick={() => setScale(1.5)}
                  disabled={isProcessing}
                  className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                    scale === 1.5
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold">{t('tools.pdfToJpg.scaleHigh')}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Équilibré (Recommandé)</p>
                </button>

                <button
                  type="button"
                  onClick={() => setScale(2.0)}
                  disabled={isProcessing}
                  className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer ${
                    scale === 2.0
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-bold">{t('tools.pdfToJpg.scaleUltra')}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Plein format haute fidélité</p>
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {isProcessing && currentProgress.total > 0 && (
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conversion de la page {currentProgress.current} sur {currentProgress.total}...</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleConvertToJpg}
                disabled={isProcessing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary/95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    <span>{t('tools.pdfToJpg.convertAction')} ({loadedPdf.totalPages} pages)</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Results Section */}
          {isSuccess && renderedPages.length > 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Batch Actions Header */}
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-950">
                      {renderedPages.length} {renderedPages.length > 1 ? 'pages converties' : 'page convertie'} avec succès !
                    </h3>
                    <p className="text-xs text-emerald-800">
                      Vous pouvez télécharger chaque page individuellement ou récupérer l’archive ZIP complète.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  disabled={isZipping}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                >
                  {isZipping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Compression ZIP en cours...</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4" />
                      <span>{t('tools.pdfToJpg.downloadAllZip')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Grid of Converted Pages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {renderedPages.map((page) => (
                  <div
                    key={page.pageNum}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Thumbnail preview */}
                    <div className="aspect-[3/4] bg-slate-100/80 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-2 mb-3 relative group">
                      <img
                        src={page.url}
                        alt={`Page ${page.pageNum}`}
                        className="max-w-full max-h-full object-contain rounded shadow-2xs group-hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-dark/80 text-white backdrop-blur-xs">
                        Page {page.pageNum}
                      </span>
                    </div>

                    {/* Meta & Download */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3" dir="ltr">
                      <span className="font-mono">{page.width} × {page.height}</span>
                      <span className="font-mono font-semibold">{formatBytes(page.size)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadPage(page)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-primary hover:text-white text-slate-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('tools.pdfToJpg.downloadPage')}</span>
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      )}

      {/* Enrichissement du contenu SEO & Anti-Thin Content */}
      <ToolInfoSection toolId="pdf-to-jpg" />
    </div>
  );
};

export default PdfToJpg;
