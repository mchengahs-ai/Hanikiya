import React, { useState, useMemo } from 'react';
import { ShopRecord, Language } from '../types';
import { TRANSLATIONS, SERVICES, EXPENSE_CATEGORIES, getCategoryLabel } from '../translations';
import { 
  Search, 
  Filter, 
  Calendar, 
  Printer, 
  Edit3, 
  Trash2, 
  DollarSign, 
  ArrowUpDown, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AllRecordsViewProps {
  records: ShopRecord[];
  lang: Language;
  onOpenReceipt: (record: ShopRecord) => void;
  onOpenEdit: (record: ShopRecord) => void;
  onOpenSettle: (record: ShopRecord) => void;
  onDeleteRecord: (id: string) => void;
  onExportCsv: () => void;
}

export const AllRecordsView: React.FC<AllRecordsViewProps> = ({
  records,
  lang,
  onOpenReceipt,
  onOpenEdit,
  onOpenSettle,
  onDeleteRecord,
  onExportCsv,
}) => {
  const t = TRANSLATIONS[lang];

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'debts'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const weekStartStr = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().slice(0, 10);
  }, []);

  const monthStartStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Type filter
      if (typeFilter === 'income' && r.type !== 'income') return false;
      if (typeFilter === 'expense' && r.type !== 'expense') return false;
      if (typeFilter === 'debts') {
        if (r.type !== 'income' || Number(r.amount || 0) <= Number(r.paid || 0)) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;

      // Date filter
      if (datePreset === 'today' && r.date !== todayStr) return false;
      if (datePreset === 'yesterday' && r.date !== yesterdayStr) return false;
      if (datePreset === 'week' && r.date < weekStartStr) return false;
      if (datePreset === 'month' && r.date < monthStartStr) return false;
      if (datePreset === 'custom') {
        if (fromDate && r.date < fromDate) return false;
        if (toDate && r.date > toDate) return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const text = [
          r.item,
          r.person || '',
          r.phone || '',
          r.category,
          r.notes || '',
          r.method || '',
          r.receiptNumber || '',
        ].join(' ').toLowerCase();

        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [records, typeFilter, categoryFilter, datePreset, fromDate, toDate, search, todayStr, yesterdayStr, weekStartStr, monthStartStr]);

  // Aggregate stats for filtered view
  const filteredIncome = filteredRecords
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + Number(r.paid || 0), 0);

  const filteredExpense = filteredRecords
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const filteredNet = filteredIncome - filteredExpense;

  const formatMoney = (val: number) => {
    return `MK ${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const allAvailableCategories = Array.from(new Set([...SERVICES, ...EXPENSE_CATEGORIES]));

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{t.allRecordsHeading}</h2>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? `Showing ${filteredRecords.length} of ${records.length} total entries`
                : `Mukuona zolembedwa ${filteredRecords.length} mwa zonse ${records.length}`}
            </p>
          </div>
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t.exportCsv}</span>
          </button>
        </div>

        {/* Search & Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white"
            >
              <option value="all">{t.filterAllTypes}</option>
              <option value="income">{t.filterIncomeOnly}</option>
              <option value="expense">{t.filterExpenseOnly}</option>
              <option value="debts">{t.filterDebtsOnly}</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white"
            >
              <option value="all">{t.filterAllCategories}</option>
              {allAvailableCategories.map((c) => (
                <option key={c} value={c}>
                  {getCategoryLabel(c, lang)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Presets */}
          <div>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden bg-white"
            >
              <option value="all">{t.filterAllTime}</option>
              <option value="today">{t.filterToday}</option>
              <option value="yesterday">{t.filterYesterday}</option>
              <option value="week">{t.filterThisWeek}</option>
              <option value="month">{t.filterThisMonth}</option>
              <option value="custom">{t.filterCustom}</option>
            </select>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold">{lang === 'en' ? 'From:' : 'Kuyambira:'}</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold">{lang === 'en' ? 'To:' : 'Kufika:'}</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            {(fromDate || toDate) && (
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
                className="text-xs text-sky-700 hover:underline font-semibold"
              >
                {lang === 'en' ? 'Reset dates' : 'Bwezeretsani masiku'}
              </button>
            )}
          </div>
        )}

        {/* Filtered Aggregates Banner */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-700">{t.filteredSummary}</span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-emerald-700">
              <span className="text-slate-500">{t.totalReceivedFiltered}</span>
              <strong className="font-mono">{formatMoney(filteredIncome)}</strong>
            </span>
            <span className="text-rose-700">
              <span className="text-slate-500">{t.totalSpentFiltered}</span>
              <strong className="font-mono">{formatMoney(filteredExpense)}</strong>
            </span>
            <span className={filteredNet >= 0 ? 'text-sky-900' : 'text-rose-700'}>
              <span className="text-slate-500">{t.netFiltered}</span>
              <strong className="font-mono">{formatMoney(filteredNet)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {t.noRecordsMatch}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3.5 whitespace-nowrap">{t.colDate}</th>
                  <th className="py-3 px-3">{t.colReceiptNo}</th>
                  <th className="py-3 px-3">{t.colType}</th>
                  <th className="py-3 px-3">{t.colCategory}</th>
                  <th className="py-3 px-3">{t.colItem}</th>
                  <th className="py-3 px-3">{t.colPerson}</th>
                  <th className="py-3 px-3 text-right">{t.colTotal}</th>
                  <th className="py-3 px-3 text-right">{t.colPaid}</th>
                  <th className="py-3 px-3 text-right">{t.colBalance}</th>
                  <th className="py-3 px-3 text-center">{t.colMethod}</th>
                  <th className="py-3 px-3 text-center">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRecords.map((r) => {
                  const isIncome = r.type === 'income';
                  const balanceDue = Math.max(0, Number(r.amount || 0) - Number(r.paid || 0));

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      {/* Date */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                        <span className="font-mono font-medium">{r.date}</span>
                        {r.time && (
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {r.time}
                          </span>
                        )}
                      </td>

                      {/* Receipt # */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {r.receiptNumber || `HAN-${r.id.slice(-4)}`}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isIncome ? t.typeIncome : t.typeExpense}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                        {getCategoryLabel(r.category, lang)}
                      </td>

                      {/* Item & Staff */}
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-bold text-slate-900 truncate" title={r.item}>
                          {r.item}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          {r.staffName && (
                            <span className="text-[10px] font-semibold text-sky-800 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                              {r.staffName}
                            </span>
                          )}
                          {r.notes && (
                            <span className="text-[11px] text-slate-400 italic truncate" title={r.notes}>
                              {r.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Person / Customer */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                        <div>{r.person || '—'}</div>
                        {r.phone && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {r.phone}
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatMoney(r.amount)}
                      </td>

                      {/* Paid */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {isIncome ? formatMoney(r.paid) : formatMoney(r.amount)}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        {isIncome && balanceDue > 0 ? (
                          <span className="text-red-600 font-extrabold bg-red-50 px-2 py-0.5 rounded-md">
                            {formatMoney(balanceDue)}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-light">—</span>
                        )}
                      </td>

                      {/* Method */}
                      <td className="py-3 px-3 text-center whitespace-nowrap text-[11px] text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded">
                          {r.method || 'Cash'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Receipt */}
                          <button
                            onClick={() => onOpenReceipt(r)}
                            title={t.btnReceipt}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Collect Debt Payment */}
                          {isIncome && balanceDue > 0 && (
                            <button
                              onClick={() => onOpenSettle(r)}
                              title={t.collectPaymentBtn}
                              className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition cursor-pointer"
                            >
                              {t.btnPay}
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => onOpenEdit(r)}
                            title={t.btnEdit}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(t.confirmDelete)) {
                                onDeleteRecord(r.id);
                              }
                            }}
                            title={t.btnDelete}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
