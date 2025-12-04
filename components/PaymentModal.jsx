import { useState } from 'react'

export default function PaymentModal({ order, onClose, onConfirm }) {
  const [paymentData, setPaymentData] = useState({
    method: 'upi',
    reference: '',
    amount: order.admin_total || 0,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onConfirm(paymentData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Payment Method */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={paymentData.method}
              onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
              className="input-field"
              required
            >
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online Payment Gateway</option>
            </select>
          </div>

          {/* Payment Reference */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Reference / Transaction ID
            </label>
            <input
              type="text"
              value={paymentData.reference}
              onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
              className="input-field"
              placeholder="e.g., UPI ID, Transaction ID"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Enter UPI transaction ID or payment reference number
            </p>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Received *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                className="input-field pl-8"
                required
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Order Total:</strong> ₹{(order.admin_total || 0).toLocaleString()}
            </p>
            <p className="text-sm text-green-800 mt-1">
              <strong>Amount to Receive:</strong> ₹{(paymentData.amount || 0).toLocaleString()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-md"
            >
              Confirm Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
