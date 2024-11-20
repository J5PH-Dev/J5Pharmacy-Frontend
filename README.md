# J5 Pharmacy Point of Sale System

A modern, user-friendly pharmacy point of sale system built with React and Material-UI.

## Version
Current Version: Beta 0.2.3

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and updates.

## Description
J5 Pharmacy POS is a comprehensive web application designed to streamline pharmacy operations. It features a clean, intuitive interface and robust functionality to handle various pharmacy transactions and inventory management tasks.

## Tech Stack
- React
- TypeScript
- Material-UI
- date-fns

## Features
- Modern, intuitive user interface
- Real-time transaction processing
- Comprehensive discount system
  - Senior Citizen (20%)
  - PWD (20%)
  - Employee (10%)
  - Custom percentage
- Star Points rewards system
- Development tools for testing

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
- npm or yarn

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

### Upcoming
- [ ] User authentication
- [ ] Transaction processing
- [ ] Inventory management
- [ ] Sales reporting
- [ ] Print functionality
- [ ] Stock management
- [ ] User roles and permissions

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
This project is proprietary software. All rights reserved.

## Acknowledgments
- Material-UI team for the component library
- React team for the framework
- All contributors to the project
