'use client'

import { useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'

const PAGE = { width: 210, height: 297 }
const MARGIN_X = 8
const GRID_COLUMNS = 3
const GRID_ROWS = 5
const CELL_GAP = 0.5
const GRID_TOP = 35
const GRID_BOTTOM = 8
const GRID_WIDTH = PAGE.width - MARGIN_X * 2
const GRID_HEIGHT = PAGE.height - GRID_TOP - GRID_BOTTOM
const CELL_WIDTH = (GRID_WIDTH - CELL_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS
const CELL_HEIGHT = (GRID_HEIGHT - CELL_GAP * (GRID_ROWS - 1)) / GRID_ROWS

function truncate(text = '', max = 70) {
  const value = String(text).replace(/\s+/g, ' ').trim()
  return value.length > max ? value.slice(0, max - 1).trimEnd() + '...' : value
}

function getReference(product) {
  const id = String(product?.id || '').replace(/-/g, '').slice(0, 8).toUpperCase()
  return id ? 'EC-' + id : 'EC-CATALOG'
}

async function blobToDataUrl(blob) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function getOptimizedSource(src, width = 360, quality = 58) {
  if (!src) return null

  // Route every catalogue image through Next's image optimizer first.
  // This avoids downloading the original, potentially multi-megabyte upload.
  const optimizerUrl = '/_next/image?url=' + encodeURIComponent(src) + '&w=' + width + '&q=' + quality
  return optimizerUrl
}

async function fetchDataUrl(src) {
  if (!src) return null

  try {
    const optimizedSrc = getOptimizedSource(src)
    const response = await fetch(optimizedSrc, {
      mode: 'same-origin',
      cache: 'force-cache'
    })

    if (!response.ok) throw new Error('Optimized image request failed')
    return await blobToDataUrl(await response.blob())
  } catch (error) {
    // Fallback for assets the optimizer cannot process.
    try {
      const response = await fetch(src, { mode: 'cors', cache: 'force-cache' })
      if (!response.ok) throw new Error('Image request failed')
      return await blobToDataUrl(await response.blob())
    } catch (fallbackError) {
      return null
    }
  }
}

async function prepareImage(src, outputWidth = 360, outputHeight = 210) {
  const dataUrl = await fetchDataUrl(src)
  if (!dataUrl) return null

  return await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = outputWidth
        canvas.height = outputHeight
        const context = canvas.getContext('2d')
        if (!context) return resolve(null)

        context.fillStyle = '#f0ede7'
        context.fillRect(0, 0, outputWidth, outputHeight)

        const scale = Math.max(outputWidth / img.naturalWidth, outputHeight / img.naturalHeight)
        const width = img.naturalWidth * scale
        const height = img.naturalHeight * scale
        const x = (outputWidth - width) / 2
        const y = (outputHeight - height) / 2
        context.drawImage(img, x, y, width, height)

        resolve(canvas.toDataURL('image/jpeg', 0.64))
      } catch (error) {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

async function getLogo() {
  return await fetchDataUrl('/Empire Car Ac  Logo Design.jpg')
}

function drawHeader(doc, logo, pageNumber, totalPages, productCount) {
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE.width, PAGE.height, 'F')

  if (logo) {
    doc.addImage(logo, 'JPEG', MARGIN_X, 6, 13, 13)
  }

  doc.setTextColor(18, 18, 18)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('EMPIRE CAR A/C', logo ? MARGIN_X + 16 : MARGIN_X, 11)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.2)
  doc.setTextColor(100, 107, 115)
  doc.text('Car Air Conditioning Parts & Accessories', logo ? MARGIN_X + 16 : MARGIN_X, 16)

  doc.setDrawColor(11, 15, 19)
  doc.setLineWidth(0.35)
  doc.line(MARGIN_X, 21, PAGE.width - MARGIN_X, 21)

  doc.setTextColor(11, 15, 19)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text('PRODUCT CATALOGUE', PAGE.width - MARGIN_X, 10, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.7)
  doc.setTextColor(108, 114, 122)
  doc.text(
    'Active products | ' + productCount + ' items | Page ' + pageNumber + ' of ' + totalPages,
    PAGE.width - MARGIN_X,
    15,
    { align: 'right' }
  )
}

function drawFooter(doc) {
  doc.setDrawColor(220, 216, 208)
  doc.setLineWidth(0.25)
  doc.line(MARGIN_X, PAGE.height - 4.5, PAGE.width - MARGIN_X, PAGE.height - 4.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.8)
  doc.setTextColor(130, 134, 140)
  doc.text('Empire Car A/C | empirecarac.in | +91 77410 77666', MARGIN_X, PAGE.height - 1.8)
  doc.text('Generated from admin catalogue', PAGE.width - MARGIN_X, PAGE.height - 1.8, { align: 'right' })
}

function drawPlaceholder(doc, x, y, width, height) {
  doc.setFillColor(244, 241, 235)
  doc.rect(x, y, width, height, 'F')
  doc.setDrawColor(222, 218, 210)
  doc.rect(x, y, width, height)
  doc.setTextColor(154, 157, 162)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.text('IMAGE NOT AVAILABLE', x + width / 2, y + height / 2, { align: 'center' })
}

function drawProductCell(doc, product, imageData, x, y) {
  const imageHeight = 34.5
  const textTop = y + imageHeight
  const textHeight = CELL_HEIGHT - imageHeight

  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.22)
  doc.rect(x, y, CELL_WIDTH, CELL_HEIGHT)

  if (imageData) {
    doc.addImage(imageData, 'JPEG', x + 0.35, y + 0.35, CELL_WIDTH - 0.7, imageHeight - 0.7)
  } else {
    drawPlaceholder(doc, x + 0.35, y + 0.35, CELL_WIDTH - 0.7, imageHeight - 0.7)
  }

  const name = truncate(product?.name || 'Unnamed product', 74)
  const fitment = truncate(product?.car_model || product?.brand || product?.category?.name || '', 44)
  const code = getReference(product)
  const price = Number(product?.price || 0)
  const priceText = price > 0
    ? 'MRP (INR) ' + price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) + '/-'
    : 'MRP (INR) Contact'

  doc.setFillColor(251, 250, 247)
  doc.rect(x + 0.35, textTop + 0.15, CELL_WIDTH - 0.7, textHeight - 0.5, 'F')

  doc.setTextColor(32, 34, 36)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.25)

  const nameLines = doc.splitTextToSize(name, CELL_WIDTH - 4)
  const limitedName = nameLines.slice(0, 2)
  limitedName.forEach((line, index) => {
    doc.text(line, x + CELL_WIDTH / 2, textTop + 3.7 + index * 3.1, { align: 'center' })
  })

  if (fitment) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.2)
    doc.setTextColor(94, 99, 104)
    doc.text(fitment, x + CELL_WIDTH / 2, textTop + 10.0, { align: 'center' })
  }

  const infoY = y + CELL_HEIGHT - 4.9
  doc.setDrawColor(205, 201, 194)
  doc.setLineWidth(0.2)
  doc.line(x + 0.7, infoY - 2.8, x + CELL_WIDTH - 0.7, infoY - 2.8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.5)
  doc.setTextColor(28, 30, 33)
  doc.text(code, x + 1.4, infoY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.25)
  doc.text(priceText, x + CELL_WIDTH - 1.4, infoY, { align: 'right' })
}

export default function ProductCatalogPdfButton({ products = [], className = '' }) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')

  const activeProducts = useMemo(
    () => products.filter((product) => product?.is_active),
    [products]
  )

  async function generateCatalog() {
    if (busy || activeProducts.length === 0) return

    setBusy(true)
    setProgress('Optimizing product images...')

    try {
      const totalPages = Math.ceil(activeProducts.length / (GRID_COLUMNS * GRID_ROWS))
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
      const logo = await getLogo()

      for (let page = 0; page < totalPages; page += 1) {
        if (page > 0) doc.addPage()

        drawHeader(doc, logo, page + 1, totalPages, activeProducts.length)

        const pageProducts = activeProducts.slice(
          page * GRID_COLUMNS * GRID_ROWS,
          (page + 1) * GRID_COLUMNS * GRID_ROWS
        )

        const preparedImages = new Array(pageProducts.length)
        let nextIndex = 0

        const worker = async () => {
          while (true) {
            const index = nextIndex
            nextIndex += 1
            if (index >= pageProducts.length) return

            const product = pageProducts[index]

            setProgress(
              'Optimizing page ' + (page + 1) + '/' + totalPages +
              ' - image ' + (index + 1) + '/' + pageProducts.length
            )

            const primary =
              product?.images?.find((image) => image?.is_primary)?.image_url ||
              product?.images?.[0]?.image_url ||
              null

            preparedImages[index] = await prepareImage(primary, 360, 210)
          }
        }

        const workerCount = Math.min(6, pageProducts.length)
        await Promise.all(Array.from({ length: workerCount }, () => worker()))

        pageProducts.forEach((product, index) => {
          const row = Math.floor(index / GRID_COLUMNS)
          const column = index % GRID_COLUMNS
          const x = MARGIN_X + column * (CELL_WIDTH + CELL_GAP)
          const y = GRID_TOP + row * (CELL_HEIGHT + CELL_GAP)

          drawProductCell(doc, product, preparedImages[index], x, y)
        })

        drawFooter(doc)
      }

      const date = new Date().toISOString().slice(0, 10)
      doc.save('Empire-Car-AC-Product-Catalogue-' + date + '.pdf')
      setProgress('Catalogue downloaded')
    } catch (error) {
      console.error('Catalogue PDF generation failed:', error)
      setProgress('Could not generate PDF')
    } finally {
      setTimeout(() => {
        setBusy(false)
        setProgress('')
      }, 1800)
    }
  }

  return (
    <button
      type="button"
      onClick={generateCatalog}
      disabled={busy || activeProducts.length === 0}
      title={activeProducts.length ? 'Download a PDF catalogue of all active products' : 'No active products available'}
      className={
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55 ' +
        className
      }
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14a2 2 0 0 0 2-2v-4M3 15v4a2 2 0 0 0 2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{busy ? 'Building PDF...' : 'Download Catalogue PDF'}</span>
      {!busy && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">{activeProducts.length}</span>}
      {busy && progress && <span className="hidden max-w-[180px] truncate text-[10px] font-semibold text-slate-500 sm:inline">{progress}</span>}
    </button>
  )
}
