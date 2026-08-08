# Expense & Budget Visualizer - Technical Design

## Overview

The Expense & Budget Visualizer is a lightweight, client-side web application built with vanilla JavaScript and CSS3 that enables users to track daily expenses, visualize spending patterns, and manage personal budgets. The system follows a modular architecture with clear separation of concerns between data management, validation, storage, and presentation layers.

### Key Design Goals

1. **Simplicity**: Single-file architecture with minimal dependencies (only Chart.js)
2. **Performance**: Sub-500ms updates, 60 FPS scrolling, <2s initial load
3. **Responsiveness**: Mobile-first design supporting 320px to 1920px viewports
4. **Persistence**: Client-side storage with graceful degradation
5. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
6. **Maintainability**: Clear code organization, comprehensive comments, consistent naming

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │   Form   │  │ Balance  │  │  Chart   │  │  Transaction │ │
│  │Component │  │ Component│  │Component │  │  List        │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ (DOM Events & Updates)
┌────────────────────────▼────────────────────────────────────┐
│                   Application Logic Layer                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Event Handlers & State Management                  │    │
│  │  - addTransaction()                                 │    │
│  │  - deleteTransaction()                              │    │
│  │  - updateUIComponents()                             │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────┘
                         │ (Function Calls)
┌────────────────────────▼────────────────────────────────────┐
│                    Service Layer                             │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │ Validation       │  │ Calculation Services             │ │
│  │ Service          │  │ - calculateBalance()             │ │
│  │ - validateForm() │  │ - calculateChartData()           │ │
│  │ - validateAmount()│ │ - groupByCategory()              │ │
│  └──────────────────┘  └──────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ (Read/Write)
┌────────────────────────▼────────────────────────────────────┐
│                    Data Layer                                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Storage Manager (LocalStorage Interface)             │ │
│  │ - saveTransactions()                                 │ │
│  │ - loadTransactions()                                 │ │
│  │ - deleteTransaction()                                │ │
│  │ - Fallback to in-memory storage if unavailable       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
User Input (Form)
      │
      ▼
┌─────────────────────┐
│ Event Listener      │
│ (form.addEventListener)
└─────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│ Validation Service              │
│ - Validate Item Name            │
│ - Validate Amount (>0, 2 decimals)
│ - Validate Category             │
│ - Trim Whitespace               │
└─────────────────────────────────┘
      │
      ├─ Invalid ──▶ Display Error Message
      │
      └─ Valid
           │
           ▼
    ┌─────────────────────┐
    │ Create Transaction  │
    │ Object (with ID)    │
    └─────────────────────┘
           │
           ▼
    ┌─────────────────────┐
    │ Add to State Array  │
    └─────────────────────┘
           │
           ├─▶ Save to LocalStorage
           │
           └─▶ Trigger UI Update
                │
                ├─▶ Clear Form Fields
                ├─▶ Render Transaction List
                ├─▶ Update Balance Display
                └─▶ Recalculate & Update Chart
```

---

## Components and Interfaces

### 1. ExpenseForm Component

**Purpose**: Capture user input for new transactions.

**HTML Structure**:
```html
<div class="form-container">
  <form id="expenseForm" class="expense-form">
    <div class="form-group">
      <label for="itemName">Item Name</label>
      <input type="text" id="itemName" name="itemName" required>
      <span class="error-message" id="itemNameError"></span>
    </div>
    
    <div class="form-group">
      <label for="amount">Amount (Rp)</label>
      <input type="number" id="amount" name="amount" placeholder="0.00" required>
      <span class="error-message" id="amountError"></span>
    </div>
    
    <div class="form-group">
      <label for="category">Category</label>
      <select id="category" name="category" required>
        <option value="">-- Select Category --</option>
        <option value="Food">Food</option>
        <option value="Transport">Transport</option>
        <option value="Fun">Fun</option>
      </select>
      <span class="error-message" id="categoryError"></span>
    </div>
    
    <button type="submit" class="btn btn-primary">Add Expense</button>
  </form>
</div>
```

**Functions**:
```javascript
// Collect form data into object
function getFormData() {
  return {
    itemName: document.getElementById('itemName').value,
    amount: parseFloat(document.getElementById('amount').value),
    category: document.getElementById('category').value
  }
}

// Clear all form fields and error messages
function clearForm() {
  document.getElementById('expenseForm').reset()
  clearAllErrors()
}

// Reset error display
function clearAllErrors() {
  document.querySelectorAll('.error-message').forEach(msg => {
    msg.textContent = ''
    msg.style.display = 'none'
  })
}
```

### 2. ValidationService

**Purpose**: Validate transaction input before persistence.

**Key Functions**:

```javascript
function validateForm(formData) {
  // Returns: { isValid: boolean, errors: { fieldName: string } }
  
  const errors = {}
  
  // Validate Item Name
  if (!formData.itemName || formData.itemName.trim() === '') {
    errors.itemName = 'Item name is required'
  }
  
  // Validate Amount
  if (formData.amount === null || formData.amount === undefined) {
    errors.amount = 'Amount is required'
  } else if (formData.amount <= 0) {
    errors.amount = 'Amount must be greater than zero'
  } else if (!isValidDecimalPlaces(formData.amount, 2)) {
    errors.amount = 'Amount must have at most 2 decimal places'
  }
  
  // Validate Category
  if (!formData.category) {
    errors.category = 'Category is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  }
}

function isValidDecimalPlaces(num, maxPlaces) {
  const decimalPart = (num.toString().split('.')[1] || '')
  return decimalPart.length <= maxPlaces
}

function trimAndCleanInput(formData) {
  // Returns cleaned data
  return {
    itemName: formData.itemName.trim(),
    amount: parseFloat(formData.amount).toFixed(2),
    category: formData.category.trim()
  }
}
```

### 3. TransactionList Component

**Purpose**: Display and manage the list of recorded transactions.

**HTML Structure**:
```html
<div class="list-container">
  <h2>Transaction History</h2>
  <div id="transactionList" class="transaction-list">
    <!-- Dynamic content inserted here -->
  </div>
  <div id="emptyState" class="empty-state">
    No transactions yet. Start by adding one above.
  </div>
</div>
```

**Functions**:
```javascript
function renderTransactionList(transactions) {
  const listDiv = document.getElementById('transactionList')
  
  if (transactions.length === 0) {
    listDiv.innerHTML = ''
    document.getElementById('emptyState').style.display = 'block'
    return
  }
  
  document.getElementById('emptyState').style.display = 'none'
  
  // Render in reverse order (most recent first)
  listDiv.innerHTML = transactions
    .slice()
    .reverse()
    .map(tx => createTransactionRow(tx))
    .join('')
  
  attachDeleteListeners()
}

function createTransactionRow(transaction) {
  return `
    <div class="transaction-row" data-id="${transaction.id}">
      <div class="transaction-info">
        <div class="transaction-name">${escapeHTML(transaction.itemName)}</div>
        <span class="category-badge category-${transaction.category.toLowerCase()}">
          ${transaction.category}
        </span>
      </div>
      <div class="transaction-amount">Rp ${formatCurrency(transaction.amount)}</div>
      <button class="btn-delete" data-id="${transaction.id}" 
              aria-label="Delete ${escapeHTML(transaction.itemName)}">
        ✕
      </button>
    </div>
  `
}

function attachDeleteListeners() {
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id
      handleDeleteTransaction(id)
    })
  })
}
```

### 4. BalanceDisplay Component

**Purpose**: Show total spending amount.

**HTML Structure**:
```html
<div class="balance-container">
  <div class="balance-card">
    <h3>Total Spent</h3>
    <div id="balanceAmount" class="balance-amount">Rp 0.00</div>
  </div>
</div>
```

**Functions**:
```javascript
function updateBalanceDisplay(balance) {
  const balanceDiv = document.getElementById('balanceAmount')
  balanceDiv.textContent = `Rp ${formatCurrency(balance)}`
}

function calculateBalance(transactions) {
  // Returns: number (sum of all transaction amounts)
  return transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
}
```

### 5. ChartComponent

**Purpose**: Visualize spending distribution by category using Chart.js.

**HTML Structure**:
```html
<div class="chart-container">
  <div class="chart-wrapper">
    <canvas id="categoryChart"></canvas>
  </div>
  <div id="chartPlaceholder" class="chart-placeholder">
    Add transactions to see spending distribution
  </div>
</div>
```

**Functions**:
```javascript
let chartInstance = null

function renderChart(transactions) {
  const chartData = calculateChartData(transactions)
  
  if (transactions.length === 0) {
    document.getElementById('categoryChart').style.display = 'none'
    document.getElementById('chartPlaceholder').style.display = 'block'
    if (chartInstance) chartInstance.destroy()
    return
  }
  
  document.getElementById('categoryChart').style.display = 'block'
  document.getElementById('chartPlaceholder').style.display = 'none'
  
  const ctx = document.getElementById('categoryChart').getContext('2d')
  
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.amounts,
        backgroundColor: chartData.colors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 12 },
            padding: 15,
            formatter: (label, ctx) => {
              const value = ctx.chart.data.datasets[0].data[ctx.datasetIndex]
              const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: Rp ${formatCurrency(value)} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

function calculateChartData(transactions) {
  const grouped = groupByCategory(transactions)
  const colors = {
    Food: '#FF6B6B',
    Transport: '#4ECDC4',
    Fun: '#FFE66D'
  }
  
  return {
    labels: Object.keys(grouped),
    amounts: Object.values(grouped),
    colors: Object.keys(grouped).map(cat => colors[cat] || '#999')
  }
}

function groupByCategory(transactions) {
  // Returns: { Food: amount, Transport: amount, Fun: amount }
  return transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + parseFloat(tx.amount)
    return acc
  }, {})
}
```

---

## Data Models and Storage Schema

### Transaction Object Model

```javascript
// In-memory representation
{
  id: "tx-1692345600000",        // UUID based on timestamp
  itemName: "Coffee",             // User input, trimmed
  amount: 25.50,                  // Positive number, 2 decimals
  category: "Food",               // One of: Food, Transport, Fun, or custom
  timestamp: "2024-08-15T10:00:00Z" // ISO-8601 format
}
```

### Application State

```javascript
// Main application state object
const appState = {
  transactions: [],        // Array of Transaction objects
  selectedSort: 'recent',  // 'recent', 'amount-desc', 'amount-asc', 'category'
  theme: 'light',          // 'light' or 'dark'
  customCategories: [],    // Optional: custom category names
  categoryLimits: {},      // Optional: { "Food": 500.00, ... }
  isStorageAvailable: true // Tracks LocalStorage availability
}
```

### LocalStorage Schema

```json
{
  "expenses": [
    {
      "id": "tx-1692345600000",
      "itemName": "Coffee",
      "amount": 25.50,
      "category": "Food",
      "timestamp": "2024-08-15T10:00:00Z"
    },
    {
      "id": "tx-1692349200000",
      "itemName": "Bus Fare",
      "amount": 15.00,
      "category": "Transport",
      "timestamp": "2024-08-15T12:00:00Z"
    }
  ],
  "appSettings": {
    "theme": "light",
    "selectedSort": "recent"
  },
  "customCategories": [],
  "categoryLimits": {}
}
```

---
## Storage Service

### LocalStorage Manager

**Purpose**: Handle persistence with graceful fallback to in-memory storage.

**Functions**:

```javascript
function initStorageManager() {
  // Check if LocalStorage is available and writable
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    appState.isStorageAvailable = true
  } catch (e) {
    appState.isStorageAvailable = false
    showStorageWarning()
  }
}

function saveTransactions(transactions) {
  // Save entire transaction array + app settings
  
  if (!appState.isStorageAvailable) {
    console.warn('LocalStorage unavailable, data persisted in memory only')
    return
  }
  
  try {
    const data = {
      expenses: transactions,
      appSettings: {
        theme: appState.theme,
        selectedSort: appState.selectedSort
      },
      customCategories: appState.customCategories,
      categoryLimits: appState.categoryLimits
    }
    
    const json = JSON.stringify(data)
    localStorage.setItem('expenses', json)
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      showStorageLimitWarning()
    }
  }
}

function loadTransactions() {
  // Load transactions from LocalStorage or return empty array
  
  if (!appState.isStorageAvailable) {
    return []
  }
  
  try {
    const json = localStorage.getItem('expenses')
    if (!json) return []
    
    const data = JSON.parse(json)
    
    // Validate loaded data structure
    if (Array.isArray(data.expenses)) {
      appState.theme = data.appSettings?.theme || 'light'
      appState.customCategories = data.customCategories || []
      appState.categoryLimits = data.categoryLimits || {}
      return data.expenses
    }
  } catch (e) {
    console.error('Error loading transactions:', e)
  }
  
  return []
}

function deleteTransactionFromStorage(id, transactions) {
  // Remove transaction and save updated array
  
  const updated = transactions.filter(tx => tx.id !== id)
  saveTransactions(updated)
  return updated
}
```

---
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before writing the correctness properties, I'll analyze which acceptance criteria are suitable for property-based testing:

### Acceptance Criteria Testing Prework

**1.3 - Form Submission and Clearing**
  - Thoughts: This tests that after adding a valid transaction, the form fields are cleared. We can generate random valid transaction data, submit, and verify the form is empty.
  - Classification: PROPERTY
  - Test Strategy: For any valid form input, submitting should clear all form fields

**1.5 - Amount Decimal Validation**
  - Thoughts: This tests that amounts with >2 decimals are rejected. We can generate various decimal values and verify the validation function rejects the invalid ones.
  - Classification: PROPERTY
  - Test Strategy: For any amount with more than 2 decimal places, validation should fail

**2.1 - Item Name Validation**
  - Thoughts: This tests item name validation across various inputs. We can generate strings including empty, whitespace-only, and valid ones.
  - Classification: PROPERTY
  - Test Strategy: For any whitespace-only or empty string, validation should fail

**2.4 - Whitespace Trimming**
  - Thoughts: This is a property about input normalization. Any input with leading/trailing whitespace should be trimmed.
  - Classification: PROPERTY
  - Test Strategy: For any item name with whitespace, trimming should produce the non-whitespace core

**3.4 & 3.5 - Transaction Order**
  - Thoughts: This tests that transactions display in insertion order (most recent first). We can generate multiple transactions and verify order.
  - Classification: PROPERTY
  - Test Strategy: For any sequence of transactions added, rendering should display them in reverse chronological order

**4.3 - Balance Update on Deletion**
  - Thoughts: This tests that deleting a transaction updates the balance correctly. We can generate random transactions, delete one, and verify balance reduced by that amount.
  - Classification: PROPERTY
  - Test Strategy: For any transaction list and deleted transaction, balance should be reduced by that transaction's amount

**5.1 - Balance Calculation**
  - Thoughts: This tests the core calculation logic. We can generate random transaction sets and verify the sum is correct.
  - Classification: PROPERTY
  - Test Strategy: For any list of transactions, balance should equal the sum of all amounts

**6.5 - Chart Recalculation on Add**
  - Thoughts: This tests that chart data is aggregated correctly. We can generate random transactions and verify the chart data structure.
  - Classification: PROPERTY
  - Test Strategy: For any transaction set, chart data should correctly aggregate amounts by category

**8.2 - Storage Round Trip**
  - Thoughts: This is a classic serialization round-trip property. Saving and loading should produce equivalent data.
  - Classification: PROPERTY
  - Test Strategy: For any transaction, serializing to storage and deserializing should produce equivalent data

**1.5 - Amount Validation (Greater Than Zero)**
  - Thoughts: This tests that zero and negative amounts are rejected.
  - Classification: PROPERTY
  - Test Strategy: For any non-positive amount, validation should fail

### Property Reflection

Reviewing all identified properties:
- Properties for amount validation (>0, ≤2 decimals) can be consolidated into one comprehensive validation property
- Properties for balance calculation and chart aggregation have similar logic and should remain separate as they test different layers
- Storage round-trip is separate and distinct
- These represent good separation of concerns with no redundancy

## Correctness Properties (Formalized)

### Property 1: Amount Validation

*For any* input amount value, if the amount is zero or negative OR has more than two decimal places, the validation function SHALL return an error state.

**Validates: Requirements 1.5, 1.7, 1.8, 2.3**

### Property 2: Item Name Validation

*For any* input string for item name, if the string is empty or contains only whitespace characters, the validation function SHALL return an error and the trimmed result should be empty.

**Validates: Requirements 2.1, 2.4**

### Property 3: Form Clearing on Valid Submission

*For any* valid transaction form input, after submitting the form, all form fields SHALL be cleared to their initial empty states, and error messages SHALL be hidden.

**Validates: Requirements 1.9**

### Property 4: Transaction Order Preservation

*For any* sequence of transactions added in chronological order, when rendering the transaction list, they SHALL appear in reverse chronological order (most recent first).

**Validates: Requirements 3.4**

### Property 5: Balance Calculation Accuracy

*For any* list of transactions, the calculated balance value SHALL equal the precise sum of all transaction amounts.

**Validates: Requirements 5.1, 5.3, 5.4**

### Property 6: Balance Update on Deletion

*For any* transaction list containing a specific transaction, after deleting that transaction, the recalculated balance SHALL be reduced by exactly that transaction's amount.

**Validates: Requirements 4.3, 5.4**

### Property 7: Chart Data Aggregation

*For any* list of transactions, the chart data aggregation function SHALL group and sum amounts by category, with each category total equaling the sum of its constituent transaction amounts.

**Validates: Requirements 6.5, 6.6**

### Property 8: Storage Serialization Round Trip

*For any* valid transaction object, serializing it to JSON storage format and then deserializing SHALL produce a transaction object with equivalent values for all fields.

**Validates: Requirements 8.1, 8.2, 8.4**

---
## Error Handling

### Validation Error Handling

**Validation Failure Flow**:
```javascript
// On form submission
form.addEventListener('submit', (e) => {
  e.preventDefault()
  
  const formData = getFormData()
  const validation = validateForm(formData)
  
  if (!validation.isValid) {
    // Display errors for each failed field
    Object.entries(validation.errors).forEach(([field, message]) => {
      displayFieldError(field, message)
    })
    return // Stop processing
  }
  
  // Proceed with valid data
  handleValidTransaction(formData)
})

function displayFieldError(fieldName, message) {
  const errorEl = document.getElementById(`${fieldName}Error`)
  errorEl.textContent = message
  errorEl.style.display = 'block'
}
```

### Storage Error Handling

**LocalStorage Unavailable**:
```javascript
function initStorageManager() {
  try {
    const test = '__test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
  } catch (e) {
    appState.isStorageAvailable = false
    showStorageWarning()
    // Application continues with in-memory storage
  }
}

function showStorageWarning() {
  const warning = document.createElement('div')
  warning.className = 'warning-message'
  warning.textContent = 'Note: Your data will not persist after closing the browser.'
  document.body.insertBefore(warning, document.body.firstChild)
}
```

**Storage Quota Exceeded**:
```javascript
function saveTransactions(transactions) {
  try {
    localStorage.setItem('expenses', JSON.stringify(data))
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      showStorageLimitWarning()
      // Continue with in-memory storage
    }
  }
}
```

### UI Update Error Handling

**Chart Rendering Failures**:
```javascript
function renderChart(transactions) {
  try {
    if (transactions.length === 0) {
      hideChart()
      return
    }
    
    const ctx = document.getElementById('categoryChart').getContext('2d')
    if (chartInstance) chartInstance.destroy()
    
    chartInstance = new Chart(ctx, chartConfig)
  } catch (e) {
    console.error('Chart render failed:', e)
    showChartPlaceholder()
  }
}
```

---
## Responsive Design & UI/UX

### Responsive Breakpoints

```css
/* Mobile: 320px - 767px */
@media (max-width: 767px) {
  .app-container { display: flex; flex-direction: column; }
  .form-container { width: 100%; padding: 1rem; }
  .balance-card { margin: 1rem 0; }
  .list-container { height: 300px; overflow-y: auto; }
  .chart-container { width: 100%; margin-top: 2rem; }
}

/* Tablet: 768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  .app-container { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .form-container { grid-column: 1; padding: 1.5rem; }
  .balance-card { grid-column: 1; }
  .list-container { grid-column: 1; grid-row: 2; }
  .chart-container { grid-column: 2; grid-row: 1 / 3; }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .app-container { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 2rem; }
  .form-container { grid-column: 1; max-width: 400px; }
  .balance-card { grid-column: 1; }
  .chart-container { grid-column: 2; grid-row: 1 / 3; }
  .list-container { grid-column: 1 / 3; }
}
```

### Mobile-First Component Design

**Touch Targets**:
- Minimum 44x44px for all interactive elements
- 8px padding around delete buttons
- Minimum 16px font for labels

**Form Layout** (Mobile):
```css
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
}

input, select {
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  min-height: 44px;
}

.btn-delete {
  padding: 0.5rem;
  min-width: 44px;
  min-height: 44px;
}
```

### Color Scheme

**Light Theme**:
```css
:root {
  --primary-color: #5B21B6;      /* Purple */
  --success-color: #10B981;      /* Green */
  --warning-color: #F59E0B;      /* Amber */
  --danger-color: #EF4444;       /* Red */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F3F4F6;
  --text-dark: #1F2937;
  --text-light: #6B7280;
  --border-color: #E5E7EB;
  
  /* Category colors for chart */
  --category-food: #FF6B6B;
  --category-transport: #4ECDC4;
  --category-fun: #FFE66D;
}
```

**Dark Theme** (Optional):
```css
[data-theme="dark"] {
  --primary-color: #A78BFA;
  --bg-primary: #1F2937;
  --bg-secondary: #111827;
  --text-dark: #F3F4F6;
  --text-light: #D1D5DB;
  --border-color: #374151;
}
```

### Typography Scale

```css
/* Headings */
h1 {
  font-size: 1.875rem;  /* 30px */
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.5rem;    /* 24px */
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1.25rem;
}

h3 {
  font-size: 1.25rem;   /* 20px */
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 1rem;
}

/* Body */
body {
  font-size: 1rem;      /* 16px */
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.text-sm {
  font-size: 0.875rem;  /* 14px */
  line-height: 1.25;
}

.text-xs {
  font-size: 0.75rem;   /* 12px */
  line-height: 1;
}
```

### Accessibility Features

**Semantic HTML Structure**:
```html
<main role="main" class="app-container">
  <section aria-labelledby="form-heading">
    <h2 id="form-heading">Add Transaction</h2>
    <form><!-- form elements --></form>
  </section>
  
  <section aria-labelledby="balance-heading">
    <h2 id="balance-heading">Total Spending</h2>
    <div role="status" aria-live="polite"><!-- balance --></div>
  </section>
  
  <section aria-labelledby="list-heading">
    <h2 id="list-heading">Transactions</h2>
    <div role="list"><!-- transaction items --></div>
  </section>
</main>
```

**ARIA Labels**:
```javascript
// Form inputs
<input aria-label="Item name" aria-required="true" />
<input aria-label="Amount in Rupiah" aria-required="true" />
<select aria-label="Expense category" aria-required="true" />

// Live regions
<div role="alert" aria-live="assertive">
  <!-- Error messages -->
</div>

<div role="status" aria-live="polite">
  <!-- Status updates (balance, transaction added) -->
</div>
```

**Keyboard Navigation**:
```javascript
// Form submission on Enter
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    form.dispatchEvent(new Event('submit'))
  }
})

// Delete with keyboard
deleteBtn.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    deleteBtn.click()
  }
})
```

---
## Implementation Patterns

### Module Pattern for Encapsulation

```javascript
// Expense Manager Module
const ExpenseManager = (() => {
  
  // Private variables
  let transactions = []
  let chartInstance = null
  
  // Private functions
  const saveToStorage = (data) => {
    if (appState.isStorageAvailable) {
      localStorage.setItem('expenses', JSON.stringify(data))
    }
  }
  
  const validateInput = (formData) => {
    // validation logic
  }
  
  // Public API
  return {
    init: function() {
      loadFromStorage()
      attachEventListeners()
      render()
    },
    
    addTransaction: function(formData) {
      const validation = validateInput(formData)
      if (!validation.isValid) return validation
      
      const transaction = {
        id: generateId(),
        ...formData,
        timestamp: new Date().toISOString()
      }
      
      transactions.push(transaction)
      saveToStorage(transactions)
      this.render()
      
      return { isValid: true }
    },
    
    deleteTransaction: function(id) {
      transactions = transactions.filter(tx => tx.id !== id)
      saveToStorage(transactions)
      this.render()
    },
    
    render: function() {
      updateBalanceDisplay()
      renderTransactionList()
      renderChart()
    },
    
    getTransactions: function() {
      return [...transactions] // Return copy
    }
  }
})()
```

### DOM Element Caching

```javascript
// Cache frequently accessed DOM elements at initialization
const DOM = {
  form: null,
  itemNameInput: null,
  amountInput: null,
  categorySelect: null,
  transactionList: null,
  balanceDisplay: null,
  chartCanvas: null,
  errorMessages: {}
}

function cacheElements() {
  DOM.form = document.getElementById('expenseForm')
  DOM.itemNameInput = document.getElementById('itemName')
  DOM.amountInput = document.getElementById('amount')
  DOM.categorySelect = document.getElementById('category')
  DOM.transactionList = document.getElementById('transactionList')
  DOM.balanceDisplay = document.getElementById('balanceAmount')
  DOM.chartCanvas = document.getElementById('categoryChart')
  
  DOM.errorMessages = {
    itemName: document.getElementById('itemNameError'),
    amount: document.getElementById('amountError'),
    category: document.getElementById('categoryError')
  }
}

function init() {
  cacheElements()
  // ... rest of initialization
}
```

### Event Delegation Strategy

```javascript
// Single listener for all delete buttons instead of individual listeners
document.getElementById('transactionList').addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-delete')) {
    const transactionId = e.target.dataset.id
    ExpenseManager.deleteTransaction(transactionId)
  }
})

// Form submission (single listener)
DOM.form.addEventListener('submit', (e) => {
  e.preventDefault()
  
  const formData = {
    itemName: DOM.itemNameInput.value,
    amount: parseFloat(DOM.amountInput.value),
    category: DOM.categorySelect.value
  }
  
  const result = ExpenseManager.addTransaction(formData)
  
  if (result.isValid) {
    DOM.form.reset()
    clearErrors()
  }
})
```

### Utility Functions

```javascript
// Generate unique transaction ID
function generateId() {
  return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Format currency display
function formatCurrency(amount) {
  const num = parseFloat(amount)
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// Escape HTML to prevent XSS
function escapeHTML(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Debounce for performance-sensitive operations
function debounce(fn, delay) {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
```

---
## CSS Class Naming Convention (BEM Methodology)

```css
/* Block: Main component */
.expense-form { }
.balance-card { }
.transaction-list { }
.chart-container { }

/* Element: Part of a block */
.expense-form__group { }
.expense-form__label { }
.expense-form__input { }
.expense-form__select { }
.expense-form__button { }

.transaction-list__item { }
.transaction-list__name { }
.transaction-list__amount { }
.transaction-list__category { }
.transaction-list__delete { }

.balance-card__label { }
.balance-card__amount { }

/* Modifier: Variation of a block/element */
.expense-form__input--error { border-color: #EF4444; }
.expense-form__input--valid { border-color: #10B981; }

.transaction-list__item--pending { opacity: 0.6; }
.transaction-list__item--deleted { }

.balance-card--empty { }

/* Utility classes */
.btn { }
.btn--primary { }
.btn--secondary { }
.btn--small { }
.btn--delete { }

.badge { }
.badge--food { background-color: var(--category-food); }
.badge--transport { background-color: var(--category-transport); }
.badge--fun { background-color: var(--category-fun); }

.error-message { color: var(--danger-color); font-size: 0.75rem; }
.success-message { color: var(--success-color); }
.warning-message { color: var(--warning-color); }

.hidden { display: none; }
.sr-only { /* Screen reader only */ }
```

---
## Testing Strategy

### Unit Testing (Validation Logic)

**Test Framework**: Vitest or Jest

**Validation Tests**:
```javascript
describe('ValidationService', () => {
  
  describe('validateForm()', () => {
    // Property-based tests with fast-check
    test('should reject any whitespace-only item name', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.char(' ', '\t', '\n')),
          (whitespace) => {
            const result = validateForm({
              itemName: whitespace,
              amount: 50,
              category: 'Food'
            })
            expect(result.isValid).toBe(false)
            expect(result.errors.itemName).toBeDefined()
          }
        )
      )
    })
    
    // Property: amount validation
    test('should reject zero or negative amounts', () => {
      fc.assert(
        fc.property(
          fc.integer({ max: 0 }),
          (invalidAmount) => {
            const result = validateForm({
              itemName: 'test',
              amount: invalidAmount,
              category: 'Food'
            })
            expect(result.isValid).toBe(false)
          }
        )
      )
    })
    
    // Property: decimal places validation
    test('should reject amounts with >2 decimal places', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 1, max: 1000 }),
            fc.integer({ min: 100, max: 999 })
          ),
          ([whole, decimals]) => {
            const invalidAmount = parseFloat(`${whole}.${decimals}`)
            const result = validateForm({
              itemName: 'test',
              amount: invalidAmount,
              category: 'Food'
            })
            expect(result.isValid).toBe(false)
          }
        )
      )
    })
  })
  
  describe('isValidDecimalPlaces()', () => {
    // Example-based tests
    test('should accept valid amounts', () => {
      expect(isValidDecimalPlaces(25.50, 2)).toBe(true)
      expect(isValidDecimalPlaces(100.00, 2)).toBe(true)
      expect(isValidDecimalPlaces(0.99, 2)).toBe(true)
    })
  })
})
```

### Balance Calculation Tests (Property-Based)

```javascript
describe('BalanceCalculation', () => {
  
  // Property: Balance equals sum of all amounts
  test('balance should equal sum of transaction amounts', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            itemName: fc.string(),
            amount: fc.float({ min: 0.01, max: 10000, noNaN: true, noInfinity: true }),
            category: fc.constantFrom('Food', 'Transport', 'Fun'),
            timestamp: fc.string()
          })
        ),
        (transactions) => {
          const calculated = calculateBalance(transactions)
          const expected = transactions.reduce((sum, tx) => sum + tx.amount, 0)
          expect(calculated).toBeCloseTo(expected, 2)
        }
      )
    )
  })
  
  // Property: Deletion reduces balance by correct amount
  test('deleting transaction reduces balance by transaction amount', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            amount: fc.float({ min: 0.01, max: 10000, noNaN: true })
          })
        ),
        fc.integer({ min: 0 }),
        (transactions, indexToDelete) => {
          if (transactions.length === 0) return true
          
          const idx = indexToDelete % transactions.length
          const toDelete = transactions[idx]
          const remaining = transactions.filter((_, i) => i !== idx)
          
          const balanceBefore = calculateBalance(transactions)
          const balanceAfter = calculateBalance(remaining)
          
          expect(balanceBefore - balanceAfter).toBeCloseTo(toDelete.amount, 2)
        }
      )
    )
  })
})
```

### Chart Aggregation Tests (Property-Based)

```javascript
describe('ChartAggregation', () => {
  
  // Property: Category totals equal sum of constituent transactions
  test('category totals should sum correctly', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            amount: fc.float({ min: 0.01, max: 10000, noNaN: true }),
            category: fc.constantFrom('Food', 'Transport', 'Fun')
          })
        ),
        (transactions) => {
          const grouped = groupByCategory(transactions)
          
          // Verify each category total
          Object.entries(grouped).forEach(([category, total]) => {
            const categoryTransactions = transactions.filter(
              tx => tx.category === category
            )
            const expected = categoryTransactions.reduce(
              (sum, tx) => sum + tx.amount, 0
            )
            expect(total).toBeCloseTo(expected, 2)
          })
        }
      )
    )
  })
})
```

### Storage Tests (Round-Trip Property)

```javascript
describe('StorageManager', () => {
  
  // Property: Storage round-trip preserves data
  test('serialize and deserialize should preserve transaction data', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          itemName: fc.string({ minLength: 1 }),
          amount: fc.float({ min: 0.01, max: 10000, noNaN: true }),
          category: fc.constantFrom('Food', 'Transport', 'Fun'),
          timestamp: fc.string()
        }),
        (original) => {
          const serialized = JSON.stringify(original)
          const deserialized = JSON.parse(serialized)
          
          expect(deserialized.id).toBe(original.id)
          expect(deserialized.itemName).toBe(original.itemName)
          expect(parseFloat(deserialized.amount)).toBeCloseTo(original.amount, 2)
          expect(deserialized.category).toBe(original.category)
          expect(deserialized.timestamp).toBe(original.timestamp)
        }
      )
    )
  })
})
```

### Integration Tests

**UI Integration Tests** (Example-based):

```javascript
describe('UIIntegration', () => {
  
  test('adding transaction updates all components', () => {
    const initialBalance = 0
    
    // Add transaction
    const transaction = {
      itemName: 'Coffee',
      amount: 25.50,
      category: 'Food'
    }
    
    ExpenseManager.addTransaction(transaction)
    
    // Verify balance updated
    expect(DOM.balanceDisplay.textContent).toContain('25.50')
    
    // Verify list rendered
    const listItems = document.querySelectorAll('.transaction-list__item')
    expect(listItems.length).toBe(1)
    
    // Verify chart exists
    expect(chartInstance).toBeDefined()
  })
  
  test('deleting transaction updates all components', () => {
    // Setup with existing transaction
    const tx = ExpenseManager.addTransaction({...})
    
    const initialBalance = parseFloat(DOM.balanceDisplay.textContent)
    
    // Delete
    ExpenseManager.deleteTransaction(tx.id)
    
    // Verify balance updated
    const newBalance = parseFloat(DOM.balanceDisplay.textContent)
    expect(newBalance).toBeLessThan(initialBalance)
  })
  
  test('form validation displays appropriate errors', () => {
    // Submit invalid form
    DOM.itemNameInput.value = ''
    DOM.amountInput.value = '50'
    DOM.categorySelect.value = 'Food'
    
    DOM.form.dispatchEvent(new Event('submit'))
    
    // Verify error displayed
    expect(DOM.errorMessages.itemName.textContent).toContain('required')
  })
})
```

### Performance Tests

```javascript
describe('PerformanceTargets', () => {
  
  test('adding transaction completes within 500ms', () => {
    const transactions = generateManyTransactions(1000)
    
    const start = performance.now()
    ExpenseManager.addTransaction({
      itemName: 'Test',
      amount: 50,
      category: 'Food'
    })
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(500)
  })
  
  test('deleting transaction completes within 500ms', () => {
    const transactions = generateManyTransactions(1000)
    const toDelete = transactions[500]
    
    const start = performance.now()
    ExpenseManager.deleteTransaction(toDelete.id)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(500)
  })
  
  test('chart renders within 500ms', () => {
    const transactions = generateManyTransactions(500)
    
    const start = performance.now()
    renderChart(transactions)
    const duration = performance.now() - start
    
    expect(duration).toBeLessThan(500)
  })
})
```

---
## Optional Features Architecture

### Feature 1: Custom Categories

**Design Approach**: Extensible category dropdown with add functionality

**Storage Extension**:
```json
{
  "customCategories": ["Groceries", "Utilities", "Healthcare"],
  "allCategories": ["Food", "Transport", "Fun", "Groceries", "Utilities", "Healthcare"]
}
```

**Implementation**:
```javascript
const CategoryManager = (() => {
  const defaultCategories = ['Food', 'Transport', 'Fun']
  let customCategories = []
  
  return {
    addCustomCategory: function(name) {
      if (!customCategories.includes(name)) {
        customCategories.push(name)
        saveToStorage()
        updateCategoryDropdown()
      }
    },
    
    getAllCategories: function() {
      return [...defaultCategories, ...customCategories]
    },
    
    updateCategoryDropdown: function() {
      const select = document.getElementById('category')
      select.innerHTML = this.getAllCategories()
        .map(cat => `<option value="${cat}">${cat}</option>`)
        .join('')
    }
  }
})()
```

### Feature 2: Monthly Summary View

**Design Approach**: View-switching pattern with date filtering

**State Extension**:
```javascript
appState.currentView = 'dashboard' // or 'monthly'
appState.selectedMonth = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
```

**Implementation**:
```javascript
function filterTransactionsByMonth(transactions, yearMonth) {
  return transactions.filter(tx => {
    return tx.timestamp.startsWith(yearMonth)
  })
}

function renderMonthlyView() {
  const months = getMonthsWithTransactions()
  
  months.forEach(month => {
    const monthTransactions = filterTransactionsByMonth(transactions, month)
    const total = calculateBalance(monthTransactions)
    const categories = groupByCategory(monthTransactions)
    
    renderMonthCard(month, total, categories)
  })
}

function switchToMonth(yearMonth) {
  appState.selectedMonth = yearMonth
  appState.currentView = 'monthly'
  const filtered = filterTransactionsByMonth(transactions, yearMonth)
  renderTransactionList(filtered)
  renderChart(filtered)
}
```

### Feature 3: Transaction Sorting

**Design Approach**: Sort control with state persistence

**State Extension**:
```javascript
appState.currentSort = 'date' // 'date', 'amount-asc', 'amount-desc', 'category'
```

**Implementation**:
```javascript
function sortTransactions(transactions, sortType) {
  const copy = [...transactions]
  
  switch(sortType) {
    case 'date':
      return copy.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      )
    case 'amount-asc':
      return copy.sort((a, b) => a.amount - b.amount)
    case 'amount-desc':
      return copy.sort((a, b) => b.amount - a.amount)
    case 'category':
      return copy.sort((a, b) => a.category.localeCompare(b.category))
    default:
      return copy
  }
}

function setSortOrder(sortType) {
  appState.currentSort = sortType
  const sorted = sortTransactions(transactions, sortType)
  renderTransactionList(sorted)
  saveSortPreference(sortType)
}
```

### Feature 4: Spending Limit Alerts

**Design Approach**: Per-category limits with visual warning

**Storage Extension**:
```json
{
  "categoryLimits": {
    "Food": 500.00,
    "Transport": 200.00,
    "Fun": 100.00
  }
}
```

**Implementation**:
```javascript
function setCategoryLimit(category, limit) {
  appState.categoryLimits[category] = limit
  saveToStorage()
  checkLimits()
}

function checkLimits() {
  const categoryTotals = groupByCategory(transactions)
  
  Object.entries(categoryTotals).forEach(([category, total]) => {
    const limit = appState.categoryLimits[category]
    
    if (limit && total > limit) {
      const overage = total - limit
      highlightCategoryWarning(category, overage)
    } else {
      removeCategoryWarning(category)
    }
  })
}

function highlightCategoryWarning(category, overage) {
  const categoryRows = document.querySelectorAll(
    `[data-category="${category}"]`
  )
  
  categoryRows.forEach(row => {
    row.classList.add('warning')
    row.setAttribute('data-overage', formatCurrency(overage))
  })
  
  showOverageAlert(category, overage)
}
```

### Feature 5: Dark/Light Mode Toggle

**Design Approach**: Theme switching with persistence

**CSS Implementation**:
```css
:root {
  --bg-color: #FFFFFF;
  --text-color: #1F2937;
  --border-color: #E5E7EB;
}

[data-theme="dark"] {
  --bg-color: #1F2937;
  --text-color: #F3F4F6;
  --border-color: #374151;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
}
```

**JavaScript Implementation**:
```javascript
const ThemeManager = (() => {
  const STORAGE_KEY = 'theme-preference'
  
  return {
    toggleTheme: function() {
      const current = this.getCurrentTheme()
      const newTheme = current === 'light' ? 'dark' : 'light'
      this.setTheme(newTheme)
    },
    
    getCurrentTheme: function() {
      return document.documentElement.getAttribute('data-theme') || 'light'
    },
    
    setTheme: function(theme) {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem(STORAGE_KEY, theme)
    },
    
    loadPreference: function() {
      const saved = localStorage.getItem(STORAGE_KEY)
      const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? 'dark' 
        : 'light'
      const theme = saved || preferred
      this.setTheme(theme)
    }
  }
})()
```

---
## File Structure and Main Entry Point

### HTML Structure (index.html)

```html
<!DOCTYPE html>
<html lang="id" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Track daily expenses and visualize spending">
  <title>Expense & Budget Visualizer</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app" class="app">
    <header class="app-header">
      <h1>Expense & Budget Visualizer</h1>
      <button id="themeToggle" class="theme-toggle" aria-label="Toggle theme">🌙</button>
    </header>
    
    <main role="main" class="app-container">
      <!-- Form Section -->
      <section class="form-section">
        <div class="form-container">
          <h2>Add Transaction</h2>
          <form id="expenseForm" class="expense-form">
            <div class="form-group">
              <label for="itemName">Item Name *</label>
              <input 
                type="text" 
                id="itemName" 
                name="itemName" 
                required
                aria-label="Item name"
              >
              <span class="error-message" id="itemNameError" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label for="amount">Amount (Rp) *</label>
              <input 
                type="number" 
                id="amount" 
                name="amount" 
                placeholder="0.00" 
                step="0.01"
                required
                aria-label="Amount in Rupiah"
              >
              <span class="error-message" id="amountError" role="alert"></span>
            </div>
            
            <div class="form-group">
              <label for="category">Category *</label>
              <select 
                id="category" 
                name="category" 
                required
                aria-label="Expense category"
              >
                <option value="">-- Select Category --</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Fun">Fun</option>
              </select>
              <span class="error-message" id="categoryError" role="alert"></span>
            </div>
            
            <button type="submit" class="btn btn-primary">Add Expense</button>
          </form>
        </div>
      </section>
      
      <!-- Balance Section -->
      <section class="balance-section">
        <div class="balance-container">
          <h2>Total Spent</h2>
          <div class="balance-card">
            <div id="balanceAmount" class="balance-amount" role="status" aria-live="polite">
              Rp 0.00
            </div>
          </div>
        </div>
      </section>
      
      <!-- Chart Section -->
      <section class="chart-section">
        <div class="chart-container">
          <h2>Spending Distribution</h2>
          <div class="chart-wrapper">
            <canvas id="categoryChart"></canvas>
            <div id="chartPlaceholder" class="chart-placeholder">
              Add transactions to see spending distribution
            </div>
          </div>
        </div>
      </section>
      
      <!-- List Section -->
      <section class="list-section">
        <div class="list-container">
          <h2>Transaction History</h2>
          <div id="transactionList" class="transaction-list" role="list"></div>
          <div id="emptyState" class="empty-state" role="status">
            No transactions yet. Start by adding one above.
          </div>
        </div>
      </section>
    </main>
    
    <!-- Storage Warning -->
    <div id="storageWarning" class="warning-banner hidden" role="alert">
      Your data will not persist after closing the browser.
    </div>
  </div>
  
  <!-- Chart.js Library -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
  
  <!-- Application -->
  <script src="js/app.js"></script>
</body>
</html>
```

### Application Bootstrap (js/app.js - Main Flow)

```javascript
/*
 * Expense & Budget Visualizer
 * Main application file - single file architecture
 * 
 * Features:
 * - Form input with validation
 * - Transaction list management
 * - Balance calculation
 * - Chart visualization with Chart.js
 * - LocalStorage persistence
 * - Responsive design
 * - Dark mode support (optional)
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'expenses'
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun']
const CATEGORY_COLORS = {
  Food: '#FF6B6B',
  Transport: '#4ECDC4',
  Fun: '#FFE66D'
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const appState = {
  transactions: [],
  customCategories: [],
  categoryLimits: {},
  theme: 'light',
  currentSort: 'date',
  isStorageAvailable: true
}

// ============================================================================
// DOM CACHE
// ============================================================================

const DOM = {
  form: null,
  inputs: {},
  errors: {},
  transactionList: null,
  balanceDisplay: null,
  chartCanvas: null,
  chartPlaceholder: null,
  emptyState: null,
  storageWarning: null,
  themeToggle: null
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initApp() {
  cacheElements()
  checkStorage()
  loadFromStorage()
  attachEventListeners()
  render()
  
  // Optional: Load theme preference
  if (localStorage.getItem('theme')) {
    setTheme(localStorage.getItem('theme'))
  }
}

function cacheElements() {
  DOM.form = document.getElementById('expenseForm')
  DOM.inputs = {
    itemName: document.getElementById('itemName'),
    amount: document.getElementById('amount'),
    category: document.getElementById('category')
  }
  DOM.errors = {
    itemName: document.getElementById('itemNameError'),
    amount: document.getElementById('amountError'),
    category: document.getElementById('categoryError')
  }
  DOM.transactionList = document.getElementById('transactionList')
  DOM.balanceDisplay = document.getElementById('balanceAmount')
  DOM.chartCanvas = document.getElementById('categoryChart')
  DOM.chartPlaceholder = document.getElementById('chartPlaceholder')
  DOM.emptyState = document.getElementById('emptyState')
  DOM.storageWarning = document.getElementById('storageWarning')
  DOM.themeToggle = document.getElementById('themeToggle')
}

// ============================================================================
// VALIDATION SERVICE
// ============================================================================

function validateForm(formData) {
  const errors = {}
  
  // Validate item name
  if (!formData.itemName || formData.itemName.trim() === '') {
    errors.itemName = 'Item name is required'
  }
  
  // Validate amount
  if (formData.amount === null || formData.amount === undefined || formData.amount === '') {
    errors.amount = 'Amount is required'
  } else if (formData.amount <= 0) {
    errors.amount = 'Amount must be greater than zero'
  } else if (!isValidDecimalPlaces(formData.amount, 2)) {
    errors.amount = 'Amount must have at most 2 decimal places'
  }
  
  // Validate category
  if (!formData.category) {
    errors.category = 'Category is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

function isValidDecimalPlaces(num, maxPlaces) {
  const decimalPart = (num.toString().split('.')[1] || '')
  return decimalPart.length <= maxPlaces
}

function displayErrors(errors) {
  clearAllErrors()
  
  Object.entries(errors).forEach(([field, message]) => {
    if (DOM.errors[field]) {
      DOM.errors[field].textContent = message
      DOM.errors[field].style.display = 'block'
    }
  })
}

function clearAllErrors() {
  Object.values(DOM.errors).forEach(errorEl => {
    errorEl.textContent = ''
    errorEl.style.display = 'none'
  })
}

// ============================================================================
// TRANSACTION MANAGEMENT
// ============================================================================

function getFormData() {
  return {
    itemName: DOM.inputs.itemName.value.trim(),
    amount: parseFloat(DOM.inputs.amount.value),
    category: DOM.inputs.category.value
  }
}

function createTransaction(formData) {
  return {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    itemName: formData.itemName,
    amount: parseFloat(formData.amount).toFixed(2),
    category: formData.category,
    timestamp: new Date().toISOString()
  }
}

function addTransaction() {
  const formData = getFormData()
  const validation = validateForm(formData)
  
  if (!validation.isValid) {
    displayErrors(validation.errors)
    return
  }
  
  clearAllErrors()
  
  const transaction = createTransaction(formData)
  appState.transactions.push(transaction)
  
  saveToStorage()
  DOM.form.reset()
  render()
}

function deleteTransaction(id) {
  appState.transactions = appState.transactions.filter(tx => tx.id !== id)
  saveToStorage()
  render()
}

// ============================================================================
// CALCULATION SERVICES
// ============================================================================

function calculateBalance(transactions) {
  return transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
}

function groupByCategory(transactions) {
  return transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + parseFloat(tx.amount)
    return acc
  }, {})
}

function sortTransactions(transactions, sortType) {
  const copy = [...transactions]
  
  switch(sortType) {
    case 'date':
      return copy.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    case 'amount-asc':
      return copy.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
    case 'amount-desc':
      return copy.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    case 'category':
      return copy.sort((a, b) => a.category.localeCompare(b.category))
    default:
      return copy
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(amount) {
  const num = parseFloat(amount)
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

function escapeHTML(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ============================================================================
// RENDERING
// ============================================================================

function renderTransactionList() {
  const listDiv = DOM.transactionList
  const sorted = sortTransactions(appState.transactions, appState.currentSort)
  
  if (sorted.length === 0) {
    listDiv.innerHTML = ''
    DOM.emptyState.style.display = 'block'
    return
  }
  
  DOM.emptyState.style.display = 'none'
  
  listDiv.innerHTML = sorted
    .map(tx => `
      <div class="transaction-row" data-id="${tx.id}" role="listitem">
        <div class="transaction-info">
          <div class="transaction-name">${escapeHTML(tx.itemName)}</div>
          <span class="category-badge badge-${tx.category.toLowerCase()}">
            ${escapeHTML(tx.category)}
          </span>
        </div>
        <div class="transaction-amount">Rp ${formatCurrency(tx.amount)}</div>
        <button 
          class="btn-delete" 
          data-id="${tx.id}"
          aria-label="Delete ${escapeHTML(tx.itemName)}"
          type="button"
        >
          ✕
        </button>
      </div>
    `)
    .join('')
}

function updateBalanceDisplay() {
  const balance = calculateBalance(appState.transactions)
  DOM.balanceDisplay.textContent = `Rp ${formatCurrency(balance)}`
}

let chartInstance = null

function renderChart() {
  if (appState.transactions.length === 0) {
    DOM.chartCanvas.style.display = 'none'
    DOM.chartPlaceholder.style.display = 'block'
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
    return
  }
  
  DOM.chartCanvas.style.display = 'block'
  DOM.chartPlaceholder.style.display = 'none'
  
  const grouped = groupByCategory(appState.transactions)
  const categories = Object.keys(grouped)
  const amounts = Object.values(grouped)
  const colors = categories.map(cat => CATEGORY_COLORS[cat] || '#999')
  
  const ctx = DOM.chartCanvas.getContext('2d')
  
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 12 },
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `Rp ${formatCurrency(value)} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

function render() {
  updateBalanceDisplay()
  renderTransactionList()
  renderChart()
}

// ============================================================================
// STORAGE MANAGEMENT
// ============================================================================

function checkStorage() {
  try {
    const test = '__test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    appState.isStorageAvailable = true
  } catch (e) {
    appState.isStorageAvailable = false
    DOM.storageWarning.classList.remove('hidden')
  }
}

function saveToStorage() {
  if (!appState.isStorageAvailable) return
  
  try {
    const data = {
      transactions: appState.transactions,
      customCategories: appState.customCategories,
      categoryLimits: appState.categoryLimits,
      theme: appState.theme
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      alert('Storage limit exceeded. Cannot save data.')
    }
  }
}

function loadFromStorage() {
  if (!appState.isStorageAvailable) return
  
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (!json) return
    
    const data = JSON.parse(json)
    if (Array.isArray(data.transactions)) {
      appState.transactions = data.transactions
      appState.customCategories = data.customCategories || []
      appState.categoryLimits = data.categoryLimits || {}
      appState.theme = data.theme || 'light'
    } else if (Array.isArray(data)) {
      // Legacy format: direct array
      appState.transactions = data
    }
  } catch (e) {
    console.error('Error loading transactions:', e)
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function attachEventListeners() {
  // Form submission
  DOM.form.addEventListener('submit', (e) => {
    e.preventDefault()
    addTransaction()
  })
  
  // Delete button delegation
  DOM.transactionList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const id = e.target.dataset.id
      deleteTransaction(id)
    }
  })
  
  // Optional: Theme toggle
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', () => {
      const newTheme = appState.theme === 'light' ? 'dark' : 'light'
      setTheme(newTheme)
      appState.theme = newTheme
      localStorage.setItem('theme', newTheme)
    })
  }
}

// ============================================================================
// THEME MANAGEMENT (OPTIONAL)
// ============================================================================

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  appState.theme = theme
  
  if (DOM.themeToggle) {
    DOM.themeToggle.textContent = theme === 'light' ? '🌙' : '☀️'
  }
}

// ============================================================================
// START APPLICATION
// ============================================================================

document.addEventListener('DOMContentLoaded', initApp)
```

---

## Code Quality Checklist

- ✅ Single `app.js` file with modular functions (modules via closures/namespacing)
- ✅ Clear function names describing purpose
- ✅ Comments for complex logic sections
- ✅ No external frameworks (vanilla JS only)
- ✅ Chart.js for visualization (single external dependency)
- ✅ LocalStorage for persistence with fallback
- ✅ Responsive CSS with mobile-first approach
- ✅ Accessibility: semantic HTML, ARIA labels, keyboard support
- ✅ Input validation and error handling
- ✅ Performance: debouncing, efficient DOM updates
- ✅ Security: XSS prevention with escapeHTML()

