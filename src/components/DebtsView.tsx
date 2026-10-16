import React, { useState } from 'react';
import { ShopRecord, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { Users, Phone, Calendar, CheckCircle2, DollarSign, Printer, Search, AlertCircle } from 'lucide-react';

interface DebtsViewProps {
  records: ShopRecord[];
  lang: Language;
  onOpenSettle: (record: ShopRecord) => void;
  onOpenReceipt: (record: ShopRecord) => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({
  records,
  lang,
  onOpenSettle,
  onOpenReceipt,
}) => {
  const t = TRANSLATIONS[lang];
  const [search, setSearch] = useState('');

  // Unpaid records
  const debtorRecords = records.filter(
    (r) => r.type === 'income' && Number(r.amount || 0) > Number(r.paid || 0)
  );

  const totalOwed = debtorRecords.reduce(
    (sum, r) => sum + Math.max(0, Number(r.amount || 0) - Number(r.paid || 0)),
    0
  );

  const filteredDebtors = debtorRecords.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.person || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q) ||
      r.item.toLowerCase().includes(q) ||
      (r.notes || '').toLowerCase().includes(q) ||
      (r.receiptNumber || '').toLowerCase().includes(q)
    );
  });

  const formatMoney = (val: number) => {
    return `MK ${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-800">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{t.debtsHeading}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{t.debtsSub}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-right sm:min-w-[200px]">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              {t.totalOwed}
            </span>
            <span className="text-2xl font-extrabold font-mono text-red-600 block mt-0.5">
              {formatMoney(totalOwed)}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">
              {debtorRecords.length} {debtorRecords.length === 1 ? 'customer' : 'customers'}
            </span>
          </div>
        </div>

        {/* Search */}
        {debtorRecords.length > 0 && (
          <div className="mt-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search customer name, phone, item...' : 'Sakani dzina, foni, kapena katundu...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Debtors List */}
      {debtorRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{t.noDebtsMessage}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {lang === 'en'
              ? 'All sales recorded are paid in full. When a customer takes a service on credit, their balance will be tracked here.'
              : 'Malonda onse omwe alowa alipidwa mokwanira. Ngati kasitomala atenga katundu wangongole, adzaonekera pano.'}
          </p>
        </div>
      ) : filteredDebtors.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 text-xs text-slate-400">
          {lang === 'en' ? 'No debtors found matching your search.' : 'Palibe kasitomala amene wapezeka pakufufuza kwanu.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDebtors.map((r) => {
            const balanceDue = Math.max(0, Number(r.amount || 0) - Number(r.paid || 0));

            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs hover:border-amber-400 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {r.person || (lang === 'en' ? 'Unnamed Customer' : 'Kasitomala Wosatchulidwa')}
                      </h4>
                      {r.phone && (
                        <a
                          href={`tel:${r.phone}`}
                          className="inline-flex items-center gap-1 text-xs text-sky-700 hover:text-sky-900 font-mono mt-0.5"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{r.phone}</span>
                        </a>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {r.receiptNumber || r.id}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1 mb-4">
                    <p className="font-bold text-slate-800">{r.item}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{r.date} {r.time ? `• ${r.time}` : ''}</span>
                    </p>
                    {r.notes && (
                      <p className="text-[11px] text-slate-600 italic mt-1 pt-1 border-t border-slate-200/60">
                        &ldquo;{r.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-semibold block">{t.invoiceTotal}</span>
                      <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
                        {formatMoney(r.amount)}
                      </span>
                    </div>

                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <span className="text-[10px] text-emerald-700 font-semibold block">{t.amountPaidSoFar}</span>
                      <span className="font-mono font-bold text-emerald-700 text-xs mt-0.5 block">
                        {formatMoney(r.paid)}
                      </span>
                    </div>

                    <div className="p-2 bg-red-50 rounded-xl">
                      <span className="text-[10px] text-red-700 font-bold block">{t.remainingOwed}</span>
                      <span className="font-mono font-extrabold text-red-700 text-xs mt-0.5 block">
                        {formatMoney(balanceDue)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onOpenSettle(r)}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>{t.collectPaymentBtn}</span>
                  </button>
                  <button
                    onClick={() => onOpenReceipt(r)}
                    title={t.btnReceipt}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
