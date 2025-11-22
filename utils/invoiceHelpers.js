/**
 * Invoice Helper Functions
 * Utilities for invoice number generation and calculations
 */

/**
 * Generate invoice number in format: INV-YYYYMMDD-XXXX
 * @param {Array} existingInvoices - Array of existing invoices
 * @returns {string} Generated invoice number
 */
export function generateInvoiceNumber(existingInvoices = []) {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `INV-${year}${month}${day}`;

  // Find today's invoices
  const todayInvoices = existingInvoices.filter(inv => 
    inv.invoice_number?.startsWith(datePrefix)
  );

  // Get the highest sequence number for today
  let maxSequence = 0;
  todayInvoices.forEach(inv => {
    const parts = inv.invoice_number.split('-');
    if (parts.length === 3) {
      const sequence = parseInt(parts[2], 10);
      if (!isNaN(sequence) && sequence > maxSequence) {
        maxSequence = sequence;
      }
    }
  });

  // Increment and format
  const nextSequence = String(maxSequence + 1).padStart(4, '0');
  return `${datePrefix}-${nextSequence}`;
}

/**
 * Calculate line total for an invoice item
 * @param {number} quantity 
 * @param {number} unitPrice 
 * @returns {number}
 */
export function calculateLineTotal(quantity, unitPrice) {
  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(unitPrice) || 0;
  return qty * price;
}

/**
 * Calculate invoice subtotal from items
 * @param {Array} items - Array of invoice items
 * @returns {number}
 */
export function calculateSubtotal(items) {
  return items.reduce((sum, item) => {
    return sum + calculateLineTotal(item.quantity, item.unit_price);
  }, 0);
}

/**
 * Calculate tax amount
 * @param {number} subtotal 
 * @param {number} taxPercent 
 * @returns {number}
 */
export function calculateTaxAmount(subtotal, taxPercent) {
  const sub = parseFloat(subtotal) || 0;
  const tax = parseFloat(taxPercent) || 0;
  return (sub * tax) / 100;
}

/**
 * Calculate invoice total
 * @param {number} subtotal 
 * @param {number} taxAmount 
 * @returns {number}
 */
export function calculateTotal(subtotal, taxAmount) {
  const sub = parseFloat(subtotal) || 0;
  const tax = parseFloat(taxAmount) || 0;
  return sub + tax;
}

/**
 * Format currency value
 * @param {number} amount 
 * @returns {string}
 */
export function formatCurrency(amount) {
  const value = parseFloat(amount) || 0;
  return value.toFixed(2);
}

/**
 * Validate invoice data before saving
 * @param {object} invoiceData 
 * @returns {object} { valid: boolean, errors: Array }
 */
export function validateInvoice(invoiceData) {
  const errors = [];

  // Check customer name
  if (!invoiceData.customer_name?.trim()) {
    errors.push('Customer name is required');
  }

  // Check items
  if (!invoiceData.items || invoiceData.items.length === 0) {
    errors.push('At least one item is required');
  } else {
    invoiceData.items.forEach((item, index) => {
      if (!item.item_name?.trim()) {
        errors.push(`Item ${index + 1}: Name is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.unit_price === null || item.unit_price === undefined || item.unit_price < 0) {
        errors.push(`Item ${index + 1}: Unit price is required and cannot be negative`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format date for display
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format date for input field (YYYY-MM-DD)
 * @param {string|Date} date 
 * @returns {string}
 */
export function formatDateForInput(date) {
  if (!date) {
    date = new Date();
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
