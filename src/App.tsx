import { lazy, Suspense, type FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';

// Route-level lazy loading for tools and static pages
const CompressImage = lazy(() => import('./components/tools/CompressImage').then(m => ({ default: m.CompressImage })));
const ResizeImage = lazy(() => import('./components/tools/ResizeImage').then(m => ({ default: m.ResizeImage })));
const ConvertImage = lazy(() => import('./components/tools/ConvertImage').then(m => ({ default: m.ConvertImage })));
const CropImage = lazy(() => import('./components/tools/CropImage').then(m => ({ default: m.CropImage })));
const RotateFlipImage = lazy(() => import('./components/tools/RotateFlipImage').then(m => ({ default: m.RotateFlipImage })));
const WatermarkImage = lazy(() => import('./components/tools/WatermarkImage').then(m => ({ default: m.WatermarkImage })));
const ImageToPdf = lazy(() => import('./components/tools/ImageToPdf').then(m => ({ default: m.ImageToPdf })));
const MergePdf = lazy(() => import('./components/tools/MergePdf').then(m => ({ default: m.MergePdf })));
const SplitPdf = lazy(() => import('./components/tools/SplitPdf').then(m => ({ default: m.SplitPdf })));
const RotatePdf = lazy(() => import('./components/tools/RotatePdf').then(m => ({ default: m.RotatePdf })));
const DeletePdfPages = lazy(() => import('./components/tools/DeletePdfPages').then(m => ({ default: m.DeletePdfPages })));
const PdfToJpg = lazy(() => import('./components/tools/PdfToJpg').then(m => ({ default: m.PdfToJpg })));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfUse = lazy(() => import('./pages/TermsOfUse').then(m => ({ default: m.TermsOfUse })));
const About = lazy(() => import('./pages/About').then(m => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));

// Accessible and responsive loading fallback
const PageLoader: FC = () => (
  <div className="flex-1 w-full min-h-[50vh] flex flex-col items-center justify-center p-8 animate-in fade-in duration-200">
    <div className="relative flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
    </div>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/compress" element={<CompressImage />} />
              <Route path="/resize" element={<ResizeImage />} />
              <Route path="/convert" element={<ConvertImage />} />
              <Route path="/crop" element={<CropImage />} />
              <Route path="/rotate-flip" element={<RotateFlipImage />} />
              <Route path="/watermark" element={<WatermarkImage />} />
              <Route path="/image-to-pdf" element={<ImageToPdf />} />
              <Route path="/merge-pdf" element={<MergePdf />} />
              <Route path="/split-pdf" element={<SplitPdf />} />
              <Route path="/rotate-pdf" element={<RotatePdf />} />
              <Route path="/delete-pdf-pages" element={<DeletePdfPages />} />
              <Route path="/pdf-to-jpg" element={<PdfToJpg />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
