import { Product, CartItem, CartState, CartTotals } from '../types/cart';

export const cartManager = {
  addItem: (currentState: CartState, product: Product, quantity: number = 1): CartState => {
    const existingItemIndex = currentState.items.findIndex(
      item => item.id === product.id
    );

    let newItems: CartItem[];
    if (existingItemIndex > -1) {
      // Update existing item quantity
      newItems = currentState.items.map((item, index) => {
        if (index === existingItemIndex) {
          return {
            ...item,
            quantity: item.quantity + quantity
          };
        }
        return item;
      });
    } else {
      // Add new item
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        brand_name: product.brand_name,
        description: product.description,
        sideEffects: product.sideEffects,
        dosage_amount: product.dosage_amount,
        dosage_unit: product.dosage_unit,
        price: product.price,
        quantity: quantity,
        category: product.category,
        barcode: product.barcode,
        requiresPrescription: product.requiresPrescription,
        expiryDate: product.expiryDate,
        stock: product.stock,
        pieces_per_box: product.pieces_per_box,
        totalPieces: product.totalPieces
      };
      newItems = [...currentState.items, newItem];
    }

    const prescriptionRequired = newItems.some(item => item.requiresPrescription);
    return {
      ...currentState,
      items: newItems,
      totals: calculateTotals(newItems),
      prescriptionRequired,
      prescriptionVerified: prescriptionRequired ? false : undefined
    };
  },

  removeItem: (currentState: CartState, itemId: number): CartState => {
    const newItems = currentState.items.filter(item => item.id !== itemId);
    const prescriptionRequired = newItems.some(item => item.requiresPrescription);
    
    return {
      ...currentState,
      items: newItems,
      totals: calculateTotals(newItems),
      prescriptionRequired,
      prescriptionVerified: prescriptionRequired ? currentState.prescriptionVerified : undefined
    };
  },

  updateQuantity: (currentState: CartState, itemId: number, quantity: number): CartState => {
    if (quantity <= 0) return currentState;

    const newItems = currentState.items.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity };
      }
      return item;
    });

    return {
      ...currentState,
      items: newItems,
      totals: calculateTotals(newItems)
    };
  },

  applyDiscount: (currentState: CartState, itemId: number, discountPercent: number): CartState => {
    if (discountPercent < 0 || discountPercent > 100) return currentState;

    const newItems = currentState.items.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          discount: discountPercent 
        };
      }
      return item;
    });

    return {
      ...currentState,
      items: newItems,
      totals: calculateTotals(newItems)
    };
  },

  verifyPrescription: (currentState: CartState, verified: boolean): CartState => {
    if (!currentState.prescriptionRequired) return currentState;
    
    return {
      ...currentState,
      prescriptionVerified: verified
    };
  },

  clearCart: (): CartState => ({
    items: [],
    totals: {
      subtotal: 0,
      totalDiscount: 0,
      total: 0,
      itemCount: 0
    },
    prescriptionRequired: false,
    prescriptionVerified: undefined
  })
};

const calculateTotals = (items: CartItem[]): CartTotals => {
  const itemTotals = items.map(item => {
    const subtotal = item.price * item.quantity;
    const discountAmount = item.discount ? (subtotal * (item.discount / 100)) : 0;
    return {
      subtotal,
      discountAmount
    };
  });

  const subtotal = itemTotals.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = itemTotals.reduce((sum, item) => sum + item.discountAmount, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    totalDiscount,
    total: subtotal - totalDiscount,
    itemCount
  };
};
