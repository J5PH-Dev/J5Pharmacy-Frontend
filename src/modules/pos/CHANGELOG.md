# J5 Pharmacy POS System Changelog

## [Beta 0.2.4-c] - 2024-00-20

### Changed
- Redesigned Header component with new logo and greeting system
- Enhanced TransactionSummary UI with improved layout and styling
- Moved theme configuration to dedicated theme directory
- Simplified transaction ID generation logic
- Reorganized component imports for better maintainability

### Added
- Dynamic time-based greeting in Header
- StarPoints calculation in TransactionSummary
- Custom discount label formatting
- Improved transaction information display

### Removed
- Redundant transaction ID prop from CheckoutDialog
- Void and Checkout buttons from TransactionSummary
- Unused imports and duplicate functions

### Fixed
- Transaction ID consistency across components
- Component prop type definitions
- File organization and import paths

## [Beta 0.2.4-b] - 2024-09-20

### Added
- Multiple payment methods support (Cash, GCash, Maya)
- QR code payment dialog for digital payments
- Reference ID field for digital payment verification
- Print button on receipt preview
- Enhanced receipt preview styling
- Structured transaction ID format (B001-YYMMDD-XXXXX)
- Payment details on receipt (method, amount, reference)

### Changed
- Updated checkout dialog UI with payment method selection
- Improved button colors and styling for better visibility
- Reorganized receipt preview layout
- Enhanced receipt information display
- Modified transaction ID generation system

## [Beta 0.2.4-a] - 2024-09-20

### Added
- Implemented Checkout Dialog with payment processing
- Added Receipt component with printer-friendly design
- Integrated transaction ID generation using UUID
- Added customer name and StarPoints ID fields
- Implemented amount tendered and change calculation
- Added print receipt functionality

### Changed
- Updated App.tsx to handle checkout process
- Added uuid dependency for transaction IDs

## [Beta 0.2.3] - 2024-09-20

### Changed
- Updated website title to "J5 Pharmacy POS"
- Implemented new branding icons using icon_solid.png:
  * logo512.ico for browser tab icon
  * logo192.png for small devices
  * logo512.png for larger displays
- Updated web app manifest information
- Improved website metadata and description

## [Beta 0.2.2] - 2024-09-20

### Added
- Transaction Summary header for better section identification
- Improved visual hierarchy in financial calculations
- Comprehensive discount calculation system
- Star points calculation (1 point per 200 PHP)
- Multiple discount types support (Senior, PWD, Employee, Custom)
- CHANGELOG.md for detailed version history

### Changed
- Refined Transaction Summary UI for better visual cohesion
- Removed unnecessary container shadows and borders
- Improved spacing and alignment throughout the summary section
- Centered Total section with optimized layout
- Enhanced alternating row colors for better readability
- Refactored calculation logic in calculations.ts
- Updated TypeScript types for better type safety
- Enhanced transaction summary layout
- Updated README.md for better documentation

### Fixed
- Total section alignment and spacing issues
- Removed redundant visual containers
- Optimized layout spacing between sections

### Technical
- Improved floating-point calculation precision
- Enhanced type definitions in types.ts
- Modular component architecture improvements

## [Beta 0.2.1] - 2024-09-20

### Added
#### Cart Component Enhancements
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

### Changed
#### UI/UX Enhancements
- Refined color palette
  - Improved header contrast
  - Softer interaction states
  - Better visual hierarchy
- Enhanced component spacing
- Improved responsive behavior

## [Beta 0.2.0] - 2024-09-20

### Added
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

#### Core Features
- Cart state management
- Dummy data generation
- Development utilities
- Component integration

## [Beta 0.1.1] - 2024-09-20

### Added
- Basic transaction processing
- Simple discount system
- Initial cart implementation

### Changed
- Updated UI components
- Improved form validation
- Enhanced error handling

### Fixed
- Various UI/UX issues
- Basic calculation errors
- Form submission bugs

## [Beta 0.1.0] - 2024-09-20

### Initial Release
- Basic POS functionality
- Product management
- Simple transaction processing
- Basic UI components
- Material-UI integration
- React Router setup
- Initial project structure
- Basic styling and theming
- Development environment setup
