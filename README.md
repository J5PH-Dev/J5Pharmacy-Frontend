# J5 Pharmacy Point of Sale System

A modern, user-friendly pharmacy point of sale system built with React and Material-UI.

## Version
Beta 0.2.1

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
│   │   └── Cart/
│   ├── devtools/
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

### Beta 0.2.1 (Current)
#### Enhanced Cart Component
- Added scroll-on-drag functionality
  - Intuitive mouse drag scrolling
  - Visual cursor feedback
  - Smooth scrolling behavior
- Implemented auto-scroll to latest item
- Optimized scrollbar styling
  - Custom scrollbar design
  - Improved visibility and interaction
  - Theme-consistent colors

#### DevTools Improvements
- Streamlined item addition
  - Single item addition feature
  - Maintains existing cart items
  - Automatic cart updates
- Enhanced development workflow
  - Clear cart functionality
  - Reset stock placeholder
  - Improved tool accessibility

#### UI/UX Enhancements
- Refined color palette
  - Improved header contrast
  - Softer interaction states
  - Better visual hierarchy
- Enhanced component spacing
- Improved responsive behavior

### Beta 0.2.0
#### Implemented Components
- Cart Component
  - Fixed height container
  - Responsive design
  - Custom scrollbar
  - Item management
- DevTools Component
  - Development utilities
  - Sample data generation
  - Cart manipulation tools

#### Added
- Cart state management
- Dummy data generation
- Development utilities
- Component integration

### Beta 0.1.0
#### Initial Components
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

#### Foundation
- Material-UI theme configuration
- Custom color palette
- Responsive grid layout
- Type definitions
- Component architecture

#### Upcoming
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
