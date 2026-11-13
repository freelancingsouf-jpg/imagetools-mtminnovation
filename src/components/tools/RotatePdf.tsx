import { useState, useRef, useEffect, type FC, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { PDFDocument, degrees } from 'pdf-lib';
import {
  UploadCloud,
  FileText,
  RotateCw,
  RotateCcw,
  Rotate3d,
  Download,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  Layers,
  Undo2
} from 'lucide-react';
import { formatBytes } from './CompressImage';

interface PdfFileMetadata {
  file: File;
  name: string;
  size: number;
  totalPages: number;
  arrayBuffer: ArrayBuffer;
}

export const RotatePdf: FC = () => {
  const { t } = useTranslation();

  // File states
  const [loadedPdf, setLoadedPdf] = useState<PdfFileMetadata | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cumulative rotation state (0, 90, 180, 270)
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Result state
  const [rotatedBlob, setRotatedBlob] = useState<Blob | null>(null);
  const [rotatedUrl, setRotatedUrl] = useState<string | null>(null);
  const [rotatedSize, setRotatedSize] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rotatedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    rotatedUrlRef.current = rotatedUrl;
  }, [rotatedUrl]);

  // Clean memory on unmount
  useEffect(() => {
    return () => {
      if (rotatedUrlRef.current) {
        URL.revokeObjectURL(rotatedUrlRef.current);
      }
    };
  }, []);

  // Handle incoming file
  const handlePdfFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage(t('tools.rotatePdf.errorInvalidType'));
      return;
    }

    setErrorMessage(null);
    setIsSuccess(false);
    setRotationAngle(0);

    if (rotatedUrlRef.current) {
      URL.revokeObjectURL(rotatedUrlRef.current);
      rotatedUrlRef.current = null;
      setRotatedUrl(null);
      setRotatedBlob(null);
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
    } catch (err) {
      console.error('Inspection error:', err);
      setErrorMessage(t('tools.rotatePdf.errorProcessing'));
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

  // Adjust cumulative rotation
  const adjustRotation = (delta: number) => {
    setRotationAngle((prev) => (prev + delta + 360) % 360);
    setIsSuccess(false);
  };

  const resetRotation = () => {
    setRotationAngle(0);
    setIsSuccess(false);
  };

  // Apply rotation using pdf-lib
  const handleApplyRotation = async () => {
    if (!loadedPdf) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // 1. Load document
      const doc = await PDFDocument.load(loadedPdf.arrayBuffer, { ignoreEncryption: true });
      const pages = doc.getPages();

      // 2. Apply rotation to each page
      for (const page of pages) {
        const currentAngle = page.getRotation().angle;
        const newAngle = (currentAngle + rotationAngle + 360) % 360;
        page.setRotation(degrees(newAngle));
      }

      // 3. Serialize to Blob
      const outputBytes = await doc.save();
      const outputBlob = new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });

      // Clean up previous URL
      if (rotatedUrlRef.current) {
        URL.revokeObjectURL(rotatedUrlRef.current);
      }

      const newUrl = URL.createObjectURL(outputBlob);
      rotatedUrlRef.current = newUrl;

      setRotatedBlob(outputBlob);
      setRotatedUrl(newUrl);
      setRotatedSize(outputBlob.size);
      setIsSuccess(true);
    } catch (err) {
      console.error('Rotate PDF error:', err);
      setErrorMessage(t('tools.rotatePdf.errorProcessing'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Handler
  const handleDownload = () => {
    if (!rotatedBlob || !loadedPdf) return;

    const baseName = loadedPdf.name.replace(/\.pdf$/i, '');
    const downloadName = `${baseName}-rotated-${rotationAngle}deg.pdf`;

    const link = document.createElement('a');
    link.href = rotatedUrl || URL.createObjectURL(rotatedBlob);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section with badge */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider mb-3">
          <RotateCw className="w-3.5 h-3.5" />
          <span>{t('tools.rotatePdf.badge')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark tracking-tight mb-3">
          {t('tools.rotatePdf.title')}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {t('tools.rotatePdf.description')}
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
            <RotateCw className="w-10 h-10" />
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-dark mb-2">
            {isDragging
              ? t('tools.rotatePdf.dropzoneActive')
              : t('tools.rotatePdf.dropzoneTitle')}
          </h3>

          <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            {t('tools.rotatePdf.dropzoneSubtitle')}
          </p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/25 hover:bg-primary/95 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{t('tools.rotatePdf.selectFileBtn')}</span>
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
                <span>{t('tools.rotatePdf.changeFile')}</span>
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
                <RotateCw className="w-5 h-5 text-primary" />
                <h2 className="text-lg sm:text-xl font-bold text-dark">
                  {t('tools.rotatePdf.controlsTitle')}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('tools.rotatePdf.controlsDescription')}
              </p>
            </div>

            {/* Visual Angle Indicator */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl bg-white border border-slate-300 shadow-sm flex items-center justify-center text-primary transition-transform duration-300"
                  style={{ transform: `rotate(${rotationAngle}deg)` }}
                >
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {t('tools.rotatePdf.currentRotation')}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-primary font-mono" dir="ltr">
                      +{rotationAngle}°
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {rotationAngle === 0 && '(Orientation normale)'}
                      {rotationAngle === 90 && '(Horaire / Droite)'}
                      {rotationAngle === 180 && '(Inversé / Demi-tour)'}
                      {rotationAngle === 270 && '(Anti-horaire / Gauche)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Rotation Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => adjustRotation(-90)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-primary" />
                  <span>{t('tools.rotatePdf.rotateLeft')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => adjustRotation(90)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
                >
                  <RotateCw className="w-4 h-4 text-primary" />
                  <span>{t('tools.rotatePdf.rotateRight')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => adjustRotation(180)}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs sm:text-sm shadow-2xs transition-all cursor-pointer"
                >
                  <Rotate3d className="w-4 h-4 text-secondary" />
                  <span>{t('tools.rotatePdf.rotate180')}</span>
                </button>

                {rotationAngle !== 0 && (
                  <button
                    type="button"
                    onClick={resetRotation}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-bold text-xs transition-all cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>{t('tools.rotatePdf.resetRotation')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleApplyRotation}
                disabled={isProcessing || rotationAngle === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary/95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('tools.rotatePdf.processing')}</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-4 h-4" />
                    <span>Appliquer la rotation (+{rotationAngle}°)</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Success & Ready to Download Card */}
          {isSuccess && rotatedBlob && (
            <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-950">
                    {t('tools.rotatePdf.statusReady')}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-emerald-800 mt-1 font-semibold">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span dir="ltr">{loadedPdf.totalPages} pages pivotées (+{rotationAngle}°)</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span dir="ltr">{formatBytes(rotatedSize)}</span>
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
                <span>{t('tools.rotatePdf.downloadBtn')}</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default RotatePdf;
