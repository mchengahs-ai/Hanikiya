import React, { useState } from 'react';
import { ShopRecord, Language, PaymentMethod, IncomeCategory } from '../types';
import { TRANSLATIONS, SERVICES, PAYMENT_METHODS, getCategoryLabel, SERVICES_CATALOG } from '../translations';
import { PlusCircle, Printer, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';

interface IncomeFormProps {
  onSave: (record: Omit<ShopRecord, 'id' | 'created'>, printAfter: boolean) => void;
  lang: Language;
  prefillService?: IncomeCategory;
  prefillItem?: string;
  prefillPrice?: number;
  activeStaffName?: string;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({
  onSave,
  lang,
  prefillService,
  prefillItem,
  prefillPrice,
  activeStaffName,
}) => {
  const t = TRANSLATIONS[lang];
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(todayStr);
  const [category, setCategory] = useState<IncomeCategory>(prefillService || 'Photocopy');
  const [item, setItem] = useState(prefillItem || '');
  const [person, setPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(prefillPrice ? prefillPrice.toString() : '');
  const [paid, setPaid] = useState(prefillPrice ? prefillPrice.toString() : '');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Quick presets from the catalog
  const popularPresets = [
    { cat: 'Photocopy' as IncomeCategory, name: 'Photocopy A4 (B&W)', price: 50 },
    { cat: 'Photocopy' as IncomeCategory, name: 'Photocopy A4 (Color)', price: 300 },
    { cat: 'Photoshoot' as IncomeCategory, name: 'Passport Photos (Set of 4)', price: 2500 },
    { cat: 'Stationery Sales' as IncomeCategory, name: 'A4 Paper Ream (80gsm)', price: 8500 },
    { cat: 'Printing' as IncomeCategory, name: 'Document Printing A4 Color', price: 600 },
    { cat: 'Binding' as IncomeCategory, name: 'Spiral Binding (Document)', price: 1500 },
    { cat: 'Laminating' as IncomeCategory, name: 'Laminating A4 Certificate', price: 1000 },
    { cat: 'Designing / Graphic Design' as IncomeCategory, name: 'Business Flyer Design', price: 7000 },
  ];

  const handleApplyPreset = (preset: { cat: IncomeCategory; name: string; price: number }) => {
    setCategory(preset.cat);
    setItem(preset.name);
    setAmount(preset.price.toString());
    setPaid(preset.price.toString());
    setError('');
  };

  const numAmount = parseFloat(amount) || 0;
  const numPaid = parseFloat(paid) || 0;
  const balanceDue = Math.max(0, numAmount - numPaid);

  const handlePaidFull = () => {
    setPaid(amount);
    setError('');
  };

  const handleHalfPaid = () => {
    if (numAmount > 0) {
      setPaid((numAmount / 2).toString());
      setError('');
    }
  };

  const handleReset = () => {
    setDate(todayStr);
    setCategory('Photocopy');
    setItem('');
    setPerson('');
    setPhone('');
    setAmount('');
    setPaid('');
    setMethod('Cash');
    setNotes('');
    setError('');
  };

  const handleSubmit = (printAfter: boolean) => {
    if (!item.trim()) {
      setError(lang === 'en' ? 'Please enter the item or service description.' : 'Lembani katundu kapena ntchito yomwe mwapereka.');
      return;
    }

    if (numAmount <= 0) {
      setError(lang === 'en' ? 'Total amount must be greater than 0.' : 'Ndalama zonse ziyenera kupitirira 0.');
      return;
    }

    if (numPaid < 0) {
      setError(lang === 'en' ? 'Amount received cannot be negative.' : 'Ndalama yolandiridwa singakhale yochepera 0.');
      return;
    }

    if (numPaid > numAmount) {
      setError(t.amountError);
      return;
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    onSave(
      {
        type: 'income',
        date,
        time: timeStr,
        category,
        item: item.trim(),
        person: person.trim(),
        phone: phone.trim(),
        amount: numAmount,
        paid: numPaid,
        method,
        notes: notes.trim(),
        staffName: activeStaffName,
      },
      printAfter
    );

    handleReset();
  };

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
      <div className="border-b border-slate-100 pb-5 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">{t.incomeHeading}</h2>
          </div>
          <p className="text-xs text-slate-500">{t.incomeSub}</p>
        </div>
        {activeStaffName && (
          <div className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{t.activeCashier} {activeStaffName}</span>
          </div>
        )}
      </div>

      {/* Popular Shortcuts */}
      <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{t.fastPresetsTitle}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularPresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[11px] font-semibold bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-900 border border-slate-200 px-3 py-1.5 rounded-lg transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{preset.name}</span>
              <span className="text-emerald-700 font-mono font-bold">MK {preset.price.toLocaleString()}</span>
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
        className="space-y-4"
      >
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
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white"
            />
          </div>

          {/* Income Category */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.categoryLabel} <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IncomeCategory)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white"
            >
              {SERVICES.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Item / Service */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {t.itemLabel} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder={t.itemPlaceholder}
            value={item}
            onChange={(e) => {
              setItem(e.target.value);
              setError('');
            }}
            className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          />
        </div>

        {/* Customer Name & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.customerLabel}
            </label>
            <input
              type="text"
              placeholder={t.customerPlaceholder}
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.phoneLabel}
            </label>
            <input
              type="text"
              placeholder={t.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-mono"
            />
          </div>
        </div>

        {/* Money Calculations: Total Amount, Amount Received, Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Total Amount */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {t.totalAmountLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
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
                className="w-full pl-11 pr-3.5 py-2.5 text-sm font-bold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Amount Received */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                {t.amountReceivedLabel} <span className="text-red-500">*</span>
              </label>
              {numAmount > 0 && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handlePaidFull}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    100%
                  </button>
                  <button
                    type="button"
                    onClick={handleHalfPaid}
                    className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    50%
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">MK</span>
              <input
                type="number"
                step="any"
                min="0"
                required
                placeholder="0.00"
                value={paid}
                onChange={(e) => {
                  setPaid(e.target.value);
                  setError('');
                }}
                className="w-full pl-11 pr-3.5 py-2.5 text-sm font-bold font-mono text-emerald-700 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
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
              className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Balance / Debt feedback */}
        {numAmount > 0 && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              balanceDue > 0
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {balanceDue > 0 ? (
              <>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t.balanceDueNotice}</span>
                </div>
                <span className="font-mono font-extrabold text-sm text-red-600">
                  MK {balanceDue.toLocaleString()}
                </span>
              </>
            ) : (
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{t.paidInFullNotice}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            {t.notesLabel}
          </label>
          <textarea
            rows={2}
            placeholder={t.notesPlaceholder}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          ></textarea>
        </div>

        {/* Submit Buttons */}
        <div className="pt-3 flex flex-wrap gap-3">
          <button
            type="submit"
            className="flex-1 py-3 px-5 rounded-xl bg-sky-900 hover:bg-sky-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>{t.saveIncomeBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t.saveAndPrintBtn}</span>
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
