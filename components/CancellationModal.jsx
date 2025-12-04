import { useState } from 'react'

export default function CancellationModal({ order, userType, onClose, onConfirm }) {
  const [reason, setReason] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim() && userType === 'admin') {
      alert('Please provide a cancellation reason')
      return
    }
    onConfirm(reason)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-red-600">Cancel Order</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">
                Are you sure you want to cancel this order?
              </p>
              <p className="text-xs text-red-700">
                This action cannot be undone. The customer will be notified.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">
              <strong>Order:</strong> {order.order_number}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Status:</strong> {order.status}
            </p>
            {order.admin_total > 0 && (
              <p className="text-sm text-gray-700">
                <strong>Amount:</strong> ₹{order.admin_total.toLocaleString()}
              </p>
            )}
          </div>

          {/* Cancellation Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason {userType === 'admin' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field resize-none"
              rows="4"
              placeholder={userType === 'admin' 
                ? "e.g., Out of stock, Customer requested, Pricing issue..." 
                : "Optional: Let us know why you're cancelling (optional)"}
              required={userType === 'admin'}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Keep Order
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all font-semibold shadow-md"
            >
              Cancel Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
