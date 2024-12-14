import { Transaction, HeldTransaction } from '../modules/pos/types/transaction';

// Storage keys for devtools
const STORAGE_KEYS = {
  COMPLETED_TRANSACTIONS: 'devtools_completed_transactions',
  HELD_TRANSACTIONS: 'devtools_held_transactions',
  SEQUENCE: 'devtools_sequence_number',
  DATE: 'devtools_current_date',
  DAILY_SUMMARY: 'devtools_daily_summary'
} as const;

interface DailySummary {
  date: string;
  totalTransactions: number;
  totalAmount: number;
  prescriptionCount: number;
  discountedTransactions: number;
}

export const devStorage = {
  // Transaction Management
  saveTransaction: (transaction: Transaction) => {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPLETED_TRANSACTIONS);
    const transactions = stored ? JSON.parse(stored) : [];
    transactions.push({
      ...transaction,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TRANSACTIONS, JSON.stringify(transactions));

    // Update daily summary
    const date = new Date().toISOString().split('T')[0];
    const storedSummary = localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARY);
    const summaries = storedSummary ? JSON.parse(storedSummary) : {};
    
    if (!summaries[date]) {
      summaries[date] = {
        date,
        totalTransactions: 0,
        totalAmount: 0,
        prescriptionCount: 0,
        discountedTransactions: 0
      };
    }

    summaries[date].totalTransactions++;
    summaries[date].totalAmount += transaction.total;
    if (transaction.prescriptionRequired) {
      summaries[date].prescriptionCount++;
    }
    if (transaction.discountType !== 'None') {
      summaries[date].discountedTransactions++;
    }

    localStorage.setItem(STORAGE_KEYS.DAILY_SUMMARY, JSON.stringify(summaries));
  },

  getTransactions: (): Transaction[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPLETED_TRANSACTIONS);
    return stored ? JSON.parse(stored) : [];
  },

  getDailySummary: (date: string): DailySummary | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARY);
    if (!stored) return null;
    const summaries = JSON.parse(stored);
    return summaries[date] || null;
  },

  // Clear all devtools data
  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Export data for debugging/testing
  exportData: () => {
    const data: Record<string, any> = {};
    Object.entries(STORAGE_KEYS).forEach(([key, value]) => {
      const stored = localStorage.getItem(value);
      data[key] = stored ? JSON.parse(stored) : null;
    });
    return data;
  },

  // Import data (useful for testing scenarios)
  importData: (data: Record<string, any>) => {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null) {
        localStorage.setItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS], JSON.stringify(value));
      }
    });
  }
};

// Initialize storage if needed
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.COMPLETED_TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TRANSACTIONS, '[]');
  }
  if (!localStorage.getItem(STORAGE_KEYS.DAILY_SUMMARY)) {
    localStorage.setItem(STORAGE_KEYS.DAILY_SUMMARY, '{}');
  }
};

initializeStorage(); 