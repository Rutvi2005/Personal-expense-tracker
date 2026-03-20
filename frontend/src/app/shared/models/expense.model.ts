export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  userId?: number;
}

export interface ExpenseFilter {
  category?: string;
  startDate?: string;
  endDate?: string;
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Housing',
  'Education',
  'Travel',
  'Utilities',
  'Other'
];

export const CATEGORY_COLORS: { [key: string]: string } = {
  'Food & Dining':    '#FF6384',
  'Transportation':   '#36A2EB',
  'Shopping':         '#FFCE56',
  'Entertainment':    '#4BC0C0',
  'Healthcare':       '#9966FF',
  'Housing':          '#FF9F40',
  'Education':        '#59d899',
  'Travel':           '#FF6B6B',
  'Utilities':        '#C9CBCF',
  'Other':            '#7FB3F5',
};
