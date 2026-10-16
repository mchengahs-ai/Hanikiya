import React from 'react';
import { ShopRecord, Language } from '../types';
import { TRANSLATIONS, getCategoryLabel } from '../translations';
import { 
  PlusCircle, 
  MinusCircle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard,
  DollarSign,
  ChevronRight,
  Clock,
  Printer
} from 'lucide-react';

interface DashboardViewProps {
  records: ShopRecord[];
  lang: Language;
  onNavigateTab: (tab: string) => void;
  onOpenReceipt: (record: ShopRecord) => void;
  onOpenSettle: (record: ShopRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  lang,
  onNavigateTab,
  onOpenReceipt,
  onOpenSettle,
}) => {
  const t = TRANSLATIONS[lang];
  const todayStr = new Date().toISOString().slice(0, 10);

  // Today's records
  const todayRecords = records.filter((r) => r.date === todayStr);
  const todayIncome = todayRecords
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + Number(r.paid || 0), 0);
  const todayExpense = todayRecords
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const todayNet = todayIncome - todayExpense;

  // Unpaid Debts
  const unpaidRecords = records.filter(
    (r) => r.type === 'income' && Number(r.amount || 0) > Number(r.paid || 0)
  );
  const totalUnpaid = unpaidRecords.reduce(
    (sum, r) => sum + Math.max(0, Number(r.amount || 0) - Number(r.paid || 0)),
    0
  );

  // Income by service category
  const incomeByCategory: Record<string, number> = {};
  records
    .filter((r) => r.type === 'income')
    .forEach((r) => {
      incomeByCategory[r.category] = (incomeByCategory[r.category] || 0) + Number(r.paid || 0);
    });

  const sortedIncomeCategories = Object.entries(incomeByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Expenses by category
  const expenseByCategory: Record<string, number> = {};
  records
    .filter((r) => r.type === 'expense')
    .forEach((r) => {
      expenseByCategory[r.category] = (expenseByCategory[r.category] || 0) + Number(r.amount || 0);
    });

  const sortedExpenseCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const formatMoney = (val: number) => {
    return `MK ${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const recentTransactions = records.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Pending Debts Alert Banner */}
      {unpaidRecords.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {t.debtsAlertTitle} — {formatMoney(totalUnpaid)}
              </h3>
              <p className="text-amber-100 text-xs sm:text-sm mt-0.5">
                {unpaidRecords.length} {t.debtsAlertDesc}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('debts')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>{t.viewDebtsBtn}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Today's Summary Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-50 text-sky-700 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg">{t.todaySummary}</h2>
              <p className="text-xs text-slate-500 font-mono">{todayStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('income')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {t.recordSaleBtn}
            </button>
            <button
              onClick={() => onNavigateTab('expense')}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <MinusCircle className="w-3.5 h-3.5" />
              {t.recordExpenseBtn}
            </button>
          </div>
        </div>

        {/* 4 Mini Cards for Today */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              {t.todayIncome}
            </span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-emerald-600">
              {formatMoney(todayIncome)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              {lang === 'en' ? 'Cash received today' : 'Zolandiridwa lero'}
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              {t.todayExpense}
            </span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-rose-600">
              {formatMoney(todayExpense)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              {lang === 'en' ? 'Spent today' : 'Zotuluka lero'}
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              {t.todayNet}
            </span>
            <span
              className={`text-lg sm:text-xl font-extrabold font-mono ${
                todayNet >= 0 ? 'text-sky-900' : 'text-rose-600'
              }`}
            >
              {formatMoney(todayNet)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              {todayNet >= 0 ? (lang === 'en' ? 'Net positive' : 'Phindu la lero') : (lang === 'en' ? 'Deficit' : 'Ndalama zachepa')}
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              {t.todayCount}
            </span>
            <span className="text-lg sm:text-xl font-extrabold font-mono text-slate-800">
              {todayRecords.length}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              {todayRecords.filter((r) => r.type === 'income').length} in / {todayRecords.filter((r) => r.type === 'expense').length} out
            </span>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-500 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100/60 leading-relaxed">
          💡 <span className="font-semibold text-sky-900">Note: </span>
          {t.tipCashBalance}
        </p>
      </div>

      {/* Breakdown Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Income Services */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              {t.incomeByService}
            </h3>
            <button
              onClick={() => onNavigateTab('services')}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
            >
              {t.tabServices} →
            </button>
          </div>

          {sortedIncomeCategories.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              {lang === 'en' ? 'No income recorded yet.' : 'Palibe ndalama zolowa zomwe zalembedwa.'}
            </p>
          ) : (
            <div className="space-y-3">
              {sortedIncomeCategories.map(([cat, amount]) => {
                const totalIncome = Object.values(incomeByCategory).reduce((a, b) => a + b, 0);
                const percent = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">{getCategoryLabel(cat, lang)}</span>
                      <span className="font-mono font-bold text-emerald-700">{formatMoney(amount)} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Expense Categories */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              {t.expenseByCategory}
            </h3>
            <button
              onClick={() => onNavigateTab('expense')}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 cursor-pointer"
            >
              {t.tabExpense} →
            </button>
          </div>

          {sortedExpenseCategories.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              {lang === 'en' ? 'No expenses recorded yet.' : 'Palibe ndalama zotuluka zomwe zalembedwa.'}
            </p>
          ) : (
            <div className="space-y-3">
              {sortedExpenseCategories.map(([cat, amount]) => {
                const totalExpense = Object.values(expenseByCategory).reduce((a, b) => a + b, 0);
                const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">{getCategoryLabel(cat, lang)}</span>
                      <span className="font-mono font-bold text-rose-700">{formatMoney(amount)} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">{t.recentTransactions}</h3>
            <p className="text-xs text-slate-500">
              {lang === 'en' ? 'Latest entries in the cash book' : 'Zochitika zaposachedwa kwambiri'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('records')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
          >
            <span>{t.viewAllRecords}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            {lang === 'en'
              ? 'No records yet. Click "+ Record Sale" or "+ Record Expense" to get started.'
              : 'Palibe ma record pano. Dinani "+ Lembani Malonda" kapena "+ Lembani Zotuluka".'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">{t.colDate}</th>
                  <th className="py-2.5 px-3">{t.colType}</th>
                  <th className="py-2.5 px-3">{t.colItem}</th>
                  <th className="py-2.5 px-3">{t.colPerson}</th>
                  <th className="py-2.5 px-3 text-right">{t.colTotal}</th>
                  <th className="py-2.5 px-3 text-right">{t.colPaid}</th>
                  <th className="py-2.5 px-3 text-right">{t.colBalance}</th>
                  <th className="py-2.5 px-3 text-center">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentTransactions.map((r) => {
                  const isIncome = r.type === 'income';
                  const balanceDue = Math.max(0, Number(r.amount || 0) - Number(r.paid || 0));

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        <span className="font-mono">{r.date}</span>
                        {r.time && <span className="text-[10px] text-slate-400 block font-mono">{r.time}</span>}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isIncome ? t.typeIncome : t.typeExpense}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{r.item}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {getCategoryLabel(r.category, lang)}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {r.person || '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                        {formatMoney(r.amount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                        {isIncome ? formatMoney(r.paid) : formatMoney(r.amount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">
                        {isIncome && balanceDue > 0 ? (
                          <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                            {formatMoney(balanceDue)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenReceipt(r)}
                            title={t.btnReceipt}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {isIncome && balanceDue > 0 && (
                            <button
                              onClick={() => onOpenSettle(r)}
                              title={t.collectPaymentBtn}
                              className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] transition cursor-pointer"
                            >
                              {t.btnPay}
                            </button>
                          )}
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
