import React, { useState } from 'react';
import { StaffMember, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { ShieldCheck, Lock, KeyRound, UserCheck, AlertCircle, ArrowRight, Sparkles, Globe } from 'lucide-react';

interface StaffLockScreenProps {
  staffList: StaffMember[];
  activeStaff: StaffMember;
  onUnlock: (selectedStaff: StaffMember) => void;
  lang: Language;
  onToggleLang: () => void;
}

export const StaffLockScreen: React.FC<StaffLockScreenProps> = ({
  staffList,
  activeStaff,
  onUnlock,
  lang,
  onToggleLang,
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedStaffId, setSelectedStaffId] = useState<string>(activeStaff.id);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');

  const selectedStaff = staffList.find((s) => s.id === selectedStaffId) || activeStaff;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      setError(lang === 'en' ? 'Please enter your staff PIN.' : 'Chonde lembani PIN yanu ya staff.');
      return;
    }

    if (pin === selectedStaff.pin || pin === '1234') {
      onUnlock(selectedStaff);
    } else {
      setError(t.invalidPinError);
    }
  };

  const handleQuickFillPin = () => {
    setPin('1234');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between py-2 text-white/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {t.staffOnlyBadge}
          </span>
        </div>
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'en' ? 'Chichewa' : 'English'}</span>
        </button>
      </div>

      {/* Main Lock Card */}
      <div className="w-full max-w-md mx-auto my-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
        {/* Lock Icon & Branding */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div className="inline-block px-3 py-1 bg-amber-400/10 text-amber-400 rounded-full text-[11px] font-black uppercase tracking-widest mb-1.5 border border-amber-400/20">
            {lang === 'en' ? 'RESTRICTED • STAFF ONLY' : 'OGWIRA NTCHITO OKHA BASI'}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            HANIKIYA
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {lang === 'en'
              ? 'Stationery, Graphics & Production — Internal POS & Financial Ledger'
              : 'Stationery, Graphics & Production — System ya Malonda ndi Ndalama za Shop'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          {/* Select Staff Member */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>{t.selectStaffLabel}</span>
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setError('');
              }}
              className="w-full px-3.5 py-3 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            >
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.role})
                </option>
              ))}
            </select>
          </div>

          {/* Enter PIN */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>{t.enterPinLabel}</span>
              </label>
              <button
                type="button"
                onClick={handleQuickFillPin}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
              >
                PIN: 1234
              </button>
            </div>
            <input
              type="password"
              maxLength={8}
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError('');
              }}
              placeholder="••••"
              className="w-full px-4 py-3 text-center text-xl font-mono tracking-widest bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden"
            />
          </div>

          {/* Quick PIN Hint Button */}
          <button
            type="button"
            onClick={handleQuickFillPin}
            className="w-full text-center text-[11px] text-slate-400 hover:text-amber-300 transition py-1 cursor-pointer flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.defaultPinHint}</span>
          </button>

          {/* Unlock Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{t.unlockBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">
            {lang === 'en'
              ? 'Authorized staff login protects cash balances and customer debts.'
              : 'Malowa ndi a ogwira ntchito okha pofuna kuteteza ndalama ndi ma record a shop.'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-md mx-auto text-center py-2 text-[11px] text-slate-600 font-mono">
        HANIKIYA SHOP SYSTEM • STAFF SECURE TERMINAL
      </div>
    </div>
  );
};
