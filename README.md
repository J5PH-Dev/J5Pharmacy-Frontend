# J5 Pharmacy Management System

A comprehensive pharmacy management solution built with React, TypeScript, and Material-UI. This system provides a complete suite of tools for managing pharmacy operations, from point of sale to inventory management.

## Module Versions
- POS: Beta 0.2.4-d
- Admin: Beta 0.1.0
- Analytics: Beta 0.1.0
- Attendance: Beta 0.1.0
- Branch: Beta 0.1.0
- Customers: Beta 0.1.0
- Dashboard: Beta 0.1.0
- Inventory: Beta 0.1.0

See individual module CHANGELOG.md files in their respective directories for detailed version history and updates.

## System Overview

### Core Modules

#### 1. Point of Sale (POS)
- Multiple payment methods (Cash, GCash, Maya)
- QR code payment integration
- Receipt generation and printing
- Transaction management
- Real-time inventory updates

#### 2. Inventory Management
- Stock tracking and alerts
- Product categorization
- Batch processing
- Expiry date monitoring
- Supplier management

#### 3. Customer Management
- Customer profiles
- Loyalty program
- Purchase history
- Prescription tracking
- Points system

#### 4. Admin Dashboard
- User management
- Role-based access control
- System settings
- Audit logging
- Security controls

#### 5. Analytics
- Sales reports
- Inventory analytics
- Customer insights
- Performance metrics
- Data visualization

#### 6. Branch Management
- Multi-branch support
- Branch-specific settings
- Performance tracking
- Resource allocation

#### 7. Attendance System
- Employee time tracking
- Schedule management
- Leave requests
- Attendance reports

#### 8. Dashboard
- Real-time metrics
- Key performance indicators
- Quick access features
- System notifications

## Tech Stack
- **Frontend**: React, TypeScript
- **UI Framework**: Material-UI
- **State Management**: React Context
- **Charts**: Chart.js
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Testing**: Jest, React Testing Library
- **Build Tool**: Vite
- **Package Manager**: npm

## System Requirements
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- Modern web browser
- Minimum 4GB RAM
- 1GB free disk space

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm start`
4. Build for production: `npm run build`

For detailed setup and development guidelines, see:
- [GUIDE.md](GUIDE.md) - Development and implementation guide
- [TEAM.md](TEAM.md) - Team structure and work distribution

## Project Structure
```
j5pharmacy/
├── public/
├── src/
│   ├── modules/           # Feature modules
│   ├── common/           # Shared components
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   └── styles/          # Global styles
├── public/              # Static assets
├── docs/               # Documentation
└── tests/              # Test files
```

## Development Guidelines
- Follow TypeScript best practices
- Write unit tests for new features
- Update module CHANGELOG.md
- Follow commit message conventions
- Create pull requests for review

## Available Scripts
```bash
# Development
npm start

# Testing
npm run test
npm run test:coverage

# Building
npm run build

# Linting
npm run lint
npm run lint:fix

# Type Checking
npm run type-check
```

## Documentation
- [CHANGELOG.md](CHANGELOG.md) - Project changelog
- [GUIDE.md](GUIDE.md) - Development guide
- [TEAM.md](TEAM.md) - Team information
- API Documentation (Coming Soon)
- User Manual (Coming Soon)

## Contributing
1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Submit pull request

## Support
For support and questions:
- Check documentation
- Create an issue
- Contact team lead

## License
[License Type] - See LICENSE file for details

## Acknowledgments
- Material-UI team
- React community
- All contributors
