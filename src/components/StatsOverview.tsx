import React from 'react';
import { ShopRecord, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { TrendingUp, TrendingDown, Wallet, Users, AlertCircle } from 'lucide-react';

interface StatsOverviewProps {
  records: ShopRecord[];
  lang: Language;
  onOpenDebtsTab: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ records, lang, onOpenDebtsTab }) => {
  const t = TRANSLATIONS[lang];

  // Total income received in hand
  const totalIncomeReceived = records
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + Number(r.paid || 0), 0);

  // Total invoiced income
  const totalIncomeInvoiced = records
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  // Total expenses
  const totalExpense = records
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  // Net Cash Balance = money actually received minus expenses paid
  const cashBalance = totalIncomeReceived - totalExpense;

  // Unpaid Customer Balances (total invoiced minus paid)
  const unpaidRecords = records.filter(
    (r) => r.type === 'income' && Number(r.amount || 0) > Number(r.paid || 0)
  );

  const totalUnpaid = unpaidRecords.reduce(
    (sum, r) => sum + Math.max(0, Number(r.amount || 0) - Number(r.paid || 0)),
    0
  );

  const formatMoney = (val: number) => {
    return `MK ${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Sales / Income */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.totalSalesIncome}
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">
          {formatMoney(totalIncomeReceived)}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{t.inCashRegister}</span>
          {totalIncomeInvoiced > totalIncomeReceived && (
            <span className="font-mono text-slate-400">
              Inv: {formatMoney(totalIncomeInvoiced)}
            </span>
          )}
        </div>
      </div>

      {/* 2. Total Expenses */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.totalExpenses}
          </span>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl lg:text-3xl font-extrabold text-rose-600 font-mono tracking-tight">
          {formatMoney(totalExpense)}
        </div>
        <div className="mt-2 text-[11px] text-slate-500">
          {lang === 'en' ? 'Paper, ink, utilities & shop expenses' : 'Mapepala, inki, magetsi ndi zogula zina'}
        </div>
      </div>

      {/* 3. Cash Balance */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.cashBalance}
          </span>
          <div className={`p-2 rounded-xl ${cashBalance >= 0 ? 'bg-sky-50 text-sky-600' : 'bg-red-50 text-red-600'}`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div
          className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${
            cashBalance >= 0 ? 'text-sky-900' : 'text-rose-600'
          }`}
        >
          {formatMoney(cashBalance)}
        </div>
        <div className="mt-2 text-[11px] flex items-center gap-1">
          <span
            className={`font-semibold ${
              cashBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {cashBalance >= 0 ? t.netPositive : t.netNegative}
          </span>
        </div>
      </div>

      {/* 4. Unpaid Customer Balances */}
      <div
        onClick={totalUnpaid > 0 ? onOpenDebtsTab : undefined}
        className={`bg-white rounded-2xl p-5 shadow-xs border transition ${
          totalUnpaid > 0
            ? 'border-amber-300 hover:border-amber-400 hover:shadow-md cursor-pointer bg-gradient-to-br from-white to-amber-50/40'
            : 'border-slate-200/80'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.unpaidDebts}
          </span>
          <div className={`p-2 rounded-xl ${totalUnpaid > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${totalUnpaid > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
          {formatMoney(totalUnpaid)}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          {totalUnpaid > 0 ? (
            <span className="text-amber-800 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              {unpaidRecords.length} {t.debtsCount}
            </span>
          ) : (
            <span className="text-emerald-600 font-medium">{t.noDebts}</span>
          )}
          {totalUnpaid > 0 && (
            <span className="text-[10px] uppercase font-bold text-sky-700 underline">
              {lang === 'en' ? 'Open' : 'Onani'}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
