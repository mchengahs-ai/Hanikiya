export type Language = 'en' | 'ny';

export type RecordType = 'income' | 'expense';

export type IncomeCategory =
  | 'Stationery Sales'
  | 'Photoshoot'
  | 'Printing'
  | 'Photocopy'
  | 'Binding'
  | 'Laminating'
  | 'Designing / Graphic Design'
  | 'Video Shooting'
  | 'Audio Production'
  | 'Other';

export type ExpenseCategory =
  | 'Stock / Goods Purchase'
  | 'Stationery Supplies'
  | 'Printing Materials'
  | 'Transport'
  | 'Rent'
  | 'Electricity / Utilities'
  | 'Equipment'
  | 'Staff / Labour'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'Airtel Money'
  | 'TNM Mpamba'
  | 'Bank'
  | 'Other';

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod | string;
  notes?: string;
  created: number;
  staffName?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  pin: string;
  phone?: string;
  isActive?: boolean;
}

export interface ShopRecord {
  id: string;
  receiptNumber?: string;
  type: RecordType;
  date: string;
  time?: string;
  category: string;
  item: string;
  person?: string;
  phone?: string;
  amount: number;
  paid: number;
  method: PaymentMethod | string;
  notes?: string;
  created: number;
  staffName?: string;
  payments?: DebtPayment[];
}
