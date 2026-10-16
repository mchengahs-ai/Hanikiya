import React from 'react';
import { Language, IncomeCategory } from '../types';
import { TRANSLATIONS, SERVICES_CATALOG, ServiceDetail } from '../translations';
import { 
  Printer, 
  Camera, 
  Copy, 
  BookOpen, 
  Palette, 
  Layers, 
  ShieldCheck, 
  Video, 
  Mic, 
  MoreHorizontal,
  PlusCircle,
  Tag
} from 'lucide-react';

interface ServicesViewProps {
  lang: Language;
  onSelectService: (category: IncomeCategory, item?: string, price?: number) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ lang, onSelectService }) => {
  const t = TRANSLATIONS[lang];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Printer':
        return <Printer className="w-5 h-5" />;
      case 'Camera':
        return <Camera className="w-5 h-5" />;
      case 'Copy':
        return <Copy className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Palette':
        return <Palette className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'Video':
        return <Video className="w-5 h-5" />;
      case 'Mic':
        return <Mic className="w-5 h-5" />;
      default:
        return <MoreHorizontal className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
        <h2 className="text-xl font-extrabold text-slate-900">{t.tabServices}</h2>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'en'
            ? 'Official service catalog for HANIKIYA STATIONERY, GRAPHICS & PRODUCTION. Click "Quick Order" on any service or product to record a new sale instantly.'
            : 'Zonse zomwe zimagulitsidwa ndi kuperekedwa ku HANIKIYA STATIONERY, GRAPHICS & PRODUCTION. Dinani pa ntchito kapena katundu aliyense kuti mulembe malonda mwachangu.'}
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES_CATALOG.map((svc: ServiceDetail) => {
          return (
            <div
              key={svc.category}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Icon & Title */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-sky-950 text-amber-400">
                    {getIcon(svc.iconName)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {lang === 'en' ? svc.titleEn : svc.titleNy}
                    </h3>
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                      {svc.category}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {lang === 'en' ? svc.descEn : svc.descNy}
                </p>

                {/* Pricing Guide */}
                <div className="mb-4 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 text-xs flex items-center gap-1.5 text-amber-900 font-medium">
                  <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="text-[11px]">{lang === 'en' ? svc.pricingEn : svc.pricingNy}</span>
                </div>

                {/* Popular items shortcuts */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {lang === 'en' ? 'Quick Items:' : 'Zinthu Zotchuka:'}
                  </span>
                  {svc.popularItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectService(svc.category, lang === 'en' ? item.itemEn : item.itemNy, item.defaultPrice)}
                      className="w-full text-left p-1.5 rounded-lg bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-100 text-slate-700 text-[11px] flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="truncate pr-2">{lang === 'en' ? item.itemEn : item.itemNy}</span>
                      {item.defaultPrice && (
                        <span className="font-mono font-bold text-emerald-700 shrink-0">
                          MK {item.defaultPrice.toLocaleString()}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectService(svc.category)}
                className="w-full py-2.5 px-4 bg-sky-900 hover:bg-sky-800 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'en' ? 'Record Sale for this Service' : 'Lembani Malonda a Ntchito Iyi'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
