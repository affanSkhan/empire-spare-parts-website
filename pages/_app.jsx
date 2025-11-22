import '@/styles/globals.css'

/**
 * Main App Component
 * This wraps all pages in the application
 */
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
