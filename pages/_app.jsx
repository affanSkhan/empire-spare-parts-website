import '@/styles/globals.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { isNativeApp, initNativePush } from '@/utils/nativePushNotifications'

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleError = (event) => {
      console.error('[Global Error]:', event.error)
      setHasError(true)
      setError(event.error)
      event.preventDefault()
    }

    const handleRejection = (event) => {
      console.error('[Unhandled Rejection]:', event.reason)
      event.preventDefault()
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  if (hasError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f13] p-6 text-white">
        <div className="max-w-md text-center">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff5b1f]">Empire Car A/C</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Something went wrong.</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">{error?.message || 'An unexpected error occurred.'}</p>
          <button onClick={() => window.location.reload()} className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-black text-[#0b0f13]">
            Reload site
          </button>
        </div>
      </div>
    )
  }

  return children
}

function MotionRuntime() {
  const router = useRouter()
  const [routeChanging, setRouteChanging] = useState(false)

  useEffect(() => {
    const start = () => setRouteChanging(true)
    const finish = () => window.setTimeout(() => setRouteChanging(false), 90)

    router.events.on('routeChangeStart', start)
    router.events.on('routeChangeComplete', finish)
    router.events.on('routeChangeError', finish)

    return () => {
      router.events.off('routeChangeStart', start)
      router.events.off('routeChangeComplete', finish)
      router.events.off('routeChangeError', finish)
    }
  }, [router.events])

  useEffect(() => {
    const setupMotion = () => {
      const elements = Array.from(document.querySelectorAll('.reveal, .clip-reveal, .image-reveal'))
      if (!elements.length) return

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0.14, rootMargin: '0px 0px -9% 0px' })

      elements.forEach((element) => observer.observe(element))

      const magneticElements = Array.from(document.querySelectorAll('.magnetic'))
      const cleanup = magneticElements.map((element) => {
        const move = (event) => {
          if (window.innerWidth < 900) return
          const rect = element.getBoundingClientRect()
          const x = (event.clientX - (rect.left + rect.width / 2)) * 0.08
          const y = (event.clientY - (rect.top + rect.height / 2)) * 0.08
          element.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'
        }
        const leave = () => {
          element.style.transform = 'translate3d(0,0,0)'
        }
        element.addEventListener('mousemove', move)
        element.addEventListener('mouseleave', leave)
        return () => {
          element.removeEventListener('mousemove', move)
          element.removeEventListener('mouseleave', leave)
        }
      })

      return () => {
        observer.disconnect()
        cleanup.forEach((fn) => fn())
      }
    }

    const timer = window.setTimeout(setupMotion, 40)
    return () => window.clearTimeout(timer)
  }, [router.asPath])

  return routeChanging ? <div className="route-curtain" aria-hidden="true" /> : null
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (isNativeApp()) {
      initNativePush()
      return
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error) => {
        console.error('[App] Service Worker registration failed:', error)
      })
    }
  }, [])

  return (
    <ErrorBoundary>
      <MotionRuntime />
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}
