import React, { useState } from 'react';
import { ShopRecord, Language, PaymentMethod, ExpenseCategory } from '../types';
import { TRANSLATIONS, EXPENSE_CATEGORIES, PAYMENT_METHODS, getCategoryLabel } from '../translations';
import { MinusCircle, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';

interface ExpenseFormProps {
  onSave: (record: Omit<ShopRecord, 'id' | 'created'>) => void;
  lang: Language;
  activeStaffName?: string;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSave, lang, activeStaffName }) => {
  const t = TRANSLATIONS[lang];
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(todayStr);
  const [category, setCategory] = useState<ExpenseCategory>('Printing Materials');
  const [item, setItem] = useState('');
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const expenseShortcuts = [
    { cat: 'Printing Materials' as ExpenseCategory, name: 'Epson Printer Ink Bottles', price: 28000 },
    { cat: 'Stock / Goods Purchase' as ExpenseCategory, name: 'A4 Paper Box (5 Reams)', price: 42000 },
    { cat: 'Electricity / Utilities' as ExpenseCategory, name: 'ESCOM Electricity Units (Token)', price: 15000 },
    { cat: 'Electricity / Utilities' as ExpenseCategory, name: 'Generator Petrol (5 Litres)', price: 12500 },
    { cat: 'Transport' as ExpenseCategory, name: 'Town Minibus Fare & Luggage', price: 3500 },
    { cat: 'Stationery Supplies' as ExpenseCategory, name: 'Counter Books & Pens Stock', price: 25000 },
  ];

  const handleApplyPreset = (preset: { cat: ExpenseCategory; name: string; price: number }) => {
    setCategory(preset.cat);
    setItem(preset.name);
    setAmount(preset.price.toString());
    setError('');
  };

  const handleReset = () => {
    setDate(todayStr);
    setCategory('Printing Materials');
    setItem('');
    setPerson('');
    setAmount('');
    setMethod('Cash');
    setNotes('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!item.trim()) {
      setError(lang === 'en' ? 'Please enter the item or reason for expense.' : 'Lembani katundu kapena chifukwa cha ndalama zotuluka.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setError(lang === 'en' ? 'Amount paid must be greater than 0.' : 'Ndalama zotuluka ziyenera kupitirira 0.');
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onSave({
      type: 'expense',
      date,
      time: timeStr,
      category,
      item: item.trim(),
      person: person.trim(),
      amount: numAmount,
      paid: numAmount, // for expense, paid matches amount
      method,
      notes: notes.trim(),
      staffName: activeStaffName,
    });

    handleReset();
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
      <div className="border-b border-slate-100 pb-5 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
              <MinusCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{t.expenseHeading}</h2>
          </div>
          <p className="text-xs text-slate-500">{t.expenseSub}</p>
        </div>
        {activeStaffName && (
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>{t.activeCashier} {activeStaffName}</span>
          </div>
        )}
      </div>

      {/* Expense Shortcuts */}
      <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{lang === 'en' ? 'Common Shop Expenses (Quick Fill):' : 'Zotuluka Zomwe Zimachitika Kwambiri:'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {expenseShortcuts.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[11px] font-semibold bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{preset.name}</span>
              <span className="text-rose-600 font-mono font-bold">MK {preset.price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.dateLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            />
          </div>

          {/* Expense Category */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.expenseCategoryLabel} <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Item / Reason */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {t.expenseItemLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder={t.expenseItemPlaceholder}
            value={item}
            onChange={(e) => {
              setItem(e.target.value);
              setError('');
            }}
            className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
          />
        </div>

        {/* Paid To & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.paidToLabel}
            </label>
            <input
              type="text"
              placeholder={t.paidToPlaceholder}
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.paymentMethodLabel}
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Paid */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {t.amountPaidLabel} <span className="text-red-500">*</span>
          </label>
          <div className="relative max-w-sm">
            <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">MK</span>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              className="w-full pl-11 pr-3.5 py-2.5 text-base font-bold font-mono text-rose-600 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {t.notesLabel}
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Receipt #104 filed in expenses binder, purchased at city center branch"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-wrap gap-3">
          <button
            type="submit"
            className="flex-1 py-3 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <MinusCircle className="w-4 h-4" />
            <span>{t.saveExpenseBtn}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.clearBtn}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
