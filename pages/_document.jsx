import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Custom Document Component
 * Used to augment the application's <html> and <body> tags
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
