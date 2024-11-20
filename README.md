# J5 Pharmacy Point of Sale System

A modern, user-friendly pharmacy point of sale system built with React and Material-UI.

## Version
Beta 0.1.0

## Description
J5 Pharmacy POS is a comprehensive web application designed to streamline pharmacy operations. It features a clean, intuitive interface and robust functionality to handle various pharmacy transactions and inventory management tasks.

## Tech Stack
- React 18
- TypeScript
- Material-UI (MUI)
- Emotion (CSS-in-JS)
- date-fns

## Features
- Modern, responsive UI
- Dynamic function key shortcuts
- Real-time transaction management
- Comprehensive error handling
- Role-based access control (upcoming)

## Project Structure
```
j5pharmacy/
├── public/
├── src/
│   ├── assets/
│   │   └── images/
│   │       └── logo.png
│   ├── components/
│   │   ├── Header/
│   │   ├── TransactionInfo/
│   │   ├── FunctionKeys/
│   │   └── (future components)
│   ├── theme/
│   ├── types/
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

## Development Log

### Beta 0.1.0 (Current)

#### Implemented Components
- Header Component
  - Dynamic time-based greeting
  - Logo display
  - Username display
  - Responsive design

- Transaction Info Component
  - Dynamic transaction ID
  - Real-time clock
  - Date formatting
  - Transaction ID format: {BranchID}-{YYMMDD}-XXXXX

- Function Keys Component
  - Keyboard shortcuts (F1-F9, F12)
  - Visual feedback on hover
  - Icon integration
  - Responsive layout

#### Added
- Material-UI theme configuration
- Custom color palette
- Responsive grid layout
- Type definitions
- Component architecture

#### Changes
- Improved button hover states
- Enhanced color contrast
- Added transition animations
- Optimized component spacing

#### Upcoming
- [ ] User authentication
- [ ] Transaction processing
- [ ] Inventory management
- [ ] Sales reporting
- [ ] Print functionality
- [ ] Settings management

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
