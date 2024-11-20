import { CartItem } from '../types/cart';

export const sampleItems: CartItem[] = [
  {
    itemCode: 'MED001',
    productName: 'Amoxicillin 500mg',
    requiresPrescription: true,
    brand: 'Generic',
    category: 'Antibiotics',
    dosage: '500mg',
    price: 15.50,
    quantity: 30,
    amount: 465.00
  },
  {
    itemCode: 'MED002',
    productName: 'Paracetamol',
    requiresPrescription: false,
    brand: 'Biogesic',
    category: 'Pain Relief',
    dosage: '500mg',
    price: 5.25,
    quantity: 20,
    amount: 105.00
  },
  {
    itemCode: 'MED003',
    productName: 'Metformin',
    requiresPrescription: true,
    brand: 'Glucophage',
    category: 'Diabetes',
    dosage: '850mg',
    price: 12.75,
    quantity: 60,
    amount: 765.00
  },
  {
    itemCode: 'MED004',
    productName: 'Losartan',
    requiresPrescription: true,
    brand: 'Cozaar',
    category: 'Hypertension',
    dosage: '50mg',
    price: 18.90,
    quantity: 30,
    amount: 567.00
  },
  {
    itemCode: 'MED005',
    productName: 'Vitamin C',
    requiresPrescription: false,
    brand: 'Celin',
    category: 'Vitamins',
    dosage: '500mg',
    price: 3.50,
    quantity: 100,
    amount: 350.00
  },
  {
    itemCode: 'MED006',
    productName: 'Omeprazole',
    requiresPrescription: true,
    brand: 'Prilosec',
    category: 'Antacid',
    dosage: '20mg',
    price: 15.25,
    quantity: 30,
    amount: 457.50
  },
  {
    itemCode: 'MED007',
    productName: 'Cetirizine',
    requiresPrescription: false,
    brand: 'Zyrtec',
    category: 'Antihistamine',
    dosage: '10mg',
    price: 8.75,
    quantity: 20,
    amount: 175.00
  },
  {
    itemCode: 'MED008',
    productName: 'Salbutamol',
    requiresPrescription: true,
    brand: 'Ventolin',
    category: 'Bronchodilator',
    dosage: '2mg',
    price: 22.50,
    quantity: 30,
    amount: 675.00
  },
  {
    itemCode: 'MED009',
    productName: 'Multivitamins',
    requiresPrescription: false,
    brand: 'Centrum',
    category: 'Vitamins',
    dosage: 'N/A',
    price: 25.00,
    quantity: 30,
    amount: 750.00
  },
  {
    itemCode: 'MED010',
    productName: 'Amlodipine',
    requiresPrescription: true,
    brand: 'Norvasc',
    category: 'Hypertension',
    dosage: '5mg',
    price: 16.80,
    quantity: 30,
    amount: 504.00
  },
  {
    itemCode: 'MED011',
    productName: 'Ibuprofen',
    requiresPrescription: false,
    brand: 'Advil',
    category: 'Pain Relief',
    dosage: '400mg',
    price: 7.25,
    quantity: 24,
    amount: 174.00
  },
  {
    itemCode: 'MED012',
    productName: 'Metoprolol',
    requiresPrescription: true,
    brand: 'Lopressor',
    category: 'Beta Blocker',
    dosage: '50mg',
    price: 19.90,
    quantity: 30,
    amount: 597.00
  },
  {
    itemCode: 'MED013',
    productName: 'Sertraline',
    requiresPrescription: true,
    brand: 'Zoloft',
    category: 'Antidepressant',
    dosage: '50mg',
    price: 28.75,
    quantity: 30,
    amount: 862.50
  },
  {
    itemCode: 'MED014',
    productName: 'Zinc Supplement',
    requiresPrescription: false,
    brand: 'Nature Made',
    category: 'Supplements',
    dosage: '50mg',
    price: 8.99,
    quantity: 100,
    amount: 899.00
  },
  {
    itemCode: 'MED015',
    productName: 'Aspirin',
    requiresPrescription: false,
    brand: 'Bayer',
    category: 'Pain Relief',
    dosage: '81mg',
    price: 6.50,
    quantity: 30,
    amount: 195.00
  },
  {
    itemCode: 'MED016',
    productName: 'Levothyroxine',
    requiresPrescription: true,
    brand: 'Synthroid',
    category: 'Thyroid',
    dosage: '100mcg',
    price: 25.30,
    quantity: 30,
    amount: 759.00
  },
  {
    itemCode: 'MED017',
    productName: 'Fluticasone',
    requiresPrescription: true,
    brand: 'Flonase',
    category: 'Allergy',
    dosage: '50mcg',
    price: 32.99,
    quantity: 1,
    amount: 32.99
  },
  {
    itemCode: 'MED018',
    productName: 'Vitamin D3',
    requiresPrescription: false,
    brand: 'Nature\'s Bounty',
    category: 'Vitamins',
    dosage: '2000IU',
    price: 12.99,
    quantity: 90,
    amount: 1169.10
  },
  {
    itemCode: 'MED019',
    productName: 'Gabapentin',
    requiresPrescription: true,
    brand: 'Neurontin',
    category: 'Anticonvulsant',
    dosage: '300mg',
    price: 24.50,
    quantity: 60,
    amount: 1470.00
  },
  {
    itemCode: 'MED020',
    productName: 'Montelukast',
    requiresPrescription: true,
    brand: 'Singulair',
    category: 'Asthma',
    dosage: '10mg',
    price: 35.75,
    quantity: 30,
    amount: 1072.50
  },
  {
    itemCode: 'MED021',
    productName: 'Fish Oil',
    requiresPrescription: false,
    brand: 'Nordic Naturals',
    category: 'Supplements',
    dosage: '1000mg',
    price: 29.99,
    quantity: 60,
    amount: 1799.40
  },
  {
    itemCode: 'MED022',
    productName: 'Escitalopram',
    requiresPrescription: true,
    brand: 'Lexapro',
    category: 'Antidepressant',
    dosage: '10mg',
    price: 45.99,
    quantity: 30,
    amount: 1379.70
  },
  {
    itemCode: 'MED023',
    productName: 'Magnesium Citrate',
    requiresPrescription: false,
    brand: 'NOW Foods',
    category: 'Supplements',
    dosage: '200mg',
    price: 15.99,
    quantity: 120,
    amount: 1918.80
  },
  {
    itemCode: 'MED024',
    productName: 'Lisinopril',
    requiresPrescription: true,
    brand: 'Zestril',
    category: 'Hypertension',
    dosage: '10mg',
    price: 18.50,
    quantity: 30,
    amount: 555.00
  },
  {
    itemCode: 'MED025',
    productName: 'Probiotics',
    requiresPrescription: false,
    brand: 'Culturelle',
    category: 'Supplements',
    dosage: '10B CFU',
    price: 24.99,
    quantity: 30,
    amount: 749.70
  }
];
