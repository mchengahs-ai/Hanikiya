import React, { useState, useEffect, useRef } from 'react';
import { ShopRecord, Language, PaymentMethod, IncomeCategory, StaffMember } from './types';
import { TRANSLATIONS } from './translations';
import { getSampleRecords } from './sampleData';
import { StatsOverview } from './components/StatsOverview';
import { DashboardView } from './components/DashboardView';
import { IncomeForm } from './components/IncomeForm';
import { ExpenseForm } from './components/ExpenseForm';
import { DebtsView } from './components/DebtsView';
import { AllRecordsView } from './components/AllRecordsView';
import { ServicesView } from './components/ServicesView';
import { ReceiptModal } from './components/ReceiptModal';
import { SettleDebtModal } from './components/SettleDebtModal';
import { EditRecordModal } from './components/EditRecordModal';
import { StaffLockScreen } from './components/StaffLockScreen';
import { StaffShiftModal } from './components/StaffShiftModal';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Globe, 
  Trash2, 
  RotateCcw, 
  LayoutDashboard, 
  PlusCircle, 
  MinusCircle, 
  Users, 
  Table, 
  Briefcase, 
  CheckCircle,
  AlertCircle,
  Lock,
  UserCheck,
  ShieldCheck,
  ArrowRightLeft
} from 'lucide-react';

const STORAGE_KEY = 'hanikiya_shop_records_v1';
const LANG_STORAGE_KEY = 'hanikiya_shop_lang_v1';
const STAFF_STORAGE_KEY = 'hanikiya_staff_list_v1';
const ACTIVE_STAFF_KEY = 'hanikiya_active_staff_id_v1';
const LOCK_STATE_KEY = 'hanikiya_lock_state_v1';

const DEFAULT_STAFF: StaffMember[] = [
  { id: 'staff-1', name: 'Kondwani Banda', role: 'Cashier & Counter Attendant', pin: '1234' },
  { id: 'staff-2', name: 'Chisomo Phiri', role: 'Graphic Designer & Typesetter', pin: '1234' },
  { id: 'staff-3', name: 'Mary Mwale', role: 'Printing & Photocopy Operator', pin: '1234' },
  { id: 'staff-4', name: 'Shop Manager', role: 'Manager / Owner', pin: '1234' },
];

export default function App() {
  // Language State - defaults to Chichewa since user requested in Chichewa "Ikhale ya staff yokha basi"
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'ny';
  });

  // Staff List State
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      const stored = localStorage.getItem(STAFF_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load staff list', e);
    }
    return DEFAULT_STAFF;
  });

  // Active Staff
  const [activeStaff, setActiveStaff] = useState<StaffMember>(() => {
    const storedId = localStorage.getItem(ACTIVE_STAFF_KEY);
    const found = DEFAULT_STAFF.find((s) => s.id === storedId);
    return found || DEFAULT_STAFF[0];
  });

  // Staff Only Lock State (defaults to false on fresh load so user can explore immediately, with quick 1-click lock)
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem(LOCK_STATE_KEY) === 'true';
  });

  // Records State
  const [records, setRecords] = useState<ShopRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse records from localStorage', e);
    }
    return getSampleRecords();
  });

  // Tab State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modals State
  const [receiptRecord, setReceiptRecord] = useState<ShopRecord | null>(null);
  const [settleRecord, setSettleRecord] = useState<ShopRecord | null>(null);
  const [editRecord, setEditRecord] = useState<ShopRecord | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);

  // Income Form Prefill
  const [incomePrefill, setIncomePrefill] = useState<{
    service?: IncomeCategory;
    item?: string;
    price?: number;
  } | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const t = TRANSLATIONS[lang];

  // Save records to localStorage
  const saveRecords = (newRecords: ShopRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
  };

  // Lock / Unlock handlers
  const handleLockScreen = () => {
    setIsLocked(true);
    localStorage.setItem(LOCK_STATE_KEY, 'true');
    showToast(lang === 'en' ? 'Screen locked. Staff PIN required.' : 'Screen yatsekedwa. PIN ya staff ikufunika.', 'info');
  };

  const handleUnlockScreen = (staff: StaffMember) => {
    setActiveStaff(staff);
    localStorage.setItem(ACTIVE_STAFF_KEY, staff.id);
    setIsLocked(false);
    localStorage.setItem(LOCK_STATE_KEY, 'false');
    showToast(lang === 'en' ? `Welcome, ${staff.name}!` : `Mwatsegula bwinobwino, ${staff.name}!`, 'success');
  };

  const handleSwitchStaff = (staff: StaffMember) => {
    setActiveStaff(staff);
    localStorage.setItem(ACTIVE_STAFF_KEY, staff.id);
    showToast(lang === 'en' ? `Active staff switched to ${staff.name}` : `Staff wosankhidwa ndi ${staff.name}`, 'info');
  };

  const handleAddStaffMember = (newStaff: StaffMember) => {
    const updated = [...staffList, newStaff];
    setStaffList(updated);
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
    showToast(lang === 'en' ? `Staff member ${newStaff.name} added!` : `Wogwira ntchito ${newStaff.name} wawonjezedwa!`, 'success');
  };

  // Toggle Language
  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ny' : 'en';
    setLang(nextLang);
    localStorage.setItem(LANG_STORAGE_KEY, nextLang);
  };

  // Toast trigger
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Save new Income
  const handleSaveIncome = (
    data: Omit<ShopRecord, 'id' | 'created'>,
    printAfter: boolean
  ) => {
    const newId = `han-rec-${Date.now()}`;
    const year = new Date().getFullYear().toString().slice(-2);
    const receiptNumber = `HAN-${year}-${String(records.length + 1).padStart(3, '0')}`;

    const newRecord: ShopRecord = {
      ...data,
      id: newId,
      receiptNumber,
      created: Date.now(),
      staffName: data.staffName || activeStaff.name,
    };

    const updated = [newRecord, ...records];
    saveRecords(updated);
    showToast(t.toastIncomeSaved, 'success');

    if (printAfter) {
      setReceiptRecord(newRecord);
    }
  };

  // Save new Expense
  const handleSaveExpense = (data: Omit<ShopRecord, 'id' | 'created'>) => {
    const newId = `han-rec-${Date.now()}`;
    const year = new Date().getFullYear().toString().slice(-2);
    const receiptNumber = `HAN-EXP-${year}-${String(records.length + 1).padStart(3, '0')}`;

    const newRecord: ShopRecord = {
      ...data,
      id: newId,
      receiptNumber,
      created: Date.now(),
      staffName: data.staffName || activeStaff.name,
    };

    const updated = [newRecord, ...records];
    saveRecords(updated);
    showToast(t.toastExpenseSaved, 'success');
  };

  // Delete record
  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    saveRecords(updated);
    showToast(t.toastDeleted, 'info');
  };

  // Edit record
  const handleSaveEdit = (updatedRecord: ShopRecord) => {
    const updated = records.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
    saveRecords(updated);
    showToast(lang === 'en' ? 'Record updated successfully!' : 'Record yasinthidwa bwino!', 'success');
  };

  // Settle Customer Debt payment
  const handleSaveDebtPayment = (
    recordId: string,
    amountPaidNow: number,
    paymentMethod: PaymentMethod,
    paymentNotes: string
  ) => {
    const updated = records.map((r) => {
      if (r.id !== recordId) return r;

      const newPaid = Number(r.paid || 0) + amountPaidNow;
      const paymentDate = new Date().toISOString().slice(0, 10);
      const staffStamp = ` (Collected by: ${activeStaff.name})`;
      const noteAppend = paymentNotes 
        ? ` [Debt Payment: MK ${amountPaidNow.toLocaleString()} via ${paymentMethod} on ${paymentDate} - ${paymentNotes}${staffStamp}]` 
        : ` [Debt Payment: MK ${amountPaidNow.toLocaleString()} via ${paymentMethod} on ${paymentDate}${staffStamp}]`;

      const existingPayments = r.payments || [];
      const newPaymentLog = {
        id: `pay-${Date.now()}`,
        date: paymentDate,
        amount: amountPaidNow,
        method: paymentMethod,
        notes: paymentNotes,
        created: Date.now(),
        staffName: activeStaff.name,
      };

      return {
        ...r,
        paid: newPaid,
        notes: (r.notes || '') + noteAppend,
        payments: [...existingPayments, newPaymentLog],
      };
    });

    saveRecords(updated);
    showToast(t.toastPaymentRecorded, 'success');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Receipt #',
      'Date',
      'Time',
      'Type',
      'Category',
      'Item Description',
      'Staff Member',
      'Customer / Recipient',
      'Phone',
      'Total Amount (MK)',
      'Amount Received (MK)',
      'Balance Due (MK)',
      'Payment Method',
      'Notes',
    ];

    const rows = records.map((r) => {
      const isIncome = r.type === 'income';
      const balanceDue = isIncome ? Math.max(0, Number(r.amount || 0) - Number(r.paid || 0)) : 0;

      return [
        r.receiptNumber || r.id,
        r.date,
        r.time || '',
        r.type.toUpperCase(),
        r.category,
        r.item,
        r.staffName || '',
        r.person || '',
        r.phone || '',
        r.amount,
        isIncome ? r.paid : r.amount,
        balanceDue,
        r.method || '',
        r.notes || '',
      ];
    });

    const csvContent =
      '\ufeff' +
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
            .join(',')
        )
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hanikiya-staff-records-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(lang === 'en' ? 'CSV export downloaded.' : 'Fayilo ya CSV yatsitsidwa.', 'success');
  };

  // Backup JSON
  const handleBackupJson = () => {
    const backupData = {
      app: 'HANIKIYA STATIONERY, GRAPHICS & PRODUCTION',
      version: 1,
      backupDate: new Date().toISOString(),
      staffActive: activeStaff.name,
      recordsCount: records.length,
      records,
      staffList,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hanikiya-staff-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t.toastBackupCreated, 'success');
  };

  // Restore JSON
  const handleRestoreJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const incoming = Array.isArray(data) ? data : data.records;

      if (!Array.isArray(incoming)) {
        throw new Error('Invalid structure');
      }

      if (window.confirm(t.confirmRestore)) {
        saveRecords(incoming);
        if (data.staffList && Array.isArray(data.staffList)) {
          setStaffList(data.staffList);
          localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(data.staffList));
        }
        showToast(t.toastRestoreSuccess, 'success');
      }
    } catch (err) {
      showToast(t.toastRestoreError, 'error');
    }

    if (e.target) e.target.value = '';
  };

  // Load sample records
  const handleLoadSample = () => {
    saveRecords(getSampleRecords());
    showToast(t.toastSampleLoaded, 'info');
  };

  // Clear all records
  const handleClearAll = () => {
    if (window.confirm(t.confirmClearAll)) {
      saveRecords([]);
      showToast(t.toastClearSuccess, 'info');
    }
  };

  // Navigate to services selection
  const handleSelectServiceFromCatalog = (
    category: IncomeCategory,
    item?: string,
    price?: number
  ) => {
    setIncomePrefill({ service: category, item, price });
    setActiveTab('income');
  };

  // Count pending debts
  const unpaidDebtsCount = records.filter(
    (r) => r.type === 'income' && Number(r.amount || 0) > Number(r.paid || 0)
  ).length;

  // IF LOCKED, RENDER STAFF PIN LOCK SCREEN
  if (isLocked) {
    return (
      <StaffLockScreen
        staffList={staffList}
        activeStaff={activeStaff}
        onUnlock={handleUnlockScreen}
        lang={lang}
        onToggleLang={toggleLanguage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white border ${
              toast.type === 'error'
                ? 'bg-rose-700 border-rose-600'
                : toast.type === 'info'
                ? 'bg-sky-800 border-sky-700'
                : 'bg-emerald-700 border-emerald-600'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Staff Security Banner */}
      <div className="no-print bg-amber-500 text-slate-950 px-4 py-1.5 text-[11px] font-black tracking-wider flex items-center justify-between border-b border-amber-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{lang === 'en' ? 'RESTRICTED PORTAL • STAFF ONLY' : 'MALO A OGWIRA NTCHITO OKHA BASI (STAFF ONLY)'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-semibold hidden sm:inline">
            {lang === 'en' ? 'Unauthorized customers are not permitted.' : 'Makasitomala saloledwa kuona ma record.'}
          </span>
          <button
            onClick={handleLockScreen}
            className="flex items-center gap-1 bg-slate-950 hover:bg-slate-900 text-amber-400 px-2 py-0.5 rounded font-bold cursor-pointer transition text-[10px]"
            title="Lock POS Screen immediately"
          >
            <Lock className="w-3 h-3" />
            <span>{t.lockScreenBtn}</span>
          </button>
        </div>
      </div>

      {/* Primary Header */}
      <header className="no-print bg-gradient-to-r from-slate-950 via-sky-950 to-blue-950 text-white border-b border-sky-900/60 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Brand Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-xl shadow-md shrink-0">
                H
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
                    {t.shopName}
                  </h1>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono">
                    MK
                  </span>
                </div>
                <p className="text-xs text-sky-200 font-medium">
                  {t.subtitle}
                </p>
              </div>
            </div>

            {/* Active Staff Bar & Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
              {/* Active Staff Selector Badge */}
              <button
                onClick={() => setIsShiftModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-sky-900/90 hover:bg-sky-800 text-white border border-sky-700/60 font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
                title="View shift collections & cash handover"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="text-left">
                  <span className="text-[9px] text-sky-300 uppercase block font-mono font-bold leading-none">
                    {lang === 'en' ? 'Staff on Duty' : 'Staff pa Shift'}
                  </span>
                  <span className="font-extrabold text-amber-300 text-xs leading-tight">
                    {activeStaff.name}
                  </span>
                </div>
                <ArrowRightLeft className="w-3.5 h-3.5 text-sky-300 ml-1" />
              </button>

              {/* Lock Screen Button */}
              <button
                onClick={handleLockScreen}
                className="p-2 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/60 transition cursor-pointer"
                title={t.lockScreenBtn}
              >
                <Lock className="w-4 h-4 text-amber-400" />
              </button>

              {/* Language Switch */}
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/10 cursor-pointer"
                title="Switch Language (English / Chichewa)"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.langButton}</span>
              </button>

              {/* Export CSV */}
              <button
                onClick={handleExportCsv}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.exportCsv}</span>
                <span className="sm:hidden">CSV</span>
              </button>

              {/* Backup */}
              <button
                onClick={handleBackupJson}
                className="px-2.5 py-1.5 rounded-xl bg-sky-900/80 hover:bg-sky-800 text-sky-100 font-bold text-xs flex items-center gap-1 transition border border-sky-700/60 cursor-pointer"
                title="Save backup file to computer"
              >
                <Download className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden md:inline">{t.backupData}</span>
              </button>

              {/* Restore */}
              <label className="px-2.5 py-1.5 rounded-xl bg-sky-900/80 hover:bg-sky-800 text-sky-100 font-bold text-xs flex items-center gap-1 transition border border-sky-700/60 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden md:inline">{t.restoreData}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleRestoreJson}
                  className="hidden"
                />
              </label>

              {/* Sample Data */}
              <button
                onClick={handleLoadSample}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition border border-white/10 cursor-pointer"
                title="Load sample data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Clear */}
              <button
                onClick={handleClearAll}
                className="p-1.5 rounded-xl bg-red-900/30 hover:bg-red-900/60 text-red-300 transition border border-red-800/40 cursor-pointer"
                title="Clear all records"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {/* Stats Overview Bar */}
        <StatsOverview
          records={records}
          lang={lang}
          onOpenDebtsTab={() => setActiveTab('debts')}
        />

        {/* Tab Navigation */}
        <div className="no-print flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-sky-950 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-400" />
            <span>{t.tabDashboard}</span>
          </button>

          <button
            onClick={() => {
              setIncomePrefill(null);
              setActiveTab('income');
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'income'
                ? 'bg-sky-950 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-500" />
            <span>{t.tabIncome}</span>
          </button>

          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'expense'
                ? 'bg-sky-950 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'
            }`}
          >
            <MinusCircle className="w-4 h-4 text-rose-500" />
            <span>{t.tabExpense}</span>
          </button>

          <button
            onClick={() => setActiveTab('debts')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'debts'
                ? 'bg-sky-950 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Users className="w-4 h-4 text-amber-500" />
            <span>{t.tabDebts}</span>
            {unpaidDebtsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-extrabold font-mono">
                {unpaidDebtsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'records'
                ? 'bg-sky-950 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Table className="w-4 h-4 text-sky-400" />
            <span>{t.tabRecords}</span>
            <span className="text-[10px] font-mono opacity-70">
              ({records.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'services'
                ? 'bg-sky-950 text-white shadow-sm'
                : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/80'
            }`}
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>{t.tabServices}</span>
          </button>

          {/* Staff Shift Tab Trigger */}
          <button
            onClick={() => setIsShiftModalOpen(true)}
            className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition cursor-pointer bg-amber-400 hover:bg-amber-300 text-slate-950 ml-auto shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t.shiftReportBtn}</span>
          </button>
        </div>

        {/* Tab Views */}
        <div>
          {activeTab === 'dashboard' && (
            <DashboardView
              records={records}
              lang={lang}
              onNavigateTab={(tab) => {
                if (tab === 'income') setIncomePrefill(null);
                setActiveTab(tab);
              }}
              onOpenReceipt={(r) => setReceiptRecord(r)}
              onOpenSettle={(r) => setSettleRecord(r)}
            />
          )}

          {activeTab === 'income' && (
            <IncomeForm
              onSave={handleSaveIncome}
              lang={lang}
              prefillService={incomePrefill?.service}
              prefillItem={incomePrefill?.item}
              prefillPrice={incomePrefill?.price}
              activeStaffName={activeStaff.name}
            />
          )}

          {activeTab === 'expense' && (
            <ExpenseForm 
              onSave={handleSaveExpense} 
              lang={lang} 
              activeStaffName={activeStaff.name}
            />
          )}

          {activeTab === 'debts' && (
            <DebtsView
              records={records}
              lang={lang}
              onOpenSettle={(r) => setSettleRecord(r)}
              onOpenReceipt={(r) => setReceiptRecord(r)}
            />
          )}

          {activeTab === 'records' && (
            <AllRecordsView
              records={records}
              lang={lang}
              onOpenReceipt={(r) => setReceiptRecord(r)}
              onOpenEdit={(r) => setEditRecord(r)}
              onOpenSettle={(r) => setSettleRecord(r)}
              onDeleteRecord={handleDeleteRecord}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView
              lang={lang}
              onSelectService={handleSelectServiceFromCatalog}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <div className="flex items-center justify-center gap-2 font-bold text-amber-700 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'RESTRICTED SHOP PERSONNEL SYSTEM' : 'SYSTEM YA OGWIRA NTCHITO OKHA BASI'}</span>
          </div>
          <p className="font-semibold text-slate-700">
            {t.footerCopy}
          </p>
          <p className="text-[11px] text-slate-400">
            {lang === 'en'
              ? 'Stationery Sales • Studio Photoshoot • Printing • Photocopy • Spiral & Hardcover Binding • Laminating • Graphic Design • Video Coverage • Audio Production'
              : 'Malonda a Zolembera • Kujambula Zithunzi • Kusindikiza • Fotokope • Kumanga Mabuku • Kulaminiti • Ma Design • Kujambula Mavidiyo • Nyimbo mu Studio'}
          </p>
        </div>
      </footer>

      {/* Modals */}
      {receiptRecord && (
        <ReceiptModal
          record={receiptRecord}
          onClose={() => setReceiptRecord(null)}
          lang={lang}
        />
      )}

      {settleRecord && (
        <SettleDebtModal
          record={settleRecord}
          onClose={() => setSettleRecord(null)}
          onSavePayment={handleSaveDebtPayment}
          lang={lang}
        />
      )}

      {editRecord && (
        <EditRecordModal
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSave={handleSaveEdit}
          lang={lang}
        />
      )}

      {/* Staff Shift Handover Modal */}
      <StaffShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        staffList={staffList}
        activeStaff={activeStaff}
        onSwitchStaff={handleSwitchStaff}
        onLockScreen={handleLockScreen}
        onAddStaff={handleAddStaffMember}
        records={records}
        lang={lang}
      />
    </div>
  );
}
