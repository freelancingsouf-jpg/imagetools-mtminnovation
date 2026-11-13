import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { CompressImage } from './components/tools/CompressImage';
import { ResizeImage } from './components/tools/ResizeImage';
import { ConvertImage } from './components/tools/ConvertImage';
import { CropImage } from './components/tools/CropImage';
import { RotateFlipImage } from './components/tools/RotateFlipImage';
import { ImageToPdf } from './components/tools/ImageToPdf';
import { WatermarkImage } from './components/tools/WatermarkImage';
import { MergePdf } from './components/tools/MergePdf';
import { SplitPdf } from './components/tools/SplitPdf';
import { RotatePdf } from './components/tools/RotatePdf';
import { DeletePdfPages } from './components/tools/DeletePdfPages';
import { PdfToJpg } from './components/tools/PdfToJpg';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfUse } from './pages/TermsOfUse';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

export function App() {
  return (
    <BrowserRouter>
      <Layout>
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
      </Layout>
    </BrowserRouter>
  );
}

export default App;
