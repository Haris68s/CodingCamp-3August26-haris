# Expense & Budget Visualizer Requirements

## Introduction

The Expense & Budget Visualizer is a mobile-friendly web application that enables users to track daily expenses, visualize spending patterns, and manage their personal budget. The system provides an intuitive interface for recording transactions, viewing spending summaries, and analyzing expenditure distribution across categories. Built with vanilla JavaScript and client-side storage, it ensures a lightweight, responsive experience across modern browsers.

## Glossary

- **System**: The Expense & Budget Visualizer application
- **Transaction**: A single expense record containing item name, amount, category, and timestamp
- **Category**: A predefined classification for expenses (Food, Transport, Fun)
- **Balance**: The cumulative sum of all transaction amounts
- **Chart**: A pie chart visual representation of spending distribution
- **Local Storage**: Browser's client-side persistent storage mechanism
- **Validation**: Process of verifying that input data meets specified requirements
- **UI**: User Interface, the visual elements users interact with
- **Mobile-Friendly**: Interface responsive and usable on devices with varying screen sizes
- **Delete Operation**: Removal of a transaction from the transaction list and local storage

## Requirements

### Requirement 1: Transaction Input Form

**User Story:** As a user, I want to input transaction details through a form, so that I can record my daily expenses.

#### Acceptance Criteria

1. THE System SHALL display an input form with three fields: Item_Name, Amount, and Category
2. THE Category field SHALL provide three predefined options: Food, Transport, and Fun
3. WHEN the user submits the form, THE Validator SHALL verify that all three fields (Item_Name, Amount, Category) contain non-empty values
4. IF any required field is empty, THEN THE Validator SHALL prevent form submission and display an error message identifying which field is missing
5. WHEN the Amount field receives input, THE Validator SHALL verify that the value is a positive number greater than zero
6. IF the Amount is zero or negative, THEN THE Validator SHALL display an error message: "Amount must be greater than zero"
7. WHEN the Amount field receives input, THE Validator SHALL verify that the value contains at most two decimal places
8. IF the Amount contains more than two decimal places, THEN THE Validator SHALL display an error message: "Amount must have at most 2 decimal places"
9. WHEN all validation passes, THE System SHALL clear the input form fields to prepare for the next transaction entry
10. WHEN the user submits a valid transaction, THE System SHALL add the transaction to the Transaction_List

### Requirement 2: Transaction Input Validation

**User Story:** As a user, I want the form to validate my input before accepting it, so that my transaction data is accurate and consistent.

#### Acceptance Criteria

1. WHEN the Item_Name field receives input, THE Validator SHALL verify that it contains at least one character
2. IF the Item_Name is empty, THEN THE Validator SHALL display an error message: "Item name is required"
3. WHEN the Amount field receives focus loss, THE Validator SHALL perform validation checks
4. WHEN a user attempts to submit with spaces-only entries, THE Validator SHALL treat spaces-only entries as empty and display an appropriate error
5. THE Validator SHALL trim whitespace from Item_Name before storing in the Transaction_List

### Requirement 3: Transaction List Display

**User Story:** As a user, I want to view all my recorded transactions in a scrollable list, so that I can review my spending history.

#### Acceptance Criteria

1. THE System SHALL display all transactions in a scrollable Transaction_List below the input form
2. EACH transaction in the list SHALL display the Item_Name, Amount, Category, and a Delete_Button
3. WHEN the transaction list exceeds the visible viewport height, THE System SHALL enable vertical scrolling with smooth scroll behavior
4. THE System SHALL display transactions in the order they were added (most recent first)
5. WHEN no transactions exist, THE System SHALL display a message: "No transactions yet. Start by adding one above."
6. THE Amount display SHALL show currency formatting with two decimal places (e.g., 50.00)
7. THE Category badge SHALL display with a consistent visual style distinct from other UI elements
8. WHEN a transaction is added or deleted, THE Transaction_List SHALL update immediately without page refresh

### Requirement 4: Transaction Deletion

**User Story:** As a user, I want to delete individual transactions, so that I can remove incorrect or unwanted entries.

#### Acceptance Criteria

1. EACH transaction row in the Transaction_List SHALL contain a Delete_Button
2. WHEN the user clicks a Delete_Button, THE System SHALL remove the transaction from the Transaction_List
3. WHEN a transaction is deleted, THE System SHALL immediately update the Balance display
4. WHEN a transaction is deleted, THE System SHALL immediately recalculate the Chart visualization
5. WHEN a transaction is deleted, THE System SHALL persist the deletion to Local_Storage

### Requirement 5: Balance Calculation and Display

**User Story:** As a user, I want to see my total spending at a glance, so that I know how much money I have spent in total.

#### Acceptance Criteria

1. THE System SHALL display a Balance_Display component showing the sum of all transaction amounts
2. THE Balance_Display SHALL be positioned prominently above the Transaction_List
3. THE Balance value SHALL update immediately when a transaction is added
4. THE Balance value SHALL update immediately when a transaction is deleted
5. THE Balance SHALL display in currency format with two decimal places (e.g., Rp 150,000.00)
6. IF no transactions exist, THE Balance_Display SHALL show "Rp 0.00"

### Requirement 6: Pie Chart Visualization

**User Story:** As a user, I want to see a visual breakdown of my spending by category, so that I can understand where my money goes.

#### Acceptance Criteria

1. THE System SHALL display a pie Chart representing spending distribution across Food, Transport, and Fun categories
2. THE Chart SHALL use Chart.js library for rendering
3. EACH category in the Chart SHALL be assigned a distinct, visually appealing color
4. THE Chart legend SHALL display category names and their corresponding amounts
5. WHEN a transaction is added, THE Chart SHALL recalculate and update automatically
6. WHEN a transaction is deleted, THE Chart SHALL recalculate and update automatically
7. IF no transactions exist, THE Chart SHALL display a placeholder message: "Add transactions to see spending distribution"
8. THE Chart SHALL display percentage breakdown for each category in the legend or tooltip
9. THE Chart rendering SHALL not block user interaction with other UI elements

### Requirement 7: Responsive Mobile-Friendly Interface

**User Story:** As a user accessing the application on various devices, I want the interface to adapt to my screen size, so that I can use the application effectively on mobile phones, tablets, and desktops.

#### Acceptance Criteria

1. THE System interface SHALL be fully responsive and display correctly on screens from 320px to 1920px width
2. WHEN the viewport width is less than 768px, THE input form, balance display, and transaction list SHALL stack vertically
3. WHEN the viewport width is 768px or greater, THE System MAY display the Chart and Transaction_List side-by-side if space permits
4. THE input form SHALL use appropriately sized touch targets (minimum 44px height) for mobile usability
5. THE Delete_Button SHALL be easily tappable with a minimum 44px touch target area
6. THE System SHALL display correctly in portrait and landscape orientations
7. WHEN content exceeds the viewport height, THE System SHALL enable scrolling without horizontal scroll

### Requirement 8: Local Storage Data Persistence

**User Story:** As a user, I want my transactions to persist between sessions, so that my data is not lost when I close the browser.

#### Acceptance Criteria

1. WHEN the user adds a transaction, THE System SHALL save it to Browser_Local_Storage with a unique identifier
2. WHEN the user closes and reopens the application, THE System SHALL load all previously saved transactions from Local_Storage
3. WHEN the user deletes a transaction, THE System SHALL remove it from Local_Storage
4. WHEN the user closes the application and reopens it, THE loaded transactions SHALL match those from the previous session (excluding deleted transactions)
5. IF Local_Storage is unavailable, THEN THE System SHALL display a warning message and continue operation with in-memory storage only
6. THE System SHALL use a Storage_Key (e.g., "expenses") to organize all transaction data in Local_Storage
7. WHEN Local_Storage exceeds browser limits, THEN THE System SHALL display a warning message indicating insufficient storage space

### Requirement 9: Browser Compatibility

**User Story:** As a user, I want the application to work across different web browsers, so that I can access it regardless of my browser choice.

#### Acceptance Criteria

1. THE System SHALL function correctly in Chrome (version 90 and above)
2. THE System SHALL function correctly in Firefox (version 88 and above)
3. THE System SHALL function correctly in Edge (version 90 and above)
4. THE System SHALL function correctly in Safari (version 14 and above)
5. THE System SHALL not use JavaScript features incompatible with target browsers
6. THE Chart.js library SHALL be loaded and rendered correctly in all supported browsers
7. THE Local_Storage API SHALL function correctly in all supported browsers

### Requirement 10: Code Organization and Quality

**User Story:** As a developer, I want the codebase to be well-organized and maintainable, so that I can understand and modify the application easily.

#### Acceptance Criteria

1. THE System SHALL use a single CSS file located at `css/style.css`
2. THE System SHALL use a single JavaScript file located at `js/app.js`
3. THE HTML markup SHALL be contained in a single `index.html` file
4. THE JavaScript code SHALL use descriptive variable and function names that clearly indicate purpose
5. THE JavaScript code SHALL include comments for complex logic and public functions
6. THE CSS SHALL use a consistent naming convention and organization
7. THE code SHALL follow consistent indentation and formatting standards

### Requirement 11: Minimal Clean Interface Design

**User Story:** As a user, I want a clean and simple interface, so that I can focus on tracking expenses without visual clutter.

#### Acceptance Criteria

1. THE System SHALL display a minimal interface with no unnecessary visual elements
2. THE System SHALL use a consistent color palette with no more than five primary colors
3. THE typography SHALL be readable with clear hierarchy between headings, labels, and content
4. THE input form fields, buttons, and interactive elements SHALL have sufficient whitespace for clarity
5. THE System interface SHALL minimize cognitive load through simple, intuitive layouts
6. THE button labels SHALL be clear and action-oriented (e.g., "Add Expense", "Delete")

### Requirement 12: Performance Requirements

**User Story:** As a user, I want the application to load quickly and respond instantly to my actions, so that I have a smooth and efficient user experience.

#### Acceptance Criteria

1. THE System page SHALL load and display initial UI within 2 seconds on a 3G connection
2. WHEN the user adds a transaction, THE System SHALL update the Balance and Chart within 500ms
3. WHEN the user deletes a transaction, THE System SHALL update the Balance and Chart within 500ms
4. WHEN the user scrolls the Transaction_List, THE System SHALL maintain 60 frames per second rendering
5. THE Chart rendering SHALL not cause noticeable lag or UI freezing
6. THE System SHALL minimize JavaScript bundle size through efficient coding practices

### Requirement 13: Optional Feature - Custom Categories

**User Story:** As a user, I want to create custom expense categories beyond the default ones, so that I can categorize my expenses more flexibly.

#### Acceptance Criteria

1. WHERE custom categories are enabled, THE System SHALL allow users to add new category names through a UI control
2. WHEN a user adds a custom category, THE Category field dropdown SHALL include the new category option
3. WHEN a custom category is created, THE System SHALL persist it to Local_Storage
4. WHEN the user closes and reopens the application, THE custom categories SHALL be available in the Category dropdown
5. WHEN a transaction uses a custom category and that category is deleted, THE System SHALL handle the orphaned category gracefully

### Requirement 14: Optional Feature - Monthly Summary View

**User Story:** As a user, I want to view a summary of my spending by month, so that I can analyze my spending patterns over time.

#### Acceptance Criteria

1. WHERE monthly summary is enabled, THE System SHALL provide a view showing total spending per month
2. WHEN the user navigates to the summary view, THE System SHALL display a list of months with their total spending amounts
3. WHEN the user selects a month, THE System SHALL display transactions for that month only
4. THE monthly summary view SHALL calculate and display spending by category for the selected month
5. WHEN the user returns to the main view, THE Transaction_List SHALL display all transactions again

### Requirement 15: Optional Feature - Transaction Sorting

**User Story:** As a user, I want to sort my transactions by amount or category, so that I can find and analyze specific expenses more easily.

#### Acceptance Criteria

1. WHERE transaction sorting is enabled, THE System SHALL provide sort controls above the Transaction_List
2. WHEN the user selects "Sort by Amount (High to Low)", THE Transaction_List SHALL reorder transactions by amount in descending order
3. WHEN the user selects "Sort by Amount (Low to High)", THE Transaction_List SHALL reorder transactions by amount in ascending order
4. WHEN the user selects "Sort by Category", THE Transaction_List SHALL reorder transactions grouped by category
5. WHEN the user adds a new transaction, THE Transaction_List SHALL maintain the current sort order
6. THE current sort setting SHALL persist across page refreshes when stored in Local_Storage

### Requirement 16: Optional Feature - Spending Limit Alerts

**User Story:** As a user, I want to set spending limits per category and receive alerts when exceeded, so that I can stay within my budget.

#### Acceptance Criteria

1. WHERE spending limits are enabled, THE System SHALL provide a UI to set a spending limit for each category
2. WHEN a user sets a spending limit for a category, THE System SHALL persist it to Local_Storage
3. WHEN the total spending for a category exceeds its limit, THE System SHALL highlight that category row in the Category_Summary with a visual warning (e.g., red background)
4. WHEN spending exceeds the limit, THE System SHALL display an alert message indicating the overage amount
5. WHEN the user deletes a transaction and spending falls below the limit, THE System SHALL remove the warning highlight

### Requirement 17: Optional Feature - Dark/Light Mode Toggle

**User Story:** As a user, I want to toggle between dark and light color themes, so that I can choose a visual style that suits my preference and reduces eye strain.

#### Acceptance Criteria

1. WHERE dark mode is enabled, THE System SHALL provide a toggle control to switch between dark and light themes
2. WHEN the user clicks the theme toggle, THE System SHALL instantly switch all UI colors to the alternate theme
3. WHEN the user sets a preferred theme, THE System SHALL persist the preference to Local_Storage
4. WHEN the user reopens the application, THE System SHALL load and apply the saved theme preference
5. THE dark theme SHALL use a dark background (#1a1a1a or similar) with light text for readability
6. THE light theme SHALL use a light background (#ffffff or similar) with dark text for readability
7. BOTH themes SHALL maintain sufficient contrast ratios for accessibility (WCAG AA standard minimum 4.5:1)

## Technical Specifications

### Stack Requirements

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **No Frameworks**: No React, Vue, Angular, or similar frameworks
- **Chart Library**: Chart.js for pie chart visualization
- **Storage**: Browser Local Storage API only (no backend/database required)
- **Build Tools**: Not required; application shall run as static HTML/CSS/JS files

### Browser Support

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

### File Structure

```
project-root/
├── index.html           # Main HTML file
├── css/
│   └── style.css        # Single CSS file for all styles
├── js/
│   └── app.js           # Single JavaScript file for all logic
└── libs/
    └── chart.js         # Chart.js library (external dependency)
```

### Data Structure

**Transaction Object:**
```json
{
  "id": "unique-identifier",
  "itemName": "string",
  "amount": "number (positive, max 2 decimals)",
  "category": "Food|Transport|Fun|CustomCategory",
  "timestamp": "ISO-8601 date string"
}
```

**Local Storage Format:**
```json
{
  "expenses": [
    {"id": "...", "itemName": "...", "amount": 25.50, "category": "Food", "timestamp": "..."},
    {"id": "...", "itemName": "...", "amount": 15.00, "category": "Transport", "timestamp": "..."}
  ]
}
```

### Performance Targets

- Initial page load: < 2 seconds on 3G
- Add transaction: < 500ms update
- Delete transaction: < 500ms update
- Chart re-render: < 500ms
- Scroll performance: 60 FPS

### Accessibility Considerations

- Semantic HTML5 structure
- ARIA labels for form inputs
- Keyboard navigation support for all interactive elements
- Color contrast ratios meeting WCAG AA standards
- Focus indicators clearly visible
- Screen reader compatible

