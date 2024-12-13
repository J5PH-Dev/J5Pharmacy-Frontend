import { CartState } from '../types/cart';
import { HeldTransaction, Transaction } from '../types/transaction';

const HELD_TRANSACTIONS_KEY = 'heldTransactions';

const getHeldTransactions = (): HeldTransaction[] => {
  const stored = localStorage.getItem(HELD_TRANSACTIONS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

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
      notes: note,
      holdReason: note,
      prescriptionRequired: cartState.prescriptionRequired,
      prescriptionVerified: cartState.prescriptionVerified
    };

    // Get existing held transactions
    const existingTransactions = getHeldTransactions();
    
    // Add new transaction
    const updatedTransactions = [...existingTransactions, transaction];
    
    // Save to localStorage
    localStorage.setItem(HELD_TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));

    return transaction;
  },

  getHeldTransactions,

  recallTransaction: (transactionId: string): HeldTransaction | null => {
    const transactions = getHeldTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (transaction) {
      // Remove from held transactions
      const updatedTransactions = transactions.filter(t => t.id !== transactionId);
      localStorage.setItem(HELD_TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
      return transaction;
    }
    
    return null;
  },

  clearHeldTransactions: () => {
    localStorage.removeItem(HELD_TRANSACTIONS_KEY);
  }
};
