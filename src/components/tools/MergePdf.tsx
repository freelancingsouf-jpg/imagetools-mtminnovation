import { useState, useRef, useEffect, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument } from 'pdf-lib';
import { SEO } from '../SEO';
import { ToolInfoSection } from '../ToolInfoSection';
import {
  UploadCloud,
  FileText,
  Combine,
  Download,
  AlertCircle,
  Loader2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  RotateCcw,
  CheckCircle2,
  Layers,
  HardDrive
} from 'lucide-react';
import { formatBytes } from './CompressImage';

interface PdfItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export const MergePdf: FC = () => {
  const { t } = useTranslation();

  // State
  const [pdfFiles, setPdfFiles] = useState<PdfItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [mergedSize, setMergedSize] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);
  const mergedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    mergedUrlRef.current = mergedUrl;
  }, [mergedUrl]);

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      if (mergedUrlRef.current) {
        URL.revokeObjectURL(mergedUrlRef.current);
      }
    };
  }, []);

  // Inspect PDF files and extract page counts
  const processIncomingFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    setIsSuccess(false);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      setErrorMessage(t('tools.mergePdf.errorInvalidType'));
      return;
    }

    setIsInspecting(true);

    try {
      const newItems: PdfItem[] = [];

      for (const file of validFiles) {
        let pageCount = 1;
        try {
          const buffer = await file.arrayBuffer();
          const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
          pageCount = doc.getPageCount();
        } catch (e) {
          console.warn('Could not read page count for', file.name, e);
        }

        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          name: file.name,
          size: file.size,
          pageCount
        });
      }

      setPdfFiles((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error('Inspection error:', err);
      setErrorMessage(t('tools.mergePdf.errorProcessing'));
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(e.target.files);
    }
    // reset input value so re-selecting same files works
    e.target.value = '';
  };

  // Reordering handlers
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pdfFiles.length - 1) return;

    setPdfFiles((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });

    // Invalidate previous merged output
    setIsSuccess(false);
    if (mergedUrlRef.current) {
      URL.revokeObjectURL(mergedUrlRef.current);
      mergedUrlRef.current = null;
      setMergedUrl(null);
      setMergedBlob(null);
    }
  };

  const removeItem = (id: string) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
    setIsSuccess(false);
    if (mergedUrlRef.current) {
      URL.revokeObjectURL(mergedUrlRef.current);
      mergedUrlRef.current = null;
      setMergedUrl(null);
      setMergedBlob(null);
    }
  };

  const clearAll = () => {
    setPdfFiles([]);
    setIsSuccess(false);
    if (mergedUrlRef.current) {
      URL.revokeObjectURL(mergedUrlRef.current);
      mergedUrlRef.current = null;
      setMergedUrl(null);
      setMergedBlob(null);
    }
  };

  // Merge execution using pdf-lib
  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      setErrorMessage(t('tools.mergePdf.errorMinFiles'));
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Create a new empty PDF Document
      const mergedPdf = await PDFDocument.create();

      // 2. Loop through each uploaded PDF in current list order
      for (const item of pdfFiles) {
        const fileBuffer = await item.file.arrayBuffer();
        const sourceDoc = await PDFDocument.load(fileBuffer, { ignoreEncryption: true });
        
        // Copy all pages from current document
        const copiedPages = await mergedPdf.copyPages(sourceDoc, sourceDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // 3. Serialize to Uint8Array and Blob
      const mergedPdfBytes = await mergedPdf.save();
      const outputBlob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });

      // Clean up previous URL
      if (mergedUrlRef.current) {
        URL.revokeObjectURL(mergedUrlRef.current);
      }

      const newUrl = URL.createObjectURL(outputBlob);
      mergedUrlRef.current = newUrl;

      setMergedBlob(outputBlob);
      setMergedUrl(newUrl);
      setMergedSize(outputBlob.size);
      setIsSuccess(true);
    } catch (err) {
      console.error('PDF merge error:', err);
      setErrorMessage(t('tools.mergePdf.errorProcessing'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Handler
  const handleDownload = () => {
    if (!mergedBlob) return;

    const firstFileName = pdfFiles[0]?.name.replace(/\.pdf$/i, '') || 'document';
    const downloadName = `${firstFileName}-merged.pdf`;

    const link = document.createElement('a');
    link.href = mergedUrl || URL.createObjectURL(mergedBlob);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals
  const totalPages = pdfFiles.reduce((acc, curr) => acc + curr.pageCount, 0);
  const totalBytes = pdfFiles.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO pageKey="mergePdf" canonicalPath="/merge-pdf" />
      {/* Header section with badge */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
          <Combine className="w-3.5 h-3.5" />
          <span>{t('tools.mergePdf.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-3">
          {t('tools.mergePdf.title')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {t('tools.mergePdf.description')}
        </p>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Upload Dropzone (When no files are loaded yet) */}
      {pdfFiles.length === 0 ? (
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
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-md transition-all duration-200 mb-6">
            <Combine className="w-10 h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2">
            {isDragging
              ? t('tools.mergePdf.dropzoneActive')
              : t('tools.mergePdf.dropzoneTitle')}
          </h3>

          <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            {t('tools.mergePdf.dropzoneSubtitle')}
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/25 hover:bg-primary/95 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t('tools.mergePdf.selectFilesBtn')}</span>
          </button>
        </div>
      ) : (
        /* Workspace when files are uploaded */
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Top Summary Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark">
                  {t('tools.mergePdf.fileListTitle')}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-primary" dir="ltr">
                    {pdfFiles.length} {t('tools.mergePdf.stats.totalFiles').toLowerCase()}
                  </span>
                  <span>•</span>
                  <span className="font-mono" dir="ltr">
                    {totalPages} {t('tools.mergePdf.stats.totalPages').toLowerCase()}
                  </span>
                  <span>•</span>
                  <span className="font-mono" dir="ltr">
                    {formatBytes(totalBytes)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons on top bar */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => addMoreInputRef.current?.click()}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{t('tools.mergePdf.addMoreBtn')}</span>
              </button>
              <input
                ref={addMoreInputRef}
                type="file"
                accept="application/pdf,.pdf"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={clearAll}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('tools.mergePdf.clearAllBtn')}</span>
              </button>
            </div>
          </div>

          {/* Reorderable File List Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <p className="text-xs sm:text-sm text-slate-500">
                {t('tools.mergePdf.fileListDescription')}
              </p>
              {isInspecting && (
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyse des fichiers...</span>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              {pdfFiles.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/70 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Position badge */}
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono font-bold text-xs flex items-center justify-center shadow-xs flex-shrink-0" dir="ltr">
                      {index + 1}
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-red-100/80 text-red-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-dark truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-primary px-2 py-0.2 rounded-md bg-primary/10" dir="ltr">
                          {item.pageCount} {item.pageCount > 1 ? 'pages' : 'page'}
                        </span>
                        <span>•</span>
                        <span dir="ltr" className="font-mono">
                          {formatBytes(item.size)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ordering Controls & Delete */}
                  <div className="flex items-center gap-1.5 ms-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0 || isProcessing}
                      title={t('tools.mergePdf.moveUp')}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200/80 border border-slate-200 text-slate-600 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === pdfFiles.length - 1 || isProcessing}
                      title={t('tools.mergePdf.moveDown')}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200/80 border border-slate-200 text-slate-600 disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={isProcessing}
                      title={t('tools.mergePdf.delete')}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Merge Action Panel */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                <span className="font-bold text-dark">{t('tools.mergePdf.stats.totalPages')} :</span>
                <span className="font-mono font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10" dir="ltr">
                  {totalPages} pages
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleMerge}
                  disabled={isProcessing || pdfFiles.length < 2}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary/95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('tools.mergePdf.processing')}</span>
                    </>
                  ) : (
                    <>
                      <Combine className="w-4 h-4" />
                      <span>{t('tools.mergePdf.mergeAction')} ({pdfFiles.length} PDF)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Success & Ready to Download Card */}
          {isSuccess && mergedBlob && (
            <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-950">
                    {t('tools.mergePdf.statusReady')}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-emerald-800 mt-1 font-semibold">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span dir="ltr">{totalPages} pages</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span dir="ltr">{formatBytes(mergedSize)}</span>
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
                <span>{t('tools.mergePdf.downloadBtn')}</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* Enrichissement du contenu SEO & Anti-Thin Content */}
      <ToolInfoSection toolId="merge-pdf" />
    </div>
  );
};

export default MergePdf;
