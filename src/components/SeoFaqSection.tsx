import { useState, type FC } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Zap,
  Sparkles,
  FileCheck2,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'كيف يمكنني ضغط الصور أونلاين وتقليل حجمها دون فقدان الجودة؟',
    answer:
      'تتيح لك أداة ImageTools ضغط الصور أونلاين مجاناً (compresser image gratuit) عبر متصفحك مباشرة؛ حيث تستخدم خوارزميات ذكية لتقليل حجم ملفات JPG و PNG و WebP بنسبة تصل إلى 80% مع الحفاظ التام على حدة الصورة وتفاصيلها دون الحاجة لرفعها إلى أي خادم خارجي.',
  },
  {
    question: 'هل معالجة وتعديل الصور آمنة ومحلية 100%؟',
    answer:
      'نعم، تتم جميع عمليات معالجة الصور محلياً داخل جهازك باستخدام تقنيات المتصفح المتقدمة (WebAssembly و Canvas). صورك وملفاتك لا تغادر جهازك أو حاسوبك مطلقاً، مما يضمن أقصى درجات الخصوصية والأمان.',
  },
  {
    question: 'كيف يعمل تحويل الصور إلى WebP أو JPG أو PNG؟',
    answer:
      'يمكنك تحويل الصور إلى WebP فورياً وبنقرة واحدة لتسريع مواقع الويب وتحسين سيو الصور (SEO)، كما يدعم المحول صيغ PNG الشفافة و JPG عالية الدقة بدون أي قيود على عدد الصور وبشكل مجاني تماماً.',
  },
  {
    question: 'كيف يمكنني تغيير حجم الصورة وتعديل أبعادها بالبكسل؟',
    answer:
      'توفر لك أداة تغيير حجم الصورة إمكانية ضبط العرض والارتفاع بدقة بالبكسل مع قفل تناسب الأبعاد (Aspect Ratio) لضمان عدم تشويه الصورة، بالإضافة إلى إمكانية تصغير أبعاد الصور الكبيرة لتناسب شبكات التواصل الاجتماعي أو البريد الإلكتروني.',
  },
];

export const SeoFaqSection: FC = () => {
  // Keep all FAQs open or toggle individually
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1, 2, 3]);

  const toggleFaq = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section
      dir="rtl"
      className="w-full mt-14 pt-12 border-t border-slate-200/80 text-right font-sans"
      aria-label="SEO and FAQ"
    >
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Main H2 SEO Overview Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2.5 mb-3 text-primary">
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
              معالجة سريعة وخاصة 100%
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4 leading-snug">
            ضغط الصور وتغيير أبعادها وتحويل صيغها (JPG, PNG, WebP) مجاناً
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal mb-8">
            تمنحك منصة <strong>ImageTools</strong> من <strong>MTM Innovation</strong> تجربة متطورة لمعالجة وتعديل الصور مباشرة عبر المتصفح بسرعة فائقة وبدون أي برامج مدفوعة. يمكنك <span className="text-primary font-semibold">ضغط الصور أونلاين</span> لتقليل حجم الملفات بنسبة تصل إلى 80% مع الحفاظ التام على جودة العرض الأصلية وتفاصيل الألوان، بالإضافة إلى إمكانية <span className="text-primary font-semibold">تغيير حجم الصورة</span> بدقة بالبكسل و<span className="text-primary font-semibold">تحويل الصور إلى WebP</span> و JPG و PNG لتسريع تحميل صفحات الويب وتحسين أداء السيو (SEO)؛ وكل ذلك يتم محلياً على جهازك دون رفع أي صورة إلى خوادم خارجية حفاظاً على خصوصيتك المطلقة.
          </p>

          {/* 3 Pillars Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">ضغط وتحويل فوري</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">معالجة فورية بدون قوائم انتظار أو قيود يومية.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">خصوصية وأمان 100%</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">حساباتك محلياً داخل المتصفح، لا نرفع أي ملف.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">صيغ متعددة عالية الدقة</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">دعم WebP الحديث، JPG عالي الدقة و PNG الشفاف.</p>
              </div>
            </div>
          </div>
        </div>

        {/* H3 FAQ Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                الأسئلة الشائعة حول أدوات الصور ImageTools
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                إليك إجابات واضحة عن كل ما يخص ضغط وتعديل وتحويل الصور عبر منصتنا
              </p>
            </div>
          </div>

          {/* Accordion List */}
          <div className="space-y-3.5">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndices.includes(idx);
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden transition-colors bg-slate-50/50 hover:bg-slate-50"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-right cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-800 hover:text-primary transition-colors">
                      {item.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 bg-primary/10 text-primary border-primary/20' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default SeoFaqSection;
