import { format } from 'date-fns';

let currentTransactionNumber = 1;

export const generateTransactionId = (branchId: string = 'B001') => {
  const dateStr = format(new Date(), 'yyMMdd');
  const transactionNumber = String(currentTransactionNumber).padStart(5, '0');
  currentTransactionNumber++;
  return `${branchId}-${dateStr}-${transactionNumber}`;
};

export const resetTransactionNumber = () => {
  currentTransactionNumber = 1;
};

export const getCurrentTransactionNumber = () => {
  return currentTransactionNumber;
};
