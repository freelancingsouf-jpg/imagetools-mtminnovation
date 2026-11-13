import { useState, useRef, useEffect, useMemo, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from 'pdf-lib';
import {
  UploadCloud,
  FileText,
  Trash2,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  Layers,
  FileX2
} from 'lucide-react';
import { formatBytes } from './CompressImage';

interface PdfFileMetadata {
  file: File;
  name: string;
  size: number;
  totalPages: number;
  arrayBuffer: ArrayBuffer;
}

export const DeletePdfPages: FC = () => {
  const { t } = useTranslation();

  // File states
  const [loadedPdf, setLoadedPdf] = useState<PdfFileMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deletion input state (e.g. "2, 4-5")
  const [deleteInput, setDeleteInput] = useState<string>('2');

  // Result state
  const [deletedBlob, setDeletedBlob] = useState<Blob | null>(null);
  const [deletedUrl, setDeletedUrl] = useState<string | null>(null);
  const [deletedSize, setDeletedSize] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deletedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    deletedUrlRef.current = deletedUrl;
  }, [deletedUrl]);

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      if (deletedUrlRef.current) {
        URL.revokeObjectURL(deletedUrlRef.current);
      }
    };
  }, []);

  // Parse and validate pages to delete
  const parsedDelete = useMemo<{ pages: number[]; errors: string[] }>(() => {
    if (!loadedPdf) return { pages: [], errors: [] };

    const raw = deleteInput.trim();
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

    if (sortedPages.length >= total) {
      errors.push(t('tools.deletePdfPages.errorAllPages'));
    }

    return { pages: sortedPages, errors };
  }, [deleteInput, loadedPdf, t]);

  // Handle incoming file
  const handlePdfFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage(t('tools.deletePdfPages.errorInvalidType'));
      return;
    }

    setErrorMessage(null);
    setIsSuccess(false);

    if (deletedUrlRef.current) {
      URL.revokeObjectURL(deletedUrlRef.current);
      deletedUrlRef.current = null;
      setDeletedUrl(null);
      setDeletedBlob(null);
    }

    try {
      const buffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const totalPages = doc.getPageCount();

      setLoadedPdf({
        file,
        name: file.name,
        size: file.size,
        totalPages,
        arrayBuffer: buffer
      });

      // Default page to delete (e.g. page 2 if doc has multiple pages)
      if (totalPages > 1) {
        setDeleteInput('2');
      } else {
        setDeleteInput('');
      }
    } catch (err) {
      console.error('Inspection error:', err);
      setErrorMessage(t('tools.deletePdfPages.errorProcessing'));
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

  // Delete execution with pdf-lib
  const handleDeletePages = async () => {
    if (!loadedPdf) return;

    if (parsedDelete.pages.length === 0 || parsedDelete.errors.length > 0) {
      setErrorMessage(t('tools.deletePdfPages.errorNoPages'));
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Load document
      const doc = await PDFDocument.load(loadedPdf.arrayBuffer, { ignoreEncryption: true });

      // 2. Sort indices in DESCENDING order so index shift doesn't corrupt subsequent removals
      const descendingIndices = parsedDelete.pages.map((p) => p - 1).sort((a, b) => b - a);

      for (const idx of descendingIndices) {
        doc.removePage(idx);
      }

      // 3. Serialize to Blob
      const outputBytes = await doc.save();
      const outputBlob = new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });

      // Clean up previous URL
      if (deletedUrlRef.current) {
        URL.revokeObjectURL(deletedUrlRef.current);
      }

      const newUrl = URL.createObjectURL(outputBlob);
      deletedUrlRef.current = newUrl;

      setDeletedBlob(outputBlob);
      setDeletedUrl(newUrl);
      setDeletedSize(outputBlob.size);
      setIsSuccess(true);
    } catch (err) {
      console.error('Delete pages error:', err);
      setErrorMessage(t('tools.deletePdfPages.errorProcessing'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Handler
  const handleDownload = () => {
    if (!deletedBlob || !loadedPdf) return;

    const baseName = loadedPdf.name.replace(/\.pdf$/i, '');
    const downloadName = `${baseName}-remaining-pages.pdf`;

    const link = document.createElement('a');
    link.href = deletedUrl || URL.createObjectURL(deletedBlob);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const remainingPagesCount = loadedPdf ? loadedPdf.totalPages - parsedDelete.pages.length : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section with badge */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-semibold uppercase tracking-wider mb-3">
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t('tools.deletePdfPages.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-3">
          {t('tools.deletePdfPages.title')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {t('tools.deletePdfPages.description')}
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
          className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-16 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center bg-white shadow-sm group hover:border-red-400 hover:bg-slate-50/50 ${
            isDragging
              ? 'border-red-500 bg-red-50/20 scale-[1.008]'
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

          <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 group-hover:scale-110 group-hover:shadow-md transition-all duration-200 mb-6">
            <Trash2 className="w-10 h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2">
            {isDragging
              ? t('tools.deletePdfPages.dropzoneActive')
              : t('tools.deletePdfPages.dropzoneTitle')}
          </h3>

          <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            {t('tools.deletePdfPages.dropzoneSubtitle')}
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm shadow-md shadow-red-600/25 hover:bg-red-700 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t('tools.deletePdfPages.selectFileBtn')}</span>
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
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('tools.deletePdfPages.changeFile')}</span>
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

          {/* Controls Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2.5 mb-1">
                <FileX2 className="w-5 h-5 text-red-600" />
                <h2 className="text-lg sm:text-xl font-bold text-dark">
                  {t('tools.deletePdfPages.controlsTitle')}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('tools.deletePdfPages.controlsDescription')}
              </p>
            </div>

            {/* Input for pages to delete */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-sm font-bold text-slate-700">
                <span>{t('tools.deletePdfPages.pagesToDeleteLabel')}</span>
                <span className="text-xs font-normal text-slate-500" dir="ltr">
                  Total : {loadedPdf.totalPages} pages
                </span>
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => {
                    setDeleteInput(e.target.value);
                    setIsSuccess(false);
                  }}
                  placeholder={t('tools.deletePdfPages.pagesToDeletePlaceholder')}
                  dir="ltr"
                  className={`w-full px-4 py-3.5 rounded-xl border text-sm font-mono font-semibold outline-none transition-all ${
                    parsedDelete.errors.length > 0
                      ? 'border-red-300 bg-red-50/40 text-red-800 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 text-dark'
                  }`}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t('tools.deletePdfPages.pagesToDeleteHelp')} (Ex: <strong dir="ltr">2, 4-5</strong> supprimera les pages 2, 4 et 5).
              </p>

              {/* Parsing errors */}
              {parsedDelete.errors.length > 0 && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
                  {parsedDelete.errors.map((err, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Visual preview of pages to be deleted & remaining pages */}
            {parsedDelete.pages.length > 0 && parsedDelete.errors.length === 0 && (
              <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-red-800">
                  <span className="flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Pages ciblées pour suppression ({parsedDelete.pages.length}) :</span>
                  </span>
                  <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md" dir="ltr">
                    {remainingPagesCount} page(s) restante(s)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap" dir="ltr">
                  {parsedDelete.pages.map((p) => (
                    <span
                      key={p}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-white border border-red-300 text-red-700 shadow-2xs"
                    >
                      ✕ p. {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleDeletePages}
                disabled={isProcessing || parsedDelete.pages.length === 0 || parsedDelete.errors.length > 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-red-600 text-white font-bold text-sm shadow-md shadow-red-600/25 hover:bg-red-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('tools.deletePdfPages.processing')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{t('tools.deletePdfPages.deleteAction')} ({parsedDelete.pages.length} pages)</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Success & Ready to Download Card */}
          {isSuccess && deletedBlob && (
            <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-950">
                    {t('tools.deletePdfPages.statusReady')}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-emerald-800 mt-1 font-semibold">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span dir="ltr">{remainingPagesCount} pages restantes</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span dir="ltr">{formatBytes(deletedSize)}</span>
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
                <span>{t('tools.deletePdfPages.downloadBtn')}</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default DeletePdfPages;
