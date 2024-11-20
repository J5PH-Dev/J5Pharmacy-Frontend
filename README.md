# J5 Pharmacy Point of Sale System

A modern, user-friendly pharmacy point of sale system built with React and Material-UI.

## Version
Current Version: Beta 0.2.4-c

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and updates.

## Description
J5 Pharmacy POS is a comprehensive web application designed to streamline pharmacy operations. It features a clean, intuitive interface and robust functionality to handle various pharmacy transactions and inventory management tasks.

## Tech Stack
- React
- TypeScript
- Material-UI
- date-fns

## Features
### Current Features (Beta 0.2.4-c)
- Modern and intuitive user interface built with Material-UI
- Real-time transaction processing
- Multiple payment methods support (Cash, GCash, Maya)
- Digital payment integration with QR codes
- Dynamic product search and filtering
- Discount management system
- Receipt generation and printing
- Transaction history tracking
- UUID-based transaction ID system

### Planned Features
- Branch Management System
- Inventory Management
- Medicine and Products Management
- Customer Management
- Attendance System
- Analytics and Sales Reports
- Role-based Access Control
  - Admin Dashboard
  - Manager Dashboard
  - Pharmacist POS Interface

## Technology Stack
- React
- TypeScript
- Material-UI
- Local Storage for data persistence

## Project Structure
```
j5pharmacy/
├── public/
├── src/
│   ├── assets/
│   │   └── images/
│   │       └── logo.png
│   ├── components/
│   │   ├── ActionButtons/
│   │   ├── Cart/
│   │   ├── DiscountDialog/
│   │   ├── FunctionKeys/
│   │   ├── Header/
│   │   ├── TransactionInfo/
│   │   └── TransactionSummary/
│   ├── contexts/
│   ├── devtools/
│   ├── hooks/
│   ├── layouts/
│   ├── services/
│   ├── theme/
│   ├── types/
│   ├── utils/
│   │   └── calculations.ts
│   └── App.tsx
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Development Status
Currently in Beta phase (v0.2.4-c) with focus on core POS functionality. The system is being expanded to include comprehensive pharmacy management features.

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner

### `npm run build`
Builds the app for production

## Contributing
1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License
Proprietary software. All rights reserved.

## Acknowledgments
- Material-UI team for the component library
- React team for the framework
- All contributors to the project
