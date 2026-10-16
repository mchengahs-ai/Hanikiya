import React, { useState } from 'react';
import { ShopRecord, Language, PaymentMethod } from '../types';
import { TRANSLATIONS, SERVICES, EXPENSE_CATEGORIES, PAYMENT_METHODS, getCategoryLabel } from '../translations';
import { X, Check, Edit3 } from 'lucide-react';

interface EditRecordModalProps {
  record: ShopRecord | null;
  onClose: () => void;
  onSave: (updatedRecord: ShopRecord) => void;
  lang: Language;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record,
  onClose,
  onSave,
  lang,
}) => {
  if (!record) return null;

  const t = TRANSLATIONS[lang];
  const isIncome = record.type === 'income';

  const [date, setDate] = useState(record.date);
  const [category, setCategory] = useState(record.category);
  const [item, setItem] = useState(record.item);
  const [person, setPerson] = useState(record.person || '');
  const [phone, setPhone] = useState(record.phone || '');
  const [amount, setAmount] = useState(record.amount.toString());
  const [paid, setPaid] = useState(record.paid.toString());
  const [method, setMethod] = useState<PaymentMethod | string>(record.method || 'Cash');
  const [notes, setNotes] = useState(record.notes || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numPaid = parseFloat(paid);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError(lang === 'en' ? 'Total amount must be greater than 0.' : 'Ndalama zonse ziyenera kupitirira 0.');
      return;
    }

    if (isIncome && numPaid > numAmount) {
      setError(t.amountError);
      return;
    }

    const updated: ShopRecord = {
      ...record,
      date,
      category,
      item,
      person,
      phone,
      amount: numAmount,
      paid: isIncome ? numPaid : numAmount,
      method,
      notes,
    };

    onSave(updated);
    onClose();
  };

  const categories = isIncome ? SERVICES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm">
              {lang === 'en' ? 'Edit Record' : 'Sinthani Record'} — {record.receiptNumber || record.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{t.dateLabel}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isIncome ? t.categoryLabel : t.expenseCategoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {getCategoryLabel(c, lang)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {isIncome ? t.itemLabel : t.expenseItemLabel}
            </label>
            <input
              type="text"
              required
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isIncome ? t.customerLabel : t.paidToLabel}
              </label>
              <input
                type="text"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t.phoneLabel}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {isIncome ? t.totalAmountLabel : t.amountPaidLabel}
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (!isIncome) setPaid(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono font-bold"
              />
            </div>
            {isIncome && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.amountReceivedLabel}
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono font-bold text-emerald-700"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{t.paymentMethodLabel}</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">{t.notesLabel}</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-sky-900 hover:bg-sky-800 text-white rounded-xl font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-amber-400" />
              {lang === 'en' ? 'Save Changes' : 'Sungani Zosinthazi'}
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
