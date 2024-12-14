import { CartState } from '../types/cart';
import { HeldTransaction, Transaction } from '../types/transaction';

// Helper function for date string
const getCurrentDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

// Storage keys and initialization
const STORAGE_KEYS = {
  HELD_TRANSACTIONS: 'devtools_held_transactions',
  SEQUENCE: 'devtools_sequence_number',
  DATE: 'devtools_current_date',
  COMPLETED_TRANSACTIONS: 'devtools_completed_transactions'
} as const;

// Reset the sequential number at the start of each day
export const resetDailySequence = () => {
  const dateString = getCurrentDateString();
  localStorage.setItem(STORAGE_KEYS.DATE, dateString);
  localStorage.setItem(STORAGE_KEYS.SEQUENCE, '0');
};

// Initialize sequence number from storage or reset if it's a new day
const initializeSequence = () => {
  const storedDate = localStorage.getItem(STORAGE_KEYS.DATE);
  const currentDate = getCurrentDateString();
  
  if (storedDate !== currentDate) {
    resetDailySequence();
  }
};

const getHeldTransactions = (): HeldTransaction[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.HELD_TRANSACTIONS);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const getNextSequenceNumber = (): number => {
  const storedNumber = localStorage.getItem(STORAGE_KEYS.SEQUENCE);
  const currentNumber = storedNumber ? parseInt(storedNumber, 10) : 0;
  const nextNumber = (currentNumber >= 9999) ? 1 : currentNumber + 1;
  localStorage.setItem(STORAGE_KEYS.SEQUENCE, nextNumber.toString());
  return nextNumber;
};

export const generateTransactionId = (): string => {
  const dateString = getCurrentDateString();
  const storedDate = localStorage.getItem(STORAGE_KEYS.DATE);
  
  if (storedDate !== dateString) {
    localStorage.setItem(STORAGE_KEYS.SEQUENCE, '0');
    localStorage.setItem(STORAGE_KEYS.DATE, dateString);
  }
  
  const sequentialNumber = getNextSequenceNumber();
  return `${dateString}-${String(sequentialNumber).padStart(4, '0')}`;
};

export const resetInvoiceNumber = () => {
  localStorage.setItem(STORAGE_KEYS.SEQUENCE, '0');
  localStorage.setItem(STORAGE_KEYS.DATE, getCurrentDateString());
};

// Initialize on module load
initializeSequence();

export const transactionManager = {
  holdTransaction: (cartState: CartState, note?: string): HeldTransaction => {
    const timestamp = new Date().toISOString();
    const transaction: HeldTransaction = {
      id: `HOLD-${Date.now()}`,
      items: cartState.items,
      timestamp: timestamp,
      holdTimestamp: timestamp,
      total: cartState.totals.total,
      status: 'held',
      holdReason: note,
      prescriptionRequired: cartState.prescriptionRequired,
      prescriptionVerified: cartState.prescriptionVerified || false,
      discountType: 'None'
    };

    const existingTransactions = getHeldTransactions();
    const updatedTransactions = [...existingTransactions, transaction];
    localStorage.setItem(STORAGE_KEYS.HELD_TRANSACTIONS, JSON.stringify(updatedTransactions));

    return transaction;
  },

  getHeldTransactions,

  recallTransaction: (transactionId: string): HeldTransaction | null => {
    const transactions = getHeldTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (transaction) {
      const updatedTransactions = transactions.filter(t => t.id !== transactionId);
      localStorage.setItem(STORAGE_KEYS.HELD_TRANSACTIONS, JSON.stringify(updatedTransactions));
      return transaction;
    }
    
    return null;
  },

  clearHeldTransactions: () => {
    localStorage.removeItem(STORAGE_KEYS.HELD_TRANSACTIONS);
  },

  saveCompletedTransaction: (transaction: Transaction) => {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPLETED_TRANSACTIONS);
    const completedTransactions = stored ? JSON.parse(stored) : [];
    completedTransactions.push(transaction);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TRANSACTIONS, JSON.stringify(completedTransactions));
  }
};
