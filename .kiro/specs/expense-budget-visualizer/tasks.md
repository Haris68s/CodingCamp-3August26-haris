# Implementation Plan: Expense & Budget Visualizer

## Overview

This implementation plan breaks down the Expense & Budget Visualizer into discrete, actionable tasks following a vanilla JavaScript architecture with modular functions, client-side storage, and Chart.js visualization. All tasks use JavaScript ES6+ with DOM manipulation patterns, event delegation, and functional programming principles as outlined in the design document. Tasks are ordered to ensure incremental validation and minimal dependencies between parallel work.

## Tasks

- [x] 1. Project Setup and File Structure
  - [ ] 1.1 Create project folder structure (index.html, css/style.css, js/app.js)
    - Create directories: `css/` and `js/`
    - Create empty files: `index.html`, `css/style.css`, `js/app.js`
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 1.2 Create semantic HTML5 structure with accessibility framework
    - Write HTML5 boilerplate with proper doctype and meta tags (viewport, charset, description)
    - Create semantic sections: header, main, section elements with proper roles
    - Add ARIA labels, aria-required, role attributes to prepare for form inputs
    - Include placeholder divs for form, balance, chart, and transaction list
    - Import Chart.js library via CDN in script tag
    - _Requirements: 7.1, 7.6, 9.1, 11.1_
  
  - [ ] 1.3 Set up CSS foundation with CSS variables and responsive grid system
    - Define CSS variables for colors (primary, text, borders, category colors)
    - Create base styles for body, typography hierarchy (h1-h3, body, labels)
    - Set up mobile-first responsive breakpoints (320px, 768px, 1024px)
    - Define button styles, form element styles, spacing utilities
    - _Requirements: 7.1, 7.2, 7.4, 11.2, 11.3_

- [x] 2. Form Component and Validation Service
  - [x] 2.1 Implement HTML form markup with input fields and error containers
    - Create form with three input fields: itemName (text), amount (number), category (select)
    - Add error message spans for each field with unique IDs (itemNameError, amountError, categoryError)
    - Populate category select with three options: Food, Transport, Fun
    - Add form submit button with appropriate label
    - _Requirements: 1.1, 1.2, 1.3, 2.1_
  
  - [x] 2.2 Implement form validation functions (validateForm, isValidDecimalPlaces)
    - Write validateForm() returning {isValid: boolean, errors: object}
    - Validate itemName: not empty, trim whitespace, required check
    - Validate amount: required, positive (>0), decimal places (≤2)
    - Validate category: required, must be selected
    - Write isValidDecimalPlaces(num, maxPlaces) helper function
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.4, 2.5_
  
  - [ ]* 2.3 Write property test for form validation
    - **Property 1: Amount Validation** - For any amount value, if ≤0 or >2 decimals, validation fails
    - **Property 2: Item Name Validation** - For any string input, if empty or whitespace-only, validation fails
    - **Validates: Requirements 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.4**

- [~] 3. Transaction Management Core
  - [~] 3.1 Implement transaction creation and storage service functions
    - Write createTransaction(formData) generating unique ID with timestamp
    - Write generateId() creating IDs in format "tx-{timestamp}-{random}"
    - Write getFormData() reading input values from DOM
    - Setup appState object with transactions array and configuration
    - _Requirements: 1.10, 8.1_
  
  - [ ] 3.2 Implement form submission handler and transaction addition
    - Write addTransaction() handler: validate → create → store → render → clear form
    - Write clearForm() and clearAllErrors() functions
    - Wire form.addEventListener('submit', addTransaction)
    - Cache frequently used DOM elements in DOM object for performance
    - _Requirements: 1.9, 1.10, 3.8_
  
  - [ ] 3.3 Implement transaction deletion handler with event delegation
    - Write deleteTransaction(id) function removing from state
    - Wire click event listener to transactionList for delete buttons
    - Use event delegation pattern instead of individual listeners
    - Call render() after deletion to update all UI components
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 3.4 Write property test for transaction persistence round-trip
    - **Property 8: Storage Serialization Round Trip** - Serialize and deserialize transaction preserves all fields
    - **Validates: Requirements 8.1, 8.2, 8.4_

- [ ] 4. Balance Calculation and Display
  - [ ] 4.1 Implement balance calculation logic
    - Write calculateBalance(transactions) returning sum of all amounts
    - Use reduce() to accumulate transaction amounts
    - Handle parseFloat() for numeric accuracy
    - _Requirements: 5.1_
  
  - [ ] 4.2 Implement balance display and formatting
    - Write formatCurrency(amount) using Intl.NumberFormat with 'id-ID' locale
    - Write updateBalanceDisplay() updating #balanceAmount DOM element
    - Display "Rp 0.00" when no transactions
    - Format all amounts with exactly 2 decimal places
    - _Requirements: 5.1, 5.2, 5.5, 5.6_
  
  - [ ] 4.3 Wire balance updates to transaction lifecycle
    - Call updateBalanceDisplay() in render() function
    - Ensure balance updates when transaction added (via render in addTransaction)
    - Ensure balance updates when transaction deleted (via render in deleteTransaction)
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 4.4 Write property test for balance calculation accuracy
    - **Property 5: Balance Calculation Accuracy** - Balance equals sum of all transaction amounts
    - **Property 6: Balance Update on Deletion** - Deleting transaction reduces balance by that amount
    - **Validates: Requirements 5.1, 5.3, 5.4_

- [ ] 5. Chart Visualization with Chart.js
  - [ ] 5.1 Implement category grouping and chart data calculation
    - Write groupByCategory(transactions) returning {Food: amount, Transport: amount, Fun: amount}
    - Write calculateChartData(transactions) returning {labels, amounts, colors}
    - Map category names to colors using CATEGORY_COLORS constant
    - Handle empty transaction list gracefully
    - _Requirements: 6.5, 6.6, 6.8_
  
  - [ ] 5.2 Implement Chart.js pie chart rendering
    - Write renderChart(transactions) function managing Chart instance lifecycle
    - Create Chart instance with doughnut type (pie chart variant)
    - Configure legend position (bottom), labels, tooltip formatting
    - Display "Rp X.XX (Y%)" format in legend for amounts and percentages
    - Destroy previous chart instance before creating new one
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.8_
  
  - [ ] 5.3 Implement chart placeholder and empty state
    - Hide canvas and show placeholder div when no transactions exist
    - Show canvas and hide placeholder when transactions exist
    - Display placeholder text: "Add transactions to see spending distribution"
    - Properly destroy chart instance when switching to empty state
    - _Requirements: 6.7_
  
  - [ ] 5.4 Wire chart updates to transaction lifecycle
    - Call renderChart() in render() function
    - Ensure chart recalculates when transaction added
    - Ensure chart recalculates when transaction deleted
    - Verify non-blocking render (no UI freezing)
    - _Requirements: 6.5, 6.6, 6.9_
  
  - [ ]* 5.5 Write property test for chart data aggregation
    - **Property 7: Chart Data Aggregation** - Category totals equal sum of constituent transactions
    - **Validates: Requirements 6.5, 6.6_

- [ ] 6. Checkpoint - Verify Core MVP Functionality
  - Ensure all core functionality working: form submission, transaction display, balance calculation, chart rendering
  - Run through manual test scenarios: add transactions, verify display updates, delete transaction, verify all components update
  - Check form validation errors display correctly for invalid inputs
  - Verify no console errors or warnings
  - Ask the user if any questions or clarifications needed before continuing

- [ ] 7. Transaction List Display Component
  - [ ] 7.1 Implement transaction list rendering with HTML generation
    - Write renderTransactionList(transactions) function building HTML from transactions array
    - Create transaction rows with data-id attribute for deletion
    - Display itemName, amount (formatted), category, delete button in each row
    - Show category as badge with CSS class indicating category type
    - Use escapeHTML() for XSS prevention on item names
    - _Requirements: 3.1, 3.2, 3.6, 3.7_
  
  - [ ] 7.2 Implement transaction list ordering (most recent first)
    - Display transactions in reverse chronological order (most recent first)
    - Use slice().reverse() pattern before mapping to HTML
    - _Requirements: 3.4_
  
  - [ ] 7.3 Implement empty state and scrolling container
    - Show empty state message when no transactions
    - Hide empty state message when transactions exist
    - Set up scrollable container with fixed height and overflow-y: auto
    - Enable smooth scroll behavior via CSS
    - _Requirements: 3.3, 3.5_
  
  - [ ] 7.4 Implement escapeHTML() utility for security
    - Write escapeHTML(text) creating div element, setting textContent, returning innerHTML
    - Use on all user-provided text in transaction rows to prevent XSS
    - Apply to itemName and category display
    - _Requirements: 3.2_
  
  - [ ]* 7.5 Write unit tests for transaction list rendering
    - Test that transactions render with correct count
    - Test that most recent transaction appears first
    - Test that empty state displays when no transactions
    - Test that HTML escaping prevents XSS on special characters
    - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [ ] 8. Responsive Design and Mobile-First CSS
  - [ ] 8.1 Implement mobile layout (320px - 767px)
    - Create flex column layout for form, balance, chart, list sections
    - Set form width: 100%, padding: 1rem
    - Set balance card with margin and full width
    - Set list container with fixed height and scrolling
    - Set chart full width below list
    - Ensure minimum 44px touch targets for all buttons
    - _Requirements: 7.1, 7.2, 7.4, 7.5_
  
  - [ ] 8.2 Implement tablet layout (768px - 1023px)
    - Create 2-column grid layout: form/balance/list on left, chart on right
    - Set grid-template-columns: 1fr 1fr
    - Set gap: 1.5rem between columns
    - _Requirements: 7.3, 7.6_
  
  - [ ] 8.3 Implement desktop layout (1024px+)
    - Create multi-row grid: form/balance on left, chart spanning rows on right, list spanning both columns below
    - Set grid-template-columns: 1fr 1fr
    - Set grid-template-rows: auto auto
    - Form max-width: 400px
    - Gap: 2rem
    - _Requirements: 7.3, 7.6_
  
  - [ ] 8.4 Implement typography and spacing
    - Define heading sizes: h1 1.875rem, h2 1.5rem, h3 1.25rem
    - Define body font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
    - Set line-height: 1.5 for body text
    - Define consistent margin/padding scale
    - _Requirements: 11.3, 11.4_
  
  - [ ] 8.5 Implement color palette and visual hierarchy
    - Define 5-color palette: primary (purple), success, warning, danger, neutral
    - Set category colors: Food (#FF6B6B), Transport (#4ECDC4), Fun (#FFE66D)
    - Apply consistent colors to buttons, badges, error messages
    - _Requirements: 11.2, 11.4, 11.5_
  
  - [ ]* 8.6 Write responsive design tests
    - Test layout at 320px, 768px, 1024px viewport widths
    - Verify form, balance, chart, list display correctly at each breakpoint
    - Test portrait and landscape orientations
    - Verify no horizontal scroll appears
    - _Requirements: 7.1, 7.2, 7.6, 7.7_

- [ ] 9. LocalStorage Persistence
  - [ ] 9.1 Implement storage manager functions
    - Write initStorageManager() checking LocalStorage availability
    - Write saveToStorage(transactions) serializing to JSON and saving
    - Write loadFromStorage() deserializing from JSON
    - Handle legacy data format (direct array) for backward compatibility
    - _Requirements: 8.1, 8.2, 8.3, 8.6_
  
  - [ ] 9.2 Implement storage error handling
    - Detect QuotaExceededError and display warning message
    - Set appState.isStorageAvailable flag based on storage check
    - Show storage warning banner if storage unavailable
    - Continue with in-memory storage as fallback
    - _Requirements: 8.5, 8.7_
  
  - [ ] 9.3 Implement storage initialization and lifecycle hooks
    - Call checkStorage() during app initialization
    - Call loadFromStorage() before first render
    - Call saveToStorage() after each transaction addition
    - Call saveToStorage() after each transaction deletion
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 9.4 Write integration tests for storage round-trip
    - Test adding transaction and verifying it persists to storage
    - Test loading application and verifying transactions are restored
    - Test deleting transaction and verifying deletion persists
    - Test storage unavailability doesn't crash application
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Error Handling and Validation Display
  - [ ] 10.1 Implement error message display logic
    - Write displayErrors(errors) showing error messages for failed fields
    - Write clearAllErrors() hiding all error messages
    - Set error element textContent to message text
    - Set error element style.display to 'block' or 'none'
    - _Requirements: 1.4, 2.2_
  
  - [ ] 10.2 Implement form error flow
    - On invalid submission: display specific errors, prevent submission
    - On valid submission: clear errors, process transaction
    - Set error element role="alert" for accessibility
    - _Requirements: 1.4, 2.2, 2.3_
  
  - [ ] 10.3 Implement accessibility for error messages
    - Add aria-live="assertive" to alert-role error regions
    - Add aria-required="true" to required form inputs
    - Wire form labels to inputs via for/id attributes
    - _Requirements: 7.5_

- [ ] 11. Checkpoint - Verify All MVP Features Complete
  - Ensure form validation, transaction management, balance calculation, chart, list, storage, and responsive design all working
  - Run comprehensive manual test: add multiple transactions with various categories, verify chart displays correct aggregation
  - Test deletion flow: add transaction, delete it, verify balance and chart update
  - Test persistence: add transactions, refresh page, verify data loads
  - Test responsive: resize browser to 320px, 768px, 1024px, verify layout adapts
  - Ask the user if questions arise before implementing optional features

- [ ] 12. Optional Feature - Custom Categories
  - [ ] 12.1 Implement category management functions
    - Write addCustomCategory(name) function adding to appState.customCategories
    - Write getAllCategories() returning default + custom categories
    - Write updateCategoryDropdown() rebuilding select options
    - Save custom categories to localStorage
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [ ] 12.2 Implement custom category UI controls
    - Add "Add Custom Category" button below category select
    - Create modal or inline form for entering new category name
    - Wire button to open category input, submit to add category
    - Wire select update to show new category in dropdown
    - _Requirements: 13.1_
  
  - [ ] 12.3 Implement custom category persistence and loading
    - Load custom categories from localStorage on app init
    - Update dropdown with custom categories after loading
    - Validate custom category names (non-empty, not duplicates)
    - _Requirements: 13.3, 13.4_

- [ ] 13. Optional Feature - Monthly Summary View
  - [ ] 13.1 Implement month filtering and grouping logic
    - Write filterTransactionsByMonth(transactions, yearMonth) returning filtered array
    - Write getMonthsWithTransactions() returning array of months with data
    - Extract month from timestamp using string slice (YYYY-MM format)
    - _Requirements: 14.1_
  
  - [ ] 13.2 Implement month view switching UI
    - Add "View by Month" button or tab to switch views
    - Create month selector (dropdown or month list)
    - Wire selection to filter transactions and update components
    - _Requirements: 14.1, 14.2_
  
  - [ ] 13.3 Implement month detail view rendering
    - Display total spending for selected month
    - Display category breakdown for selected month
    - Update chart to show only selected month's data
    - Update transaction list to show only selected month's transactions
    - _Requirements: 14.3, 14.4_
  
  - [ ] 13.4 Implement return to main view
    - Add "View All" or back button to return to full dashboard
    - Reset transaction list and chart to show all data
    - _Requirements: 14.5_

- [ ] 14. Optional Feature - Transaction Sorting
  - [ ] 14.1 Implement sort state and functions
    - Add appState.currentSort property (default: 'date')
    - Write sortTransactions(transactions, sortType) returning sorted array
    - Implement sort types: 'date' (descending), 'amount-asc', 'amount-desc', 'category'
    - _Requirements: 15.1_
  
  - [ ] 14.2 Implement sort control UI
    - Add sort selector (dropdown or buttons) above transaction list
    - Display current sort order with visual indicator
    - Wire selector to setSortOrder() function
    - _Requirements: 15.2, 15.3, 15.4_
  
  - [ ] 14.3 Implement sort persistence
    - Save sort preference to localStorage
    - Load sort preference on app initialization
    - Apply saved sort when rendering list
    - _Requirements: 15.6_
  
  - [ ] 14.4 Implement sort maintenance on transaction add
    - Maintain current sort order when new transaction added
    - Re-render list with sort applied after new transaction
    - _Requirements: 15.5_

- [ ] 15. Optional Feature - Spending Limit Alerts
  - [ ] 15.1 Implement limit setting and storage
    - Add appState.categoryLimits storing {category: limitAmount}
    - Write setCategoryLimit(category, limit) function
    - Save limits to localStorage
    - _Requirements: 16.1, 16.2_
  
  - [ ] 15.2 Implement limit checking and alert display
    - Write checkLimits() function checking each category total against limit
    - Write highlightCategoryWarning(category, overage) showing overage
    - Write removeCategoryWarning(category) removing highlight
    - Display overage amount in alert
    - _Requirements: 16.3, 16.4_
  
  - [ ] 15.3 Implement limit checking on transaction lifecycle
    - Call checkLimits() after transaction addition
    - Call checkLimits() after transaction deletion
    - Update warning display based on new balances
    - _Requirements: 16.5_
  
  - [ ] 15.4 Implement limit UI controls
    - Add UI to set limits for each category (settings panel or modal)
    - Display current limits and allow editing
    - Wire save button to setCategoryLimit() function
    - _Requirements: 16.1_

- [ ] 16. Optional Feature - Dark/Light Mode Toggle
  - [ ] 16.1 Implement theme CSS variables and switching
    - Define CSS variables for light theme and dark theme
    - Create [data-theme="dark"] selector with dark theme variables
    - Update all component styles to use CSS variables
    - _Requirements: 17.5, 17.6_
  
  - [ ] 16.2 Implement theme toggle JavaScript
    - Write setTheme(theme) updating document attribute and appState
    - Write toggleTheme() switching between light and dark
    - Update toggle button icon (moon/sun emoji)
    - _Requirements: 17.2_
  
  - [ ] 16.3 Implement theme persistence
    - Save theme preference to localStorage
    - Load theme preference on app initialization
    - Apply saved theme before render
    - _Requirements: 17.3, 17.4_
  
  - [ ] 16.4 Verify theme accessibility standards
    - Test contrast ratios in both themes meet WCAG AA (4.5:1 minimum)
    - Verify all text readable in both themes
    - Test color-dependent UI elements have non-color indicators
    - _Requirements: 17.7_

- [ ] 17. Browser Compatibility Testing
  - [ ] 17.1 Test Chrome (version 90+) compatibility
    - Run application in Chrome 90 or higher
    - Verify all features working: form, transactions, chart, storage
    - Check console for errors or deprecation warnings
    - Test responsive layout at multiple viewport sizes
    - _Requirements: 9.1_
  
  - [ ] 17.2 Test Firefox (version 88+) compatibility
    - Run application in Firefox 88 or higher
    - Repeat feature verification from Chrome test
    - _Requirements: 9.2_
  
  - [ ] 17.3 Test Edge (version 90+) compatibility
    - Run application in Edge 90 or higher
    - Repeat feature verification
    - _Requirements: 9.3_
  
  - [ ] 17.4 Test Safari (version 14+) compatibility
    - Run application in Safari 14 or higher
    - Repeat feature verification
    - _Requirements: 9.4_
  
  - [ ] 17.5 Verify Chart.js library rendering across browsers
    - Confirm pie chart renders correctly in all supported browsers
    - Verify legend displays and legend labels formatted correctly
    - _Requirements: 9.6_
  
  - [ ] 17.6 Verify LocalStorage API across browsers
    - Confirm data persists correctly across sessions in each browser
    - Verify graceful degradation if storage unavailable
    - _Requirements: 9.7_

- [ ] 18. Performance Optimization and Testing
  - [ ] 18.1 Test initial page load time
    - Measure page load time on 3G connection (using Chrome DevTools throttling)
    - Ensure load time < 2 seconds
    - Measure with and without transaction data
    - _Requirements: 12.1_
  
  - [ ] 18.2 Test transaction add/delete performance
    - Measure time to add transaction (form validation + render): target < 500ms
    - Measure time to delete transaction (DOM update + render): target < 500ms
    - Test with 100+ existing transactions to stress test
    - _Requirements: 12.2, 12.3_
  
  - [ ] 18.3 Test chart rendering performance
    - Measure time to render/update chart: target < 500ms
    - Test with various transaction counts (10, 100, 500)
    - Verify no UI freezing or lag during chart updates
    - _Requirements: 12.4, 12.5_
  
  - [ ] 18.4 Test scroll performance on large lists
    - Create application with 500+ transactions
    - Verify 60 FPS scroll performance (use Chrome DevTools Performance tab)
    - Measure frame rate while scrolling transaction list
    - _Requirements: 12.4_
  
  - [ ] 18.5 Minimize bundle size and optimize code
    - Review js/app.js for unnecessary code or duplication
    - Apply CSS minification techniques if using build tool
    - Verify Chart.js loaded efficiently via CDN
    - Consolidate utility functions
    - _Requirements: 12.6_

- [ ] 19. Code Quality and Documentation
  - [ ] 19.1 Add comprehensive code comments and documentation
    - Add section comments dividing app.js into logical sections
    - Comment all public functions with purpose and parameters
    - Document validation logic and business rules
    - Document CSS variable meanings and responsive breakpoints
    - _Requirements: 10.4, 10.5, 10.6_
  
  - [ ] 19.2 Verify consistent code style and naming conventions
    - Review variable naming for clarity and consistency
    - Verify function names describe their purpose
    - Check CSS class naming follows BEM convention
    - Ensure consistent indentation and formatting throughout
    - _Requirements: 10.4, 10.5, 10.6_
  
  - [ ] 19.3 Review error handling coverage
    - Verify all user inputs are validated
    - Check error messages are user-friendly and clear
    - Verify no silent failures or unhandled promise rejections
    - Test edge cases: empty form, negative amounts, special characters
    - _Requirements: 1.4, 1.6, 2.2_
  
  - [ ] 19.4 Run accessibility audit
    - Test keyboard navigation through form and interactive elements
    - Verify ARIA labels present on all form inputs
    - Check tab order is logical
    - Test with screen reader (NVDA, JAWS, VoiceOver)
    - Verify focus indicators visible for all interactive elements
    - _Requirements: 7.5_

- [ ] 20. Final Checkpoint - Full Feature Verification
  - Perform end-to-end verification of all MVP features + selected optional features
  - Test add transaction flow with validation
  - Test delete transaction flow with balance/chart update
  - Test localStorage persistence and recovery
  - Test responsive design at all breakpoints
  - Test all optional features if implemented
  - Run through performance benchmarks
  - Verify browser compatibility across Chrome, Firefox, Edge, Safari
  - Ask the user if any issues or questions before deployment

## Notes

- Tasks marked with `*` are optional test-related tasks. Core implementation tasks without `*` are mandatory.
- Each task includes specific requirements references for traceability to the specification.
- Property-based tests use fast-check library or similar property testing framework.
- Unit tests and integration tests can use Jest, Vitest, or similar testing framework.
- Checkpoints provide natural breaking points for user feedback and validation.
- Optional features (Tasks 12-16) can be implemented in any order or skipped for MVP.
- Performance testing (Task 18) should be done near the end after all features are implemented.
- Browser compatibility testing (Task 17) can be done incrementally or at the end.
- All code must remain in single files: index.html, css/style.css, js/app.js per design requirements.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "3.3"] },
    { "id": 3, "tasks": ["2.3", "4.1", "4.2"] },
    { "id": 4, "tasks": ["4.3", "5.1", "7.1"] },
    { "id": 5, "tasks": ["3.4", "4.4", "5.2", "5.3", "5.4", "7.2"] },
    { "id": 6, "tasks": ["5.5", "7.3", "7.4"] },
    { "id": 7, "tasks": ["7.5", "8.1", "8.2", "8.3"] },
    { "id": 8, "tasks": ["8.4", "8.5", "8.6"] },
    { "id": 9, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 10, "tasks": ["9.4", "10.1", "10.2", "10.3"] },
    { "id": 11, "tasks": ["12.1", "13.1", "14.1", "15.1", "16.1"] },
    { "id": 12, "tasks": ["12.2", "13.2", "14.2", "15.2", "16.2"] },
    { "id": 13, "tasks": ["12.3", "13.3", "14.3", "15.3", "16.3"] },
    { "id": 14, "tasks": ["13.4", "14.4", "15.4", "16.4"] },
    { "id": 15, "tasks": ["17.1", "17.2", "17.3", "17.4", "17.5", "17.6"] },
    { "id": 16, "tasks": ["18.1", "18.2", "18.3", "18.4", "18.5"] },
    { "id": 17, "tasks": ["19.1", "19.2", "19.3", "19.4"] }
  ]
}
```
