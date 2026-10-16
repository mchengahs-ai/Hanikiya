import React from 'react';
import { ShopRecord, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { Printer, X, CheckCircle, AlertCircle, Phone, Calendar, Clock, User, CreditCard } from 'lucide-react';

interface ReceiptModalProps {
  record: ShopRecord | null;
  onClose: () => void;
  lang: Language;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ record, onClose, lang }) => {
  if (!record) return null;

  const t = TRANSLATIONS[lang];
  const isIncome = record.type === 'income';
  const balanceDue = Math.max(0, Number(record.amount || 0) - Number(record.paid || 0));
  const isFullyPaid = balanceDue === 0;

  const handlePrint = () => {
    window.print();
  };

  const formattedMoney = (amount: number) => {
    return `MK ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-sm tracking-wider uppercase">
              {record.receiptNumber || 'RECEIPT'}
            </span>
            <span className="text-slate-400 text-xs">| {t.receiptTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              {t.printReceiptBtn}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div id="printable-receipt" className="p-6 md:p-8 bg-white text-slate-800 font-sans">
          {/* Receipt Header */}
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-5 mb-5">
            <div className="inline-block px-3 py-1 bg-sky-950 text-amber-400 rounded text-[11px] font-black tracking-widest uppercase mb-1">
              HANIKIYA
            </div>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              HANIKIYA STATIONERY, GRAPHICS &amp; PRODUCTION
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium italic">
              &ldquo;{t.motto}&rdquo;
            </p>
            <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap justify-center items-center gap-x-3 gap-y-1">
              <span>{t.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Phone className="w-3 h-3 text-slate-400 inline" /> {t.contact}
              </span>
            </div>
          </div>

          {/* Meta Info: Receipt #, Date, Status */}
          <div className="grid grid-cols-2 gap-3 text-xs mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">
                {t.colReceiptNo}
              </span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                {record.receiptNumber || `HAN-${record.id.slice(-6).toUpperCase()}`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] block font-semibold">
                {t.dateIssued}
              </span>
              <span className="font-medium text-slate-700 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3 text-slate-400 inline" />
                {record.date} {record.time ? `• ${record.time}` : ''}
              </span>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-200 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-900">{record.person || (isIncome ? 'Cash Customer' : 'General Supplier')}</span>
                {record.phone && <span className="text-slate-500 font-mono text-[11px]">({record.phone})</span>}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                {record.staffName && (
                  <span className="bg-sky-50 text-sky-900 font-semibold px-2 py-0.5 rounded border border-sky-100">
                    {lang === 'en' ? 'Served by:' : 'Wothandizidwa ndi:'} {record.staffName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  <span>{record.method || 'Cash'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="mb-5">
            <div className="border-b border-slate-200 pb-1 flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>{t.itemDescription}</span>
              <span>{t.lineTotal}</span>
            </div>

            <div className="py-3 border-b border-slate-200 flex justify-between items-start gap-4">
              <div>
                <p className="font-bold text-slate-900 text-sm">{record.item}</p>
                <div className="inline-block mt-1 text-[11px] text-sky-800 bg-sky-50 px-2 py-0.5 rounded font-medium">
                  {record.category}
                </div>
                {record.notes && (
                  <p className="text-xs text-slate-500 mt-1.5 italic bg-amber-50/60 p-1.5 rounded border border-amber-100/50">
                    {record.notes}
                  </p>
                )}
              </div>
              <span className="font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                {formattedMoney(record.amount)}
              </span>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-1.5 text-xs border-b-2 border-dashed border-slate-300 pb-4 mb-4">
            <div className="flex justify-between text-slate-600">
              <span>{t.subtotal}</span>
              <span className="font-mono font-semibold text-slate-800">{formattedMoney(record.amount)}</span>
            </div>

            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>{t.receivedCash}</span>
              <span className="font-mono font-bold">{formattedMoney(record.paid)}</span>
            </div>

            {isIncome && balanceDue > 0 && (
              <div className="flex justify-between text-red-600 font-bold bg-red-50 p-1.5 rounded">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline" /> {t.balanceRemaining}
                </span>
                <span className="font-mono">{formattedMoney(balanceDue)}</span>
              </div>
            )}
          </div>

          {/* Payment Status Stamp */}
          <div className="text-center py-2 mb-4">
            {isFullyPaid ? (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider border border-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                {t.statusPaid}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider border border-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                {t.statusPartial}
              </div>
            )}
          </div>

          {/* Signatures & Footer Note */}
          <div className="pt-2 text-center text-slate-500 text-xs space-y-3">
            <p className="font-medium text-slate-700">
              {t.thankYou}
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4 text-[10px] text-slate-400">
              <div className="border-t border-slate-300 pt-1 text-center">
                <span>Customer Signature</span>
              </div>
              <div className="border-t border-slate-300 pt-1 text-center">
                <span>Authorized Sign &amp; Stamp</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 pt-2 font-mono">
              Printed via HANIKIYA POS System • Keep this slip safe for queries
            </p>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden in Print) */}
        <div className="no-print bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-semibold text-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            {t.printReceiptBtn}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
