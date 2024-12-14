# FunctionKeys Changelog

## [Unreleased]
### Added
- **Search Product Functionality**: Implemented a search dialog to allow users to search for products using the F1 key.
- **New Transaction Confirmation**: Added a confirmation dialog when starting a new transaction if there are items in the cart using the F2 key.
- **Keyboard Support**: Enabled keyboard navigation for the confirmation dialog (Esc to cancel, Enter to confirm).

### Changed
- **Function Structure**: Refactored function handlers to manage dialog states through props, improving modularity and maintainability.
- **Dialog Management**: Centralized dialog management in the `FunctionKeys` component, allowing for better control over dialog visibility.

### Fixed
- **TypeScript Errors**: Resolved issues related to TypeScript type definitions for dialog management functions.
- **Keyboard Event Handling**: Ensured that keyboard events are properly handled to enhance user experience.

## [Initial Release]
- Initial implementation of FunctionKeys with basic functionality for handling function keys.
