import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Logo from './Logo'

/**
 * Public Site Navigation Component
 * Displays navigation menu for public pages
 */
export default function Navbar() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if customer is logged in
    const checkAuth = () => {
      const customerId = localStorage.getItem('customer_id')
      setIsLoggedIn(!!customerId)
    }
    
    checkAuth()
    
    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', checkAuth)
    
    // Check on route changes
    router.events?.on('routeChangeComplete', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      router.events?.off('routeChangeComplete', checkAuth)
    }
  }, [router])

  return (
    <nav className="bg-gradient-to-r from-white via-slate-50 to-blue-50 shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo size="small" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Home
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-slate-600 transition-colors font-medium">
              Products
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-700 transition-colors font-medium">
              Contact
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link href="/customer/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link href="/customer/cart" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all text-sm font-semibold shadow-md">
                  My Cart
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Customer Login
                </Link>
                <Link href="/auth/signup" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all text-sm font-semibold shadow-md">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-100 bg-gradient-to-b from-transparent to-blue-50/50">
            <div className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 hover:bg-blue-50 rounded-lg">
                Home
              </Link>
              <Link href="/products" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 hover:bg-blue-50 rounded-lg">
                Products
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium px-4 py-2 hover:bg-cyan-50 rounded-lg">
                Contact
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link href="/customer/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 hover:bg-blue-50 rounded-lg">
                    Dashboard
                  </Link>
                  <Link href="/customer/cart" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all text-sm font-semibold shadow-md text-center mx-4">
                    My Cart
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-4 py-2 hover:bg-blue-50 rounded-lg">
                    Customer Login
                  </Link>
                  <Link href="/auth/signup" className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all text-sm font-semibold shadow-md text-center mx-4">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
