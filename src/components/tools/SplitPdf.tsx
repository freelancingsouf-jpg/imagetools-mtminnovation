import { useState, useRef, useEffect, useMemo, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from 'pdf-lib';
import { SEO } from '../SEO';
import { ToolInfoSection } from '../ToolInfoSection';
import {
  UploadCloud,
  FileText,
  Scissors,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Layers,
  Sparkles,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { formatBytes } from './CompressImage';

interface PdfFileMetadata {
  file: File;
  name: string;
  size: number;
  totalPages: number;
  arrayBuffer: ArrayBuffer;
}

export const SplitPdf: FC = () => {
  const { t } = useTranslation();

  // File state
  const [loadedPdf, setLoadedPdf] = useState<PdfFileMetadata | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Range input state
  const [pageRangeInput, setPageRangeInput] = useState<string>('1-3');

  // Result state
  const [splitBlob, setSplitBlob] = useState<Blob | null>(null);
  const [splitUrl, setSplitUrl] = useState<string | null>(null);
  const [splitSize, setSplitSize] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitUrlRef = useRef<string | null>(null);

  useEffect(() => {
    splitUrlRef.current = splitUrl;
  }, [splitUrl]);

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      if (splitUrlRef.current) {
        URL.revokeObjectURL(splitUrlRef.current);
      }
    };
  }, []);

  // Parse and validate page ranges (e.g. "1-3, 5, 8-10")
  const parsedPages = useMemo<{ pages: number[]; errors: string[] }>(() => {
    if (!loadedPdf) return { pages: [], errors: [] };

    const raw = pageRangeInput.trim();
    if (!raw) return { pages: [], errors: [] };

    const total = loadedPdf.totalPages;
    const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
    const pagesSet = new Set<number>();
    const errors: string[] = [];

    for (const part of parts) {
      if (part.includes('-')) {
        const bounds = part.split('-').map((b) => b.trim());
        if (bounds.length !== 2) {
          errors.push(`Plage invalide : "${part}"`);
          continue;
        }

        const start = parseInt(bounds[0], 10);
        const end = parseInt(bounds[1], 10);

        if (isNaN(start) || isNaN(end)) {
          errors.push(`Numéros invalides : "${part}"`);
          continue;
        }

        if (start < 1 || end < 1) {
          errors.push(`Les pages doivent être ≥ 1 : "${part}"`);
          continue;
        }

        if (start > end) {
          errors.push(`Début supérieur à la fin : "${part}"`);
          continue;
        }

        if (start > total || end > total) {
          errors.push(`Dépasse le total de pages (${total}) : "${part}"`);
          continue;
        }

        for (let i = start; i <= end; i++) {
          pagesSet.add(i);
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (isNaN(pageNum)) {
          errors.push(`Page invalide : "${part}"`);
          continue;
        }

        if (pageNum < 1) {
          errors.push(`Le numéro de page doit être ≥ 1 : "${part}"`);
          continue;
        }

        if (pageNum > total) {
          errors.push(`La page ${pageNum} dépasse le total (${total})`);
          continue;
        }

        pagesSet.add(pageNum);
      }
    }

    const sortedPages = Array.from(pagesSet).sort((a, b) => a - b);
    return { pages: sortedPages, errors };
  }, [pageRangeInput, loadedPdf]);

  // Load and inspect single PDF file
  const handlePdfFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage(t('tools.splitPdf.errorInvalidType'));
      return;
    }

    setErrorMessage(null);
    setIsInspecting(true);
    setIsSuccess(false);

    if (splitUrlRef.current) {
      URL.revokeObjectURL(splitUrlRef.current);
      splitUrlRef.current = null;
      setSplitUrl(null);
      setSplitBlob(null);
    }

    try {
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const totalPages = pdfDoc.getPageCount();

      setLoadedPdf({
        file,
        name: file.name,
        size: file.size,
        totalPages,
        arrayBuffer: buffer
      });

      // Default smart initial range based on total pages
      if (totalPages === 1) {
        setPageRangeInput('1');
      } else if (totalPages <= 3) {
        setPageRangeInput(`1-${totalPages}`);
      } else {
        setPageRangeInput(`1-${Math.min(3, totalPages)}`);
      }
    } catch (err) {
      console.error('Inspection error:', err);
      setErrorMessage(t('tools.splitPdf.errorProcessing'));
    } finally {
      setIsInspecting(false);
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

  // Quick preset shortcuts
  const applyPreset = (preset: 'all' | 'first' | 'last' | 'odd' | 'even') => {
    if (!loadedPdf) return;
    const total = loadedPdf.totalPages;

    setIsSuccess(false);

    switch (preset) {
      case 'all':
        setPageRangeInput(`1-${total}`);
        break;
      case 'first':
        setPageRangeInput('1');
        break;
      case 'last':
        setPageRangeInput(`${total}`);
        break;
      case 'odd': {
        const odds: number[] = [];
        for (let i = 1; i <= total; i += 2) odds.push(i);
        setPageRangeInput(odds.join(', '));
        break;
      }
      case 'even': {
        const evens: number[] = [];
        for (let i = 2; i <= total; i += 2) evens.push(i);
        setPageRangeInput(evens.length > 0 ? evens.join(', ') : '1');
        break;
      }
    }
  };

  // PDF Extraction Logic with pdf-lib
  const handleExtract = async () => {
    if (!loadedPdf) return;

    if (parsedPages.pages.length === 0 || parsedPages.errors.length > 0) {
      setErrorMessage(t('tools.splitPdf.errorNoPages'));
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Load source PDF from stored ArrayBuffer
      const sourcePdf = await PDFDocument.load(loadedPdf.arrayBuffer, { ignoreEncryption: true });

      // 2. Create target PDF document
      const targetPdf = await PDFDocument.create();

      // 3. Convert 1-based page numbers to 0-based page indices
      const pageIndices = parsedPages.pages.map((p) => p - 1);

      // 4. Copy and append specified pages
      const copiedPages = await targetPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach((page) => targetPdf.addPage(page));

      // 5. Serialize into Blob
      const targetBytes = await targetPdf.save();
      const outputBlob = new Blob([targetBytes as unknown as BlobPart], { type: 'application/pdf' });

      // Clean up previous URL
      if (splitUrlRef.current) {
        URL.revokeObjectURL(splitUrlRef.current);
      }

      const newUrl = URL.createObjectURL(outputBlob);
      splitUrlRef.current = newUrl;

      setSplitBlob(outputBlob);
      setSplitUrl(newUrl);
      setSplitSize(outputBlob.size);
      setIsSuccess(true);
    } catch (err) {
      console.error('PDF extraction error:', err);
      setErrorMessage(t('tools.splitPdf.errorProcessing'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Handler
  const handleDownload = () => {
    if (!splitBlob || !loadedPdf) return;

    const baseName = loadedPdf.name.replace(/\.pdf$/i, '');
    const cleanRange = pageRangeInput.replace(/[^a-zA-Z0-9-]/g, '_');
    const downloadName = `${baseName}-split-${cleanRange}.pdf`;

    const link = document.createElement('a');
    link.href = splitUrl || URL.createObjectURL(splitBlob);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO pageKey="splitPdf" canonicalPath="/split-pdf" />
      {/* Header section with badge */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
          <Scissors className="w-3.5 h-3.5" />
          <span>{t('tools.splitPdf.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-3">
          {t('tools.splitPdf.title')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {t('tools.splitPdf.description')}
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
            {isInspecting ? (
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            ) : (
              <Scissors className="w-10 h-10" />
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2">
            {isInspecting
              ? 'Analyse du fichier PDF en cours...'
              : isDragging
              ? t('tools.splitPdf.dropzoneActive')
              : t('tools.splitPdf.dropzoneTitle')}
          </h3>

          <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            {t('tools.splitPdf.dropzoneSubtitle')}
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/25 hover:bg-primary/95 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t('tools.splitPdf.selectFileBtn')}</span>
          </button>
        </div>
      ) : (
        /* Workspace when single PDF is loaded */
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
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('tools.splitPdf.changeFile')}</span>
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

          {/* Extraction Controls Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2.5 mb-1">
                <Scissors className="w-5 h-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-dark">
                  {t('tools.splitPdf.controlsTitle')}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('tools.splitPdf.controlsDescription')}
              </p>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                {t('tools.splitPdf.quickPresets')}
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyPreset('all')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-700 border border-slate-200 transition-all cursor-pointer"
                >
                  {t('tools.splitPdf.allPages')} (1-{loadedPdf.totalPages})
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('first')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-700 border border-slate-200 transition-all cursor-pointer"
                >
                  {t('tools.splitPdf.firstPage')} (1)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('last')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-700 border border-slate-200 transition-all cursor-pointer"
                >
                  {t('tools.splitPdf.lastPage')} ({loadedPdf.totalPages})
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('odd')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-700 border border-slate-200 transition-all cursor-pointer"
                >
                  {t('tools.splitPdf.oddPages')}
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('even')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-700 border border-slate-200 transition-all cursor-pointer"
                >
                  {t('tools.splitPdf.evenPages')}
                </button>
              </div>
            </div>

            {/* Range Input Field */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-bold text-slate-700">
                <span>{t('tools.splitPdf.rangeLabel')}</span>
                <span className="text-xs font-normal text-slate-500" dir="ltr">
                  Total : {loadedPdf.totalPages} pages
                </span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={pageRangeInput}
                  onChange={(e) => {
                    setPageRangeInput(e.target.value);
                    setIsSuccess(false);
                  }}
                  placeholder={t('tools.splitPdf.rangePlaceholder')}
                  dir="ltr"
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm font-mono font-semibold outline-none transition-all ${
                    parsedPages.errors.length > 0
                      ? 'border-red-300 bg-red-50/40 text-red-800 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark'
                  }`}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t('tools.splitPdf.rangeHelp')} (Exemple : <strong dir="ltr">1-3, 5</strong> extrait les pages 1, 2, 3 et 5).
              </p>

              {/* Parsing Errors */}
              {parsedPages.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
                  {parsedPages.errors.map((err, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Pages Visual Chips */}
            {parsedPages.pages.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>{t('tools.splitPdf.selectedPagesPreview')}</span>
                  </span>
                  <span className="text-primary font-mono" dir="ltr">
                    {parsedPages.pages.length} / {loadedPdf.totalPages} pages
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap max-h-32 overflow-y-auto" dir="ltr">
                  {parsedPages.pages.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-white border border-slate-300 text-slate-800 shadow-2xs"
                    >
                      p. {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleExtract}
                disabled={isProcessing || parsedPages.pages.length === 0 || parsedPages.errors.length > 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary/95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('tools.splitPdf.processing')}</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>{t('tools.splitPdf.extractAction')} ({parsedPages.pages.length} pages)</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Success & Ready to Download Card */}
          {isSuccess && splitBlob && (
            <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-950">
                    {t('tools.splitPdf.statusReady')}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-emerald-800 mt-1 font-semibold">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span dir="ltr">{parsedPages.pages.length} pages extraites</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span dir="ltr">{formatBytes(splitSize)}</span>
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t('tools.splitPdf.downloadBtn')}</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* Enrichissement du contenu SEO & Anti-Thin Content */}
      <ToolInfoSection toolId="split-pdf" />
    </div>
  );
};

export default SplitPdf;
