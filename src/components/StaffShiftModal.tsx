import React, { useState } from 'react';
import { StaffMember, ShopRecord, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { X, UserCheck, DollarSign, Wallet, ArrowRightLeft, Shield, CheckCircle2, Lock, Plus } from 'lucide-react';

interface StaffShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: StaffMember[];
  activeStaff: StaffMember;
  onSwitchStaff: (staff: StaffMember) => void;
  onLockScreen: () => void;
  onAddStaff: (newStaff: StaffMember) => void;
  records: ShopRecord[];
  lang: Language;
}

export const StaffShiftModal: React.FC<StaffShiftModalProps> = ({
  isOpen,
  onClose,
  staffList,
  activeStaff,
  onSwitchStaff,
  onLockScreen,
  onAddStaff,
  records,
  lang,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang];
  const todayStr = new Date().toISOString().slice(0, 10);

  // New staff form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Cashier');
  const [newPin, setNewPin] = useState('1234');

  // Filter records for today
  const todayRecords = records.filter((r) => r.date === todayStr);

  // Active staff records today (if record has staffName, match; if none recorded, match activeStaff)
  const activeStaffIncome = todayRecords
    .filter((r) => r.type === 'income' && (!r.staffName || r.staffName === activeStaff.name))
    .reduce((sum, r) => sum + Number(r.paid || 0), 0);

  const activeStaffExpenses = todayRecords
    .filter((r) => r.type === 'expense' && (!r.staffName || r.staffName === activeStaff.name))
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const activeStaffNetHandover = activeStaffIncome - activeStaffExpenses;

  const activeStaffCount = todayRecords.filter(
    (r) => !r.staffName || r.staffName === activeStaff.name
  ).length;

  const formatMoney = (val: number) => {
    return `MK ${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newStaffMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newName.trim(),
      role: newRole,
      pin: newPin || '1234',
    };

    onAddStaff(newStaffMember);
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-sky-950 to-blue-950 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-block px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase rounded mb-0.5">
                {t.staffOnlyBadge}
              </div>
              <h2 className="font-extrabold text-base">{t.shiftTitle}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Staff Shift Card */}
          <div className="bg-gradient-to-br from-sky-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-sky-800/60 pb-3">
              <div>
                <span className="text-[10px] text-sky-300 uppercase tracking-wider font-bold block">
                  {t.activeCashier}
                </span>
                <h3 className="text-lg font-black text-white">{activeStaff.name}</h3>
                <span className="text-xs text-amber-400 font-semibold">{activeStaff.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onLockScreen();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{t.lockScreenBtn}</span>
                </button>
              </div>
            </div>

            {/* Shift Calculations */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <span className="text-[10px] text-sky-200 block">{t.staffCollectedToday}</span>
                <span className="font-mono font-extrabold text-base text-emerald-400 block mt-1">
                  {formatMoney(activeStaffIncome)}
                </span>
              </div>

              <div className="bg-white/10 rounded-xl p-3">
                <span className="text-[10px] text-sky-200 block">{t.staffSpentToday}</span>
                <span className="font-mono font-extrabold text-base text-rose-400 block mt-1">
                  {formatMoney(activeStaffExpenses)}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-amber-400/20 border border-amber-400/40 rounded-xl p-3">
                <span className="text-[10px] text-amber-200 font-bold block">{t.staffNetHandover}</span>
                <span className="font-mono font-black text-lg text-amber-300 block mt-1">
                  {formatMoney(activeStaffNetHandover)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-sky-200 mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                {lang === 'en'
                  ? `Shift verification: Count physical cash in counter drawer to match ${formatMoney(activeStaffNetHandover)}.`
                  : `Chitsimikizo cha shift: Werengani ndalama zenizeni za m'manja kuti zikwane ${formatMoney(activeStaffNetHandover)}.`}
              </span>
            </p>
          </div>

          {/* Switch Staff Profile */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-sky-700" />
                <span>{t.allStaffMembers}</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addNewStaff}</span>
              </button>
            </div>

            {/* Add Staff inline form */}
            {showAddForm && (
              <form onSubmit={handleCreateStaff} className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Staff Full Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg"
                  />
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Cashier">Cashier</option>
                    <option value="Graphic Designer">Graphic Designer</option>
                    <option value="Photographer & Video">Photographer &amp; Video</option>
                    <option value="Printer Operator">Printer Operator</option>
                    <option value="Shop Manager">Shop Manager</option>
                  </select>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="PIN (e.g. 1234)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-center"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1 bg-slate-200 rounded-lg text-slate-700 font-semibold"
                  >
                    {t.closeBtn}
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-sky-900 text-white rounded-lg font-bold"
                  >
                    Save Staff
                  </button>
                </div>
              </form>
            )}

            {/* Staff list cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {staffList.map((staff) => {
                const isCurrent = staff.id === activeStaff.id;
                return (
                  <div
                    key={staff.id}
                    className={`p-3 rounded-xl border transition flex items-center justify-between ${
                      isCurrent
                        ? 'border-sky-600 bg-sky-50/80 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{staff.name}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded bg-sky-900 text-white text-[9px] font-black uppercase">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{staff.role}</div>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={() => {
                          onSwitchStaff(staff);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sky-900 hover:bg-sky-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>{lang === 'en' ? 'Select' : 'Sankhani'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
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
