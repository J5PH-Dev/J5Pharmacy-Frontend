import { CartItem } from '../modules/pos/types/cart';

// Helper function to create both Box and Piece variants of a medicine
const createMedicineVariants = (
  baseId: number,
  name: string,
  dosage_amount: number,
  dosage_unit: 'mg' | 'ml' | 'g' | 'tablet',
  boxPrice: number,
  piecesPerBox: number,
  category: string,
  requiresPrescription: boolean,
  boxBarcode: string,
  pieceBarcode: string
): CartItem[] => {
  const piecePrice = Math.round((boxPrice / piecesPerBox) * 100) / 100; // Round to 2 decimal places
  
  return [
    {
      id: baseId,
      name,
      dosage_amount,
      dosage_unit,
      price: boxPrice,
      quantity: 1,
      SKU: 'Box',
      category,
      barcode: boxBarcode,
      requiresPrescription,
      expiryDate: '2024-12-31'
    },
    {
      id: baseId + 1000,
      name,
      dosage_amount,
      dosage_unit,
      price: piecePrice,
      quantity: 1,
      SKU: 'Piece',
      category,
      barcode: pieceBarcode,
      requiresPrescription,
      expiryDate: '2024-12-31'
    }
  ];
};

// Generate sample items with both Box and Piece variants
export const sampleItems: CartItem[] = [
  ...createMedicineVariants(1, 'Amoxicillin', 500, 'mg', 250.00, 30, 'Antibiotics', true, 'AMX05000301', 'AMX05000302'),
  ...createMedicineVariants(3, 'Metformin', 850, 'mg', 350.00, 100, 'Diabetes', true, 'MET08501001', 'MET08501002'),
  ...createMedicineVariants(5, 'Losartan', 50, 'mg', 450.00, 50, 'Hypertension', true, 'LOS00500501', 'LOS00500502'),
  ...createMedicineVariants(7, 'Cetirizine', 10, 'mg', 180.00, 30, 'Allergy', false, 'CET00100301', 'CET00100302'),
  ...createMedicineVariants(9, 'Paracetamol', 500, 'mg', 120.00, 100, 'Pain Relief', false, 'PCM05001001', 'PCM05001002'),
  ...createMedicineVariants(11, 'Omeprazole', 20, 'mg', 280.00, 30, 'Gastrointestinal', true, 'OMP00200301', 'OMP00200302'),
  ...createMedicineVariants(13, 'Amlodipine', 5, 'mg', 320.00, 50, 'Hypertension', true, 'AML00500501', 'AML00500502'),
  ...createMedicineVariants(15, 'Metoprolol', 50, 'mg', 380.00, 50, 'Hypertension', true, 'MTP00500501', 'MTP00500502'),
  ...createMedicineVariants(17, 'Vitamin C', 500, 'mg', 200.00, 100, 'Vitamins', false, 'VTC05001001', 'VTC05001002'),
  ...createMedicineVariants(19, 'Aspirin', 81, 'mg', 150.00, 100, 'Pain Relief', false, 'ASP00811001', 'ASP00811002'),
  ...createMedicineVariants(21, 'Ibuprofen', 400, 'mg', 180.00, 50, 'Pain Relief', false, 'IBU04000501', 'IBU04000502'),
  ...createMedicineVariants(23, 'Gabapentin', 300, 'mg', 580.00, 50, 'Pain Relief', true, 'GBP03000501', 'GBP03000502'),
];

