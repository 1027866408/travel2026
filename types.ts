export interface Traveler {
  id: string;
  name: string;
  level: string;
  isMain: boolean;
  passport: string;
  bankAccount: string;
  bankName: string;
}

export interface Trip {
  id: number;
  country: string;
  city: string;
  toCountry: string;
  toCity: string;
  startDate: string;
  endDate: string;
  days: number;
  areaTier: string;
  mealRate: number;
  miscRate: number;
  isChartered: boolean;
  travelerIds: string[];
  businessMeals: number;
}

export interface Expense {
  id: number;
  source: 'personal' | 'corp';
  category: string;
  type: string;
  date: string;
  currency: string;
  exchangeRate: number;
  originalAmount: number;
  cnyAmount: number;
  consumerId: string;
  payeeId: string;
  desc: string;
  policyStatus: string;
  receipt: boolean;
  expenseItem?: string;
  taxRate?: number;
  taxAmount?: number;
}

export interface BasicInfo {
  docNo: string;
  docDate: string;
  reimburser: string;
  costOrg: string;
  costDept: string;
  requestId: string;
  description: string;
  passportNo: string;
  isProject: boolean;
  projectType: string;
  projectCode: string;
  fundSource: string;
}

export interface IntlApplication {
  id: string;
  title: string;
  date: string;
  travelers: Traveler[];
  trips: Trip[];
  corpExpenses: Expense[];
}

export interface Project {
  code: string;
  name: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  defaultFor: string[];
}

export interface LocationInfo {
  country: string;
  city: string;
  tier: string;
  mealRate: number;
  miscRate: number;
}