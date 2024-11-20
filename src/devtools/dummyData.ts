import { CartItem } from '../types';

const randomFromArray = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const brands = [
  'Generic', 'Biogesic', 'Neozep', 'Decolgen', 'Medicol', 
  'Alaxan', 'Dolfenal', 'Bioflu', 'Kremil-S', 'Diatabs'
];

const categories = [
  'Pain Relief', 'Antibiotics', 'Vitamins', 'Antacids', 
  'Cold & Flu', 'Allergy', 'Supplements', 'First Aid'
];

const dosages = [
  '500mg', '250mg', '100mg', '50mg', '25mg', 
  '10mg', '5mg', '2mg', '1mg', '0.5mg'
];

let dummyItemCounter = 1;

export const generateDummyItem = (): CartItem => {
  const price = Math.random() * 1000 + 10; // Random price between 10 and 1010
  const quantity = Math.floor(Math.random() * 50) + 1; // Random quantity between 1 and 50
  
  const item: CartItem = {
    itemCode: `DUMMY${String(dummyItemCounter).padStart(3, '0')}`,
    productName: `Test Product ${dummyItemCounter}`,
    requiresPrescription: Math.random() > 0.7, // 30% chance of requiring prescription
    brand: randomFromArray(brands),
    category: randomFromArray(categories),
    dosage: randomFromArray(dosages),
    price: Number(price.toFixed(2)),
    quantity: quantity,
    amount: Number((price * quantity).toFixed(2))
  };

  dummyItemCounter++;
  return item;
};
