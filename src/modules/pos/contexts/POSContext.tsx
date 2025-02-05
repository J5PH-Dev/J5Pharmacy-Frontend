import React, { createContext, useContext, useState, useEffect } from 'react';
import { posApi } from '../services/posApi';
import { CartItem, Product } from '../types/cart';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Notifications, NotificationState } from '../components/common/Notifications';
import { ErrorLogsDialog } from '../components/common/ErrorLogsDialog';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import { AxiosError } from 'axios';

interface ErrorLog {
    timestamp: string;
    user: {
        name: string;
        employeeId: string;
        role: string;
    };
    error: string;
    details: any;
}

interface POSContextType {
  sessionId: number | null;
  branchId: number | null;
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  searchProducts: (query: string) => Promise<CartItem[]>;
  holdTransaction: (note: string) => Promise<void>;
  recallTransaction: (id: number) => Promise<void>;
  isLoading: boolean;
  notification: NotificationState;
  setNotification: React.Dispatch<React.SetStateAction<NotificationState>>;
  showNotification: (message: string, type: NotificationState['type'], error?: any) => void;
  errorLogs: ErrorLog[];
  isErrorLogsOpen: boolean;
  setIsErrorLogsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleErrorClick: () => void;
  copyLogs: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { 
    notification, 
    setNotification, 
    showNotification, 
    errorLogs,
    isErrorLogsOpen,
    setIsErrorLogsOpen,
    handleErrorClick,
    copyLogs 
  } = useNotifications();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize sales session
  useEffect(() => {
    let mounted = true;
    
    const initializeSession = async () => {
      if (!mounted) return; // Don't proceed if component is unmounting
      
      console.log('Init Session - Auth Status:', { isAuthenticated, user });
      
      if (isAuthenticated && user?.branchId) {
        console.log('Branch ID found:', user.branchId);
        setBranchId(user.branchId);
        try {
          console.log('Fetching current session...');
          const currentSession = await posApi.getCurrentSession(user.branchId);
          console.log('Current session response:', currentSession);
          if (currentSession) {
            setSessionId(currentSession.session_id);
          } else {
            console.log('No current session, starting new one...');
            const newSession = await posApi.startSession(user.branchId);
            console.log('New session created:', newSession);
            setSessionId(newSession.sessionId);
          }
        } catch (error: unknown) {
          const axiosError = error as AxiosError;
          console.error('Session initialization error details:', 
            axiosError.response?.data || axiosError.message
          );
          showNotification('Failed to initialize sales session', 'error', axiosError);
        }
      } else if (!isAuthenticated) {
        console.log('Not authenticated, skipping session initialization');
      } else {
        console.log('No branch ID found in user data');
        showNotification('No active branch selected', 'error');
      }
    };

    initializeSession();

    // Cleanup function
    return () => {
      mounted = false;
      // Clear session data on unmount
      setSessionId(null);
      setBranchId(null);
    };
  }, [isAuthenticated, user?.branchId]);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity }
          : item
      )
    );
  };

  const searchProducts = async (query: string): Promise<CartItem[]> => {
    if (!branchId) {
        showNotification('No active branch selected', 'error');
        return [];
    }

    try {
        setIsLoading(true);
        const products: Product[] = await posApi.searchProducts(query, branchId);
        
        // Map the products to CartItems
        return products.map((product: Product) => ({
            id: product.id,
            name: product.name,
            brand_name: product.brand_name,
            description: product.description,
            sideEffects: product.sideEffects,
            dosage_amount: product.dosage_amount,
            dosage_unit: product.dosage_unit,
            price: product.price,
            stock: product.stock,
            pieces_per_box: product.pieces_per_box,
            category: product.category,
            barcode: product.barcode,
            requiresPrescription: product.requiresPrescription,
            expiryDate: product.expiryDate,
            totalPieces: product.stock,
            is_in_branch: product.is_in_branch,
            quantity: 1
        }));
    } catch (error) {
        console.error('Failed to search products:', error);
        showNotification(ERROR_MESSAGES.PRODUCT.SEARCH_FAILED, 'error', error);
        return [];
    } finally {
        setIsLoading(false);
    }
  };

  const holdTransaction = async (note: string) => {
    if (!sessionId) {
      showNotification('No active sales session', 'error');
      return;
    }

    try {
      setIsLoading(true);
      await posApi.holdTransaction({
        salesSessionId: sessionId,
        items: cartItems,
        holdNumber: Date.now(),
        note
      });
      clearCart();
      showNotification('Transaction held successfully', 'success');
    } catch (error) {
      console.error('Failed to hold transaction:', error);
      showNotification('Failed to hold transaction', 'error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recallTransaction = async (id: number) => {
    try {
      setIsLoading(true);
      const transaction = await posApi.recallTransaction(id);
      setCartItems(transaction.items);
      showNotification('Transaction recalled successfully', 'success');
    } catch (error) {
      console.error('Failed to recall transaction:', error);
      showNotification('Failed to recall transaction', 'error', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <POSContext.Provider value={{
      sessionId,
      branchId,
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
      searchProducts,
      holdTransaction,
      recallTransaction,
      isLoading,
      notification,
      setNotification,
      showNotification,
      errorLogs,
      isErrorLogsOpen,
      setIsErrorLogsOpen,
      handleErrorClick,
      copyLogs
    }}>
      {children}
      <Notifications
        notification={notification}
        setNotification={setNotification}
        onErrorClick={handleErrorClick}
      />
      <ErrorLogsDialog
        open={isErrorLogsOpen}
        onClose={() => setIsErrorLogsOpen(false)}
        errorLogs={errorLogs}
        onCopyLogs={copyLogs}
      />
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}; 