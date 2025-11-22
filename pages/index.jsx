import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

/**
 * Home Page
 * Main landing page for the public site
 */
export default function Home() {
  return (
    <>
      <Head>
        <title>Empire Spare Parts - Quality Automotive Parts & Accessories</title>
        <meta name="description" content="Empire Spare Parts - Your trusted source for quality automotive spare parts. Browse our extensive catalogue of genuine parts for all car models. Contact us for competitive pricing." />
        <meta name="keywords" content="spare parts, automotive parts, car parts, auto accessories, genuine parts, car spare parts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Empire Spare Parts - Quality Automotive Parts" />
        <meta property="og:description" content="Your trusted source for quality automotive spare parts for all car models" />
        <meta property="og:url" content="https://yoursite.com" />
        <meta property="og:site_name" content="Empire Spare Parts" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Empire Spare Parts - Quality Automotive Parts" />
        <meta name="twitter:description" content="Your trusted source for quality automotive spare parts" />
        
        <link rel="canonical" href="https://yoursite.com" />
      </Head>

      <Navbar />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 sm:py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              Empire Spare Parts
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Your trusted source for quality automotive spare parts. 
              Browse our extensive catalogue and contact us for pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-center">
                Browse Products
              </Link>
              <Link href="/contact" className="btn-primary border-2 border-white bg-transparent hover:bg-white hover:text-primary-600 text-center">
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Parts</h3>
                <p className="text-gray-600">
                  All our spare parts are sourced from trusted manufacturers
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Service</h3>
                <p className="text-gray-600">
                  Quick response times and efficient order processing
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
                <p className="text-gray-600">
                  Our team is ready to help you find the right parts
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-100">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Ready to Find Your Parts?</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Browse our catalogue or get in touch with us directly
            </p>
            <Link href="/products" className="btn-primary inline-block">
              View All Products
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
