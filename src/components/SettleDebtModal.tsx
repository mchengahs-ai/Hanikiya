import React, { useState } from 'react';
import { ShopRecord, Language, PaymentMethod } from '../types';
import { TRANSLATIONS, PAYMENT_METHODS } from '../translations';
import { X, CheckCircle, Wallet, Calendar, AlertTriangle } from 'lucide-react';

interface SettleDebtModalProps {
  record: ShopRecord | null;
  onClose: () => void;
  onSavePayment: (recordId: string, amount: number, method: PaymentMethod, notes: string) => void;
  lang: Language;
}

export const SettleDebtModal: React.FC<SettleDebtModalProps> = ({
  record,
  onClose,
  onSavePayment,
  lang,
}) => {
  if (!record) return null;

  const t = TRANSLATIONS[lang];
  const remaining = Math.max(0, Number(record.amount || 0) - Number(record.paid || 0));

  const [payAmount, setPayAmount] = useState<string>(remaining.toString());
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handlePayFull = () => {
    setPayAmount(remaining.toString());
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(payAmount);

    if (isNaN(num) || num <= 0) {
      setError(lang === 'en' ? 'Please enter a valid amount greater than 0.' : 'Lembani ndalama yovomerezeka yoposa 0.');
      return;
    }

    if (num > remaining) {
      setError(
        lang === 'en'
          ? `Amount cannot exceed remaining balance of MK ${remaining.toLocaleString()}.`
          : `Ndalama sizingapitirire ngongole yotsala ya MK ${remaining.toLocaleString()}.`
      );
      return;
    }

    onSavePayment(record.id, num, method, paymentNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 to-blue-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400/20 rounded-lg text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">{t.settleModalTitle}</h2>
              <p className="text-xs text-sky-200 font-mono">
                {record.receiptNumber || record.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-sky-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800">
          {/* Debtor Details Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">{t.debtorName}:</span>
              <span className="font-bold text-slate-900 text-sm">{record.person || 'Customer'}</span>
            </div>
            {record.phone && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">{t.phoneLabel}:</span>
                <span className="font-mono text-slate-700">{record.phone}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">{t.itemTaken}:</span>
              <span className="font-semibold text-slate-800 text-right max-w-[200px] truncate">{record.item}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-slate-400 font-semibold">{t.invoiceTotal}</div>
                <div className="font-mono font-bold text-slate-700 text-xs mt-0.5">
                  MK {record.amount.toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <div className="text-[10px] text-emerald-600 font-semibold">{t.amountPaidSoFar}</div>
                <div className="font-mono font-bold text-emerald-700 text-xs mt-0.5">
                  MK {record.paid.toLocaleString()}
                </div>
              </div>
              <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                <div className="text-[10px] text-red-600 font-bold">{t.remainingOwed}</div>
                <div className="font-mono font-black text-red-700 text-xs mt-0.5">
                  MK {remaining.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount to Pay Now */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                {t.amountToPayLabel}
              </label>
              <button
                type="button"
                onClick={handlePayFull}
                className="text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-sky-50 px-2 py-0.5 rounded cursor-pointer"
              >
                {t.payRemainingFull}
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">MK</span>
              <input
                type="number"
                min="1"
                max={remaining}
                step="any"
                required
                value={payAmount}
                onChange={(e) => {
                  setPayAmount(e.target.value);
                  setError('');
                }}
                className="w-full pl-11 pr-3 py-2.5 text-base font-bold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.paymentMethodLabel}
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.notesLabel}
            </label>
            <input
              type="text"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="e.g. Paid in cash via shop counter, final clearance"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              {t.confirmPaymentBtn}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition cursor-pointer"
            >
              {t.closeBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
