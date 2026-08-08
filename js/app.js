/*
 * Expense & Budget Visualizer
 * Main application file - single file architecture
 * 
 * Architecture Overview:
 * - Vanilla JavaScript (ES6+) with modular functions
 * - DOM manipulation with event delegation pattern
 * - Client-side storage via LocalStorage API
 * - Chart.js integration for visualization
 * - Mobile-first responsive design
 * 
 * Modules:
 * 1. Validation Service - Input validation and error handling
 * 2. Transaction Management - CRUD operations for transactions
 * 3. Calculation Services - Balance and aggregation logic
 * 4. Rendering - DOM updates and component rendering
 * 5. Storage Manager - LocalStorage persistence
 * 6. Event Handlers - User interaction management
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
// APPLICATION STATE
// ============================================================================

const appState = {
  transactions: [],           // Array of transaction objects
  customCategories: [],       // Optional: custom category names
  categoryLimits: {},         // Optional: spending limits per category
  theme: 'light',             // Current theme: 'light' or 'dark'
  currentSort: 'date',        // Current sort order
  isStorageAvailable: true    // Tracks LocalStorage availability
}

// ============================================================================
// DOM ELEMENT CACHE
// ============================================================================

const DOM = {
  // Form elements
  form: null,
  inputs: {
    itemName: null,
    amount: null,
    category: null
  },
  errors: {
    itemName: null,
    amount: null,
    category: null
  },
  
  // Display elements
  transactionList: null,
  balanceDisplay: null,
  chartCanvas: null,
  chartPlaceholder: null,
  emptyState: null,
  
  // Utilities
  storageWarning: null,
  themeToggle: null,
  appHeader: null
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application
 * Cache DOM elements, check storage, load data, attach listeners, and render
 */
function initApp() {
  cacheElements()
  checkStorage()
  loadFromStorage()
  attachEventListeners()
  render()
  
  // Load saved theme preference if available
  if (localStorage.getItem('theme')) {
    setTheme(localStorage.getItem('theme'))
  }
}

/**
 * Cache frequently accessed DOM elements to improve performance
 */
function cacheElements() {
  // Form elements
  DOM.form = document.getElementById('expenseForm')
  DOM.inputs.itemName = document.getElementById('itemName')
  DOM.inputs.amount = document.getElementById('amount')
  DOM.inputs.category = document.getElementById('category')
  
  // Error message elements
  DOM.errors.itemName = document.getElementById('itemNameError')
  DOM.errors.amount = document.getElementById('amountError')
  DOM.errors.category = document.getElementById('categoryError')
  
  // Display elements
  DOM.transactionList = document.getElementById('transactionList')
  DOM.balanceDisplay = document.getElementById('balanceAmount')
  DOM.chartCanvas = document.getElementById('categoryChart')
  DOM.chartPlaceholder = document.getElementById('chartPlaceholder')
  DOM.emptyState = document.getElementById('emptyState')
  
  // Utility elements
  DOM.storageWarning = document.getElementById('storageWarning')
  DOM.themeToggle = document.getElementById('themeToggle')
  DOM.appHeader = document.querySelector('.app-header')
}

// ============================================================================
// VALIDATION SERVICE
// ============================================================================

/**
 * Validate form input data
 * @param {Object} formData - Object with itemName, amount, category
 * @returns {Object} { isValid: boolean, errors: { fieldName: string } }
 */
function validateForm(formData) {
  const errors = {}
  
  // Validate Item Name
  // Requirement 2.1: Item name must not be empty
  // Requirement 2.4: Whitespace-only entries are treated as empty
  if (!formData.itemName || formData.itemName.trim() === '') {
    errors.itemName = 'Item name is required'
  }
  
  // Validate Amount
  // Requirement 1.5: Amount must be a positive number greater than zero
  // Requirement 1.7: Amount must have at most 2 decimal places
  if (formData.amount === null || formData.amount === undefined || formData.amount === '') {
    errors.amount = 'Amount is required'
  } else if (formData.amount <= 0) {
    errors.amount = 'Amount must be greater than zero'
  } else if (!isValidDecimalPlaces(formData.amount, 2)) {
    errors.amount = 'Amount must have at most 2 decimal places'
  }
  
  // Validate Category
  // Requirement 1.3: Category field must have a selected value
  if (!formData.category) {
    errors.category = 'Category is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: errors
  }
}

/**
 * Check if a number has valid decimal places
 * @param {number} num - The number to validate
 * @param {number} maxPlaces - Maximum allowed decimal places
 * @returns {boolean} True if valid, false otherwise
 */
function isValidDecimalPlaces(num, maxPlaces) {
  const decimalPart = (num.toString().split('.')[1] || '')
  return decimalPart.length <= maxPlaces
}

/**
 * Display validation error messages
 * @param {Object} errors - Object with field names and error messages
 */
function displayErrors(errors) {
  clearAllErrors()
  
  Object.entries(errors).forEach(([field, message]) => {
    if (DOM.errors[field]) {
      DOM.errors[field].textContent = message
      DOM.errors[field].style.display = 'block'
    }
  })
}

/**
 * Clear all error message displays
 */
function clearAllErrors() {
  Object.values(DOM.errors).forEach(errorEl => {
    errorEl.textContent = ''
    errorEl.style.display = 'none'
  })
}

// ============================================================================
// TRANSACTION MANAGEMENT
// ============================================================================

/**
 * Get form data from DOM elements
 * @returns {Object} Form data with trimmed item name
 */
function getFormData() {
  return {
    itemName: DOM.inputs.itemName.value.trim(),
    amount: parseFloat(DOM.inputs.amount.value),
    category: DOM.inputs.category.value
  }
}

/**
 * Create a new transaction object with unique ID
 * @param {Object} formData - Validated form data
 * @returns {Object} Transaction object with ID, timestamp, etc.
 */
function createTransaction(formData) {
  return {
    id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    itemName: formData.itemName,
    amount: parseFloat(formData.amount).toFixed(2),
    category: formData.category,
    timestamp: new Date().toISOString()
  }
}

/**
 * Handle form submission - validate, create, store, and render
 */
function addTransaction() {
  const formData = getFormData()
  const validation = validateForm(formData)
  
  // Show validation errors if form is invalid
  if (!validation.isValid) {
    displayErrors(validation.errors)
    return
  }
  
  // Requirement 1.4: If form is valid, clear error messages
  clearAllErrors()
  
  // Requirement 1.10: Add transaction to state
  const transaction = createTransaction(formData)
  appState.transactions.push(transaction)
  
  // Save to storage
  saveToStorage()
  
  // Requirement 1.9: Clear form fields after successful submission
  DOM.form.reset()
  
  // Update all UI components
  render()
}

/**
 * Delete a transaction by ID
 * @param {string} id - Transaction ID to delete
 */
function deleteTransaction(id) {
  // Requirement 4.2: Remove transaction from list
  appState.transactions = appState.transactions.filter(tx => tx.id !== id)
  
  // Requirement 4.5: Persist deletion to LocalStorage
  saveToStorage()
  
  // Requirement 4.3, 4.4: Update all components
  render()
}

// ============================================================================
// CALCULATION SERVICES
// ============================================================================

/**
 * Calculate total balance (sum of all transaction amounts)
 * @param {Array} transactions - Array of transaction objects
 * @returns {number} Sum of all transaction amounts
 */
function calculateBalance(transactions) {
  return transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
}

/**
 * Group transactions by category and sum amounts
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Object with category names as keys and totals as values
 */
function groupByCategory(transactions) {
  return transactions.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + parseFloat(tx.amount)
    return acc
  }, {})
}

/**
 * Sort transactions based on specified sort type
 * @param {Array} transactions - Array of transactions to sort
 * @param {string} sortType - Type of sort ('date', 'amount-asc', 'amount-desc', 'category')
 * @returns {Array} Sorted copy of transactions array
 */
function sortTransactions(transactions, sortType) {
  const copy = [...transactions]
  
  switch (sortType) {
    case 'date':
      // Most recent first (default)
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

/**
 * Format number as Indonesian currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  const num = parseFloat(amount)
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML text
 */
function escapeHTML(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// ============================================================================
// RENDERING
// ============================================================================

/**
 * Render transaction list component
 * Displays transactions in sorted order, most recent first
 * Shows empty state message when no transactions exist
 */
function renderTransactionList() {
  const listDiv = DOM.transactionList
  const sorted = sortTransactions(appState.transactions, appState.currentSort)
  
  // Requirement 3.3: Show empty state when no transactions
  if (sorted.length === 0) {
    listDiv.innerHTML = ''
    DOM.emptyState.style.display = 'block'
    return
  }
  
  // Hide empty state when transactions exist
  DOM.emptyState.style.display = 'none'
  
  // Requirement 3.4: Display transactions in order (most recent first)
  // Requirement 3.1, 3.2: Display itemName, amount, category, delete button
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

/**
 * Update balance display component
 * Requirement 5.1, 5.2: Show total spending in currency format
 * Requirement 5.5: Display "Rp 0.00" when no transactions
 */
function updateBalanceDisplay() {
  const balance = calculateBalance(appState.transactions)
  DOM.balanceDisplay.textContent = `Rp ${formatCurrency(balance)}`
}

// Chart instance cache - prevent memory leaks
let chartInstance = null

/**
 * Render pie chart visualization with Chart.js
 * Requirement 6.1, 6.2: Display pie chart with Chart.js
 * Requirement 6.3, 6.4: Assign distinct colors per category
 * Requirement 6.7: Show placeholder when no data
 * Requirement 6.8: Display percentages and amounts in legend
 */
function renderChart() {
  // Requirement 6.7: Show placeholder when no transactions
  if (appState.transactions.length === 0) {
    DOM.chartCanvas.style.display = 'none'
    DOM.chartPlaceholder.style.display = 'block'
    
    // Destroy previous chart instance to free memory
    if (chartInstance) {
      chartInstance.destroy()
      chartInstance = null
    }
    return
  }
  
  // Show chart, hide placeholder
  DOM.chartCanvas.style.display = 'block'
  DOM.chartPlaceholder.style.display = 'none'
  
  // Calculate data grouped by category
  const grouped = groupByCategory(appState.transactions)
  const categories = Object.keys(grouped)
  const amounts = Object.values(grouped)
  const colors = categories.map(cat => CATEGORY_COLORS[cat] || '#999')
  
  const ctx = DOM.chartCanvas.getContext('2d')
  
  // Destroy previous chart before creating new one
  if (chartInstance) {
    chartInstance.destroy()
  }
  
  // Create new chart instance
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
            padding: 15,
            generateLabels: (chart) => {
              const data = chart.data
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i]
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0)
                const percentage = ((value / total) * 100).toFixed(1)
                return {
                  text: `${label}: Rp ${formatCurrency(value)} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i
                }
              })
            }
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

/**
 * Master render function - updates all UI components
 * Called whenever state changes
 */
function render() {
  updateBalanceDisplay()
  renderTransactionList()
  renderChart()
}

// ============================================================================
// STORAGE MANAGEMENT
// ============================================================================

/**
 * Check if LocalStorage is available and accessible
 * Requirement 8.3: Handle storage unavailability gracefully
 */
function checkStorage() {
  try {
    const test = '__test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    appState.isStorageAvailable = true
  } catch (e) {
    // LocalStorage unavailable (quota exceeded, private mode, etc.)
    appState.isStorageAvailable = false
    // Requirement 8.5: Display warning message
    DOM.storageWarning.classList.remove('hidden')
  }
}

/**
 * Save transactions and app state to LocalStorage
 * Requirement 8.1: Save transaction with unique ID
 * Requirement 8.6: Use 'expenses' storage key
 */
function saveToStorage() {
  if (!appState.isStorageAvailable) {
    return
  }
  
  try {
    const data = {
      transactions: appState.transactions,
      customCategories: appState.customCategories,
      categoryLimits: appState.categoryLimits,
      theme: appState.theme
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // Requirement 8.7: Handle quota exceeded error
    if (e.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded')
      alert('Storage limit exceeded. Cannot save more data.')
    }
  }
}

/**
 * Load transactions from LocalStorage
 * Requirement 8.2, 8.4: Load all transactions from previous session
 */
function loadFromStorage() {
  if (!appState.isStorageAvailable) {
    return
  }
  
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (!json) {
      return
    }
    
    const data = JSON.parse(json)
    
    // Validate data structure
    if (Array.isArray(data.transactions)) {
      // New format with metadata
      appState.transactions = data.transactions
      appState.customCategories = data.customCategories || []
      appState.categoryLimits = data.categoryLimits || {}
      appState.theme = data.theme || 'light'
    } else if (Array.isArray(data)) {
      // Legacy format: direct array
      appState.transactions = data
    }
  } catch (e) {
    console.error('Error loading transactions from storage:', e)
  }
}

// ============================================================================
// THEME MANAGEMENT
// ============================================================================

/**
 * Set application theme (light or dark mode)
 * @param {string} theme - Theme name: 'light' or 'dark'
 */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  appState.theme = theme
  
  // Update theme toggle button icon
  if (DOM.themeToggle) {
    DOM.themeToggle.textContent = theme === 'light' ? '🌙' : '☀️'
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Attach all event listeners to DOM elements
 * Uses event delegation pattern for efficiency
 */
function attachEventListeners() {
  // Form submission
  // Requirement 1.2: Submit button handler with validation
  DOM.form.addEventListener('submit', (e) => {
    e.preventDefault()
    addTransaction()
  })
  
  // Delete button click - using event delegation
  // Requirement 4.1, 4.2: Delete handler for transaction rows
  DOM.transactionList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const id = e.target.dataset.id
      deleteTransaction(id)
    }
  })
  
  // Theme toggle button
  if (DOM.themeToggle) {
    DOM.themeToggle.addEventListener('click', () => {
      const newTheme = appState.theme === 'light' ? 'dark' : 'light'
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
    })
  }
}

// ============================================================================
// APPLICATION BOOTSTRAP
// ============================================================================

/**
 * Start the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', initApp)
