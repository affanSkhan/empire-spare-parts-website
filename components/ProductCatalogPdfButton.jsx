'use client'

import { useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'

const PAGE = { width: 210, height: 297 }
const MARGIN_X = 8
const GRID_COLUMNS = 3
const GRID_ROWS = 5
const CELL_GAP = 0.5
const GRID_TOP = 35
const GRID_BOTTOM = 21
const GRID_WIDTH = PAGE.width - MARGIN_X * 2
const GRID_HEIGHT = PAGE.height - GRID_TOP - GRID_BOTTOM
const CELL_WIDTH = (GRID_WIDTH - CELL_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS
const CELL_HEIGHT = (GRID_HEIGHT - CELL_GAP * (GRID_ROWS - 1)) / GRID_ROWS

const BUSINESS = {
  name: 'Empire Car A/C',
  phone: '+91 77410 77666',
  whatsapp: '+91 77410 77666',
  email: 'Empirecarac@gmail.com',
  address: 'Shop Number 19, Usmaniya Masjid Complex, Bus Stand Road, Amravati, Maharashtra 444601',
  website: 'www.empirecarac.in'
}

const DEFAULT_SETTINGS = {
  categoryId: 'all',
  categoryName: 'All Categories',
  priceMode: 'show',
  showMrp: true,
  showSellingPrice: true,
  showDiscount: true,
  showGst: true,
  gstMode: 'inclusive',
  gstRate: 0,
  customDiscount: true,
  customDiscountPercent: 0,
  customQuantity: true,
  customQuantityValue: 1,
  sendAfterDownload: 'none'
}

function truncate(text = '', max = 70) {
  const value = String(text).replace(/\s+/g, ' ').trim()
  return value.length > max ? value.slice(0, max - 1).trimEnd() + '...' : value
}

function formatCurrency(amount) {
  const value = Number(amount || 0)
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function formatPdfDate(date = new Date()) {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function sanitizeFilename(value) {
  return String(value || 'all-categories')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .toLowerCase() || 'all-categories'
}

function getCatalogueFingerprint(products) {
  return products
    .map((product) => [
      product?.id,
      product?.updated_at,
      product?.name,
      product?.price,
      product?.brand,
      product?.car_model,
      product?.category?.name,
      product?.images?.find((image) => image?.is_primary)?.image_url || product?.images?.[0]?.image_url || ''
    ].join('|'))
    .join('||')
}

const PDF_CACHE_NAME = 'empire-catalogue-pdf-v3-custom-hq'
const PDF_CACHE_VERSION = 3
const PDF_STORE = 'pdfs'
const IMAGE_STORE = 'images'

function openPdfCacheDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(PDF_CACHE_NAME, PDF_CACHE_VERSION)

      request.onupgradeneeded = () => {
        const db = request.result

        if (!db.objectStoreNames.contains(PDF_STORE)) {
          db.createObjectStore(PDF_STORE)
        }

        if (!db.objectStoreNames.contains(IMAGE_STORE)) {
          db.createObjectStore(IMAGE_STORE)
        }
      }

      request.onsuccess = () => {
        const db = request.result

        if (!db.objectStoreNames.contains(PDF_STORE) || !db.objectStoreNames.contains(IMAGE_STORE)) {
          db.close()
          resolve(null)
          return
        }

        db.onversionchange = () => db.close()
        resolve(db)
      }

      request.onerror = () => resolve(null)
      request.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function readCachedImage(key) {
  const db = await openPdfCacheDb()
  if (!db) return null

  try {
    return await new Promise((resolve) => {
      const tx = db.transaction(IMAGE_STORE, 'readonly')
      const request = tx.objectStore(IMAGE_STORE).get(key)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
      tx.oncomplete = () => db.close()
      tx.onerror = () => {
        try { db.close() } catch {}
        resolve(null)
      }
      tx.onabort = () => {
        try { db.close() } catch {}
        resolve(null)
      }
    })
  } catch {
    try { db.close() } catch {}
    return null
  }
}

async function writeCachedImage(key, dataUrl) {
  if (!dataUrl) return

  const db = await openPdfCacheDb()
  if (!db) return

  try {
    const tx = db.transaction(IMAGE_STORE, 'readwrite')
    tx.objectStore(IMAGE_STORE).put(dataUrl, key)

    await new Promise((resolve) => {
      tx.oncomplete = resolve
      tx.onerror = resolve
      tx.onabort = resolve
    })
  } catch {
    // Optional browser cache. Never block PDF generation.
  } finally {
    try { db.close() } catch {}
  }
}

async function readPdfCache(key) {
  const db = await openPdfCacheDb()
  if (!db) return null

  try {
    return await new Promise((resolve) => {
      const tx = db.transaction(PDF_STORE, 'readonly')
      const request = tx.objectStore(PDF_STORE).get(key)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => resolve(null)
      tx.oncomplete = () => db.close()
      tx.onerror = () => {
        try { db.close() } catch {}
        resolve(null)
      }
      tx.onabort = () => {
        try { db.close() } catch {}
        resolve(null)
      }
    })
  } catch {
    try { db.close() } catch {}
    return null
  }
}

async function writePdfCache(key, blob) {
  if (!blob) return

  const db = await openPdfCacheDb()
  if (!db) return

  try {
    const tx = db.transaction(PDF_STORE, 'readwrite')
    tx.objectStore(PDF_STORE).put({
      blob,
      cachedAt: Date.now()
    }, key)

    await new Promise((resolve) => {
      tx.oncomplete = resolve
      tx.onerror = resolve
      tx.onabort = resolve
    })
  } catch {
    // Optional browser cache. Never block PDF generation.
  } finally {
    try { db.close() } catch {}
  }
}

function getReference(product) {
  const id = String(product?.id || '').replace(/-/g, '').slice(0, 8).toUpperCase()
  return id ? 'EC-' + id : 'EC-CATALOG'
}

function getOptimizedSource(src, width = 960, quality = 88) {
  if (!src) return null

  return '/_next/image?url=' + encodeURIComponent(src) + '&w=' + width + '&q=' + quality
}

function getDirectSupabaseTransform(src, width = 960, height = 640, quality = 88) {
  if (!src) return null

  try {
    const url = new URL(src)
    const marker = '/storage/v1/object/public/'
    const markerIndex = url.pathname.indexOf(marker)

    if (url.hostname.endsWith('.supabase.co') && markerIndex !== -1) {
      const objectPath = url.pathname.slice(markerIndex + marker.length)
      return (
        url.origin +
        '/storage/v1/render/image/public/' +
        objectPath +
        '?width=' + width +
        '&height=' + height +
        '&resize=contain' +
        '&quality=' + quality +
        '&format=origin'
      )
    }
  } catch {
    // Fall through to Next optimizer / original.
  }

  return null
}

async function blobToDataUrl(blob) {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function getImageFormat(dataUrl) {
  if (String(dataUrl).startsWith('data:image/png')) return 'PNG'
  return 'JPEG'
}

async function fetchDataUrl(src) {
  if (!src) return null

  const cacheKey = 'img-hq-960x640-q88-v3-' + src
  const cached = await readCachedImage(cacheKey)
  if (cached) return cached

  const candidates = [
    getDirectSupabaseTransform(src, 960, 640, 88),
    getOptimizedSource(src, 960, 88),
    src
  ].filter(Boolean)

  for (const candidate of candidates) {
    try {
      const isNextOptimizer = candidate.startsWith('/_next/image')
      const response = await fetch(candidate, {
        mode: candidate.startsWith('/') ? 'same-origin' : 'cors',
        cache: 'force-cache',
        headers: isNextOptimizer ? { Accept: 'image/jpeg,image/png;q=0.9,*/*;q=0.1' } : undefined
      })

      if (!response.ok) continue

      const blob = await response.blob()
      if (!blob.type.startsWith('image/')) continue
      if (blob.type === 'image/webp' || blob.type === 'image/avif') continue

      const dataUrl = await blobToDataUrl(blob)
      await writeCachedImage(cacheKey, dataUrl)
      return dataUrl
    } catch {
      // Try the next source.
    }
  }

  return null
}

async function prepareImage(src) {
  return await fetchDataUrl(src)
}

async function getLogo() {
  return await fetchDataUrl('/Empire Car Ac  Logo Design.jpg')
}

function drawWatermark(doc, text) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(232, 232, 232)

  for (let y = -45; y < PAGE.height + 70; y += 55) {
    for (let x = -55; x < PAGE.width + 70; x += 92) {
      doc.text(text, x, y, { angle: 32 })
    }
  }
}

function drawHeader(doc, logo, pageNumber, totalPages, productCount, categoryName, dateText) {
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, PAGE.width, PAGE.height, 'F')

  drawWatermark(doc, 'EMPIRE CAR A/C')

  if (logo) {
    doc.addImage(logo, getImageFormat(logo), MARGIN_X, 5.5, 12.5, 12.5)
  }

  doc.setTextColor(18, 18, 18)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15.5)
  doc.text(BUSINESS.name.toUpperCase(), logo ? MARGIN_X + 15.5 : MARGIN_X, 11)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(100, 107, 115)
  doc.text('Car Air Conditioning Parts & Accessories', logo ? MARGIN_X + 15.5 : MARGIN_X, 15.5)

  doc.setDrawColor(11, 15, 19)
  doc.setLineWidth(0.35)
  doc.line(MARGIN_X, 21, PAGE.width - MARGIN_X, 21)

  doc.setTextColor(11, 15, 19)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.2)
  doc.text('CUSTOM PRODUCT CATALOGUE', PAGE.width - MARGIN_X, 9.5, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.2)
  doc.setTextColor(108, 114, 122)
  doc.text(categoryName, PAGE.width - MARGIN_X, 14, { align: 'right' })
  doc.text(
    productCount + ' items  |  Page ' + pageNumber + ' of ' + totalPages + '  |  ' + dateText,
    PAGE.width - MARGIN_X,
    18,
    { align: 'right' }
  )
}

function drawFooter(doc, dateText) {
  doc.setDrawColor(216, 213, 207)
  doc.setLineWidth(0.25)
  doc.line(MARGIN_X, PAGE.height - 15.2, PAGE.width - MARGIN_X, PAGE.height - 15.2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.7)
  doc.setTextColor(72, 76, 80)
  doc.text(BUSINESS.name, MARGIN_X, PAGE.height - 11.8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.15)
  doc.setTextColor(102, 107, 113)
  doc.text(
    'Phone ' + BUSINESS.phone + '  |  WhatsApp ' + BUSINESS.whatsapp + '  |  Email ' + BUSINESS.email,
    MARGIN_X,
    PAGE.height - 8.4
  )
  doc.text(
    BUSINESS.address + '  |  ' + BUSINESS.website + '  |  Date ' + dateText,
    MARGIN_X,
    PAGE.height - 5.1
  )
}

function drawProductCell(doc, product, imageData, x, y, settings) {
  const imageHeight = 30.5
  const textTop = y + imageHeight
  const textHeight = CELL_HEIGHT - imageHeight

  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.22)
  doc.rect(x, y, CELL_WIDTH, CELL_HEIGHT)

  if (imageData) {
    doc.addImage(
      imageData,
      getImageFormat(imageData),
      x + 0.35,
      y + 0.35,
      CELL_WIDTH - 0.7,
      imageHeight - 0.7
    )
  } else {
    doc.setFillColor(244, 241, 235)
    doc.rect(x + 0.35, y + 0.35, CELL_WIDTH - 0.7, imageHeight - 0.7, 'F')
    doc.setDrawColor(222, 218, 210)
    doc.rect(x + 0.35, y + 0.35, CELL_WIDTH - 0.7, imageHeight - 0.7)
    doc.setTextColor(154, 157, 162)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.text('IMAGE NOT AVAILABLE', x + CELL_WIDTH / 2, y + imageHeight / 2, { align: 'center' })
  }

  const basePrice = Number(product?.price || 0)
  const discountPercent = settings.customDiscount
    ? Math.max(0, Math.min(100, Number(settings.customDiscountPercent || 0)))
    : 0
  const sellingBeforeGst = Math.max(0, basePrice * (1 - discountPercent / 100))
  const gstRate = Math.max(0, Number(settings.gstRate || 0))
  const quantity = settings.customQuantity
    ? Math.max(1, Math.round(Number(settings.customQuantityValue || 1)))
    : 1

  let sellingPrice = sellingBeforeGst
  let gstAmount = 0
  let netBeforeGst = sellingBeforeGst

  if (settings.showGst && gstRate > 0) {
    if (settings.gstMode === 'inclusive') {
      netBeforeGst = sellingBeforeGst / (1 + gstRate / 100)
      gstAmount = sellingBeforeGst - netBeforeGst
      sellingPrice = sellingBeforeGst
    } else {
      gstAmount = sellingBeforeGst * gstRate / 100
      netBeforeGst = sellingBeforeGst
      sellingPrice = sellingBeforeGst + gstAmount
    }
  }

  const fitment = truncate(
    product?.car_model || product?.brand || product?.category?.name || '',
    40
  )
  const code = getReference(product)

  doc.setFillColor(251, 250, 247)
  doc.rect(x + 0.35, textTop + 0.15, CELL_WIDTH - 0.7, textHeight - 0.5, 'F')

  doc.setTextColor(32, 34, 36)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.05)

  const nameLines = doc.splitTextToSize(
    truncate(product?.name || 'Unnamed product', 72),
    CELL_WIDTH - 4
  ).slice(0, 2)

  nameLines.forEach((line, index) => {
    doc.text(line, x + CELL_WIDTH / 2, textTop + 3.7 + index * 2.7, { align: 'center' })
  })

  let cursorY = textTop + 9.3

  if (fitment) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(4.95)
    doc.setTextColor(94, 99, 104)
    doc.text(fitment, x + CELL_WIDTH / 2, cursorY, { align: 'center' })
    cursorY += 2.5
  }

  doc.setFontSize(4.75)
  doc.setTextColor(55, 58, 62)
  doc.setFont('helvetica', 'bold')
  doc.text(code, x + 1.4, cursorY)

  if (settings.customQuantity) {
    doc.setFont('helvetica', 'normal')
    doc.text('Qty ' + quantity, x + CELL_WIDTH - 1.4, cursorY, { align: 'right' })
  }

  cursorY += 2.8
  doc.setDrawColor(205, 201, 194)
  doc.setLineWidth(0.2)
  doc.line(x + 0.7, cursorY - 1.2, x + CELL_WIDTH - 0.7, cursorY - 1.2)

  if (settings.priceMode === 'show') {
    doc.setFontSize(4.75)
    doc.setFont('helvetica', 'normal')

    const left = x + 1.4
    const right = x + CELL_WIDTH - 1.4

    if (settings.showMrp) {
      doc.setTextColor(91, 94, 98)
      doc.text('MRP', left, cursorY + 2.8)
      doc.setTextColor(30, 33, 36)
      doc.text('Rs. ' + formatCurrency(basePrice), right, cursorY + 2.8, { align: 'right' })
      cursorY += 2.8
    }

    if (settings.showSellingPrice) {
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 91, 31)
      doc.text('Selling', left, cursorY + 2.8)
      doc.text('Rs. ' + formatCurrency(sellingPrice), right, cursorY + 2.8, { align: 'right' })
      cursorY += 2.8
      doc.setFont('helvetica', 'normal')
    }

    if (settings.showDiscount && discountPercent > 0) {
      doc.setTextColor(26, 130, 74)
      doc.text('Discount', left, cursorY + 2.8)
      doc.text(discountPercent + '%  |  -Rs. ' + formatCurrency(basePrice - sellingBeforeGst), right, cursorY + 2.8, { align: 'right' })
      cursorY += 2.8
    }

    if (settings.showGst) {
      doc.setTextColor(88, 91, 96)
      doc.text(
        settings.gstMode === 'inclusive'
          ? 'GST ' + gstRate + '% incl.'
          : 'GST ' + gstRate + '% excl.',
        left,
        cursorY + 2.8
      )
      if (gstRate > 0) {
        doc.text('Rs. ' + formatCurrency(gstAmount), right, cursorY + 2.8, { align: 'right' })
      }
      cursorY += 2.8
    }

    if (settings.customQuantity && quantity > 1) {
      doc.setTextColor(72, 76, 80)
      doc.text('Line total', left, cursorY + 2.8)
      doc.text('Rs. ' + formatCurrency(sellingPrice * quantity), right, cursorY + 2.8, { align: 'right' })
    }
  } else {
    doc.setTextColor(116, 120, 125)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(4.9)
    doc.text('Price available on request', x + CELL_WIDTH / 2, cursorY + 3.0, { align: 'center' })
  }
}

function getSettingsKey(settings) {
  return JSON.stringify({
    categoryId: settings.categoryId,
    categoryName: settings.categoryName,
    priceMode: settings.priceMode,
    showMrp: settings.showMrp,
    showSellingPrice: settings.showSellingPrice,
    showDiscount: settings.showDiscount,
    showGst: settings.showGst,
    gstMode: settings.gstMode,
    gstRate: settings.gstRate,
    customDiscount: settings.customDiscount,
    customDiscountPercent: settings.customDiscountPercent,
    customQuantity: settings.customQuantity,
    customQuantityValue: settings.customQuantityValue
  })
}

function getFilename(settings) {
  return 'Empire-Car-AC-' + sanitizeFilename(settings.categoryName) + '-' + new Date().toISOString().slice(0, 10) + '.pdf'
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

async function shareOrOpenAfterDownload(blob, filename, mode) {
  if (mode === 'none') return

  const message =
    'Hello, I am sharing the Empire Car A/C product catalogue (' +
    filename +
    '). Please find the requested parts and details attached.'

  const file = typeof File !== 'undefined'
    ? new File([blob], filename, { type: 'application/pdf' })
    : null

  try {
    if (
      mode === 'whatsapp' &&
      file &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: 'Empire Car A/C Catalogue',
        text: message
      })
      return
    }
  } catch (error) {
    if (error?.name === 'AbortError') return
  }

  if (mode === 'whatsapp') {
    const url = 'https://wa.me/?text=' + encodeURIComponent(message)
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }

  if (mode === 'email') {
    const url =
      'mailto:?subject=' +
      encodeURIComponent('Empire Car A/C Catalogue') +
      '&body=' +
      encodeURIComponent(message + '\n\nThe PDF was downloaded separately; please attach it to this email.')
    window.location.href = url
  }
}

function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <label className={'flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 transition ' + (
      disabled
        ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-55'
        : 'cursor-pointer border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
    )}>
      <span className="min-w-0">
        <span className="block text-sm font-black text-slate-900">{label}</span>
        {description && <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{description}</span>}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <span className="block h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-[#ff5b1f] peer-focus-visible:ring-4 peer-focus-visible:ring-[#ff5b1f]/15">
          <span className="block h-6 w-6 translate-x-0 rounded-full border-2 border-white bg-white shadow-sm transition peer-checked:translate-x-5" />
        </span>
      </span>
    </label>
  )
}

function SectionLabel({ children }) {
  return <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{children}</p>
}

export default function ProductCatalogPdfButton({ products = [], className = '' }) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [previewBlob, setPreviewBlob] = useState(null)
  const [previewFilename, setPreviewFilename] = useState('')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  const activeProducts = useMemo(
    () => products.filter((product) => product?.is_active),
    [products]
  )

  const categories = useMemo(() => {
    const map = new Map()

    activeProducts.forEach((product) => {
      const categoryId = product?.category?.id || product?.category_id || product?.category?.name
      const categoryName = product?.category?.name || 'Uncategorized'

      if (categoryId && !map.has(categoryId)) {
        map.set(categoryId, { id: categoryId, name: categoryName })
      }
    })

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [activeProducts])

  const selectedProducts = useMemo(() => {
    if (settings.categoryId === 'all') return activeProducts

    return activeProducts.filter((product) => {
      const categoryId = product?.category?.id || product?.category_id || product?.category?.name
      return String(categoryId) === String(settings.categoryId)
    })
  }, [activeProducts, settings.categoryId])

  function openCustomizer() {
    if (activeProducts.length === 0) return

    setSettings({
      ...DEFAULT_SETTINGS,
      categoryId: 'all',
      categoryName: 'All Categories'
    })
    setPreviewBlob(null)
    setPreviewFilename('')
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
    setOpen(true)
  }

  function closeCustomizer() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    setPreviewBlob(null)
    setPreviewFilename('')
    setOpen(false)
    setBusy(false)
    setProgress('')
  }

  async function generatePreview() {
    if (busy || selectedProducts.length === 0) return

    setBusy(true)

    try {
      const fingerprint = getCatalogueFingerprint(selectedProducts)
      const cacheKey =
        'catalogue-custom-' +
        fingerprint +
        '--' +
        getSettingsKey(settings)

      setProgress('Checking saved PDF cache...')
      const cached = await readPdfCache(cacheKey)

      if (cached?.blob) {
        if (previewUrl) URL.revokeObjectURL(previewUrl)

        const objectUrl = URL.createObjectURL(cached.blob)
        setPreviewBlob(cached.blob)
        setPreviewFilename(getFilename(settings))
        setPreviewUrl(objectUrl)
        setProgress('Ready from cache')
        setTimeout(() => setProgress(''), 900)
        setBusy(false)
        return
      }

      setProgress('Preparing high-quality images...')

      const imageCache = new Array(selectedProducts.length)
      let nextImageIndex = 0

      const worker = async () => {
        while (true) {
          const index = nextImageIndex
          nextImageIndex += 1

          if (index >= selectedProducts.length) return

          const product = selectedProducts[index]
          const primary =
            product?.images?.find((image) => image?.is_primary)?.image_url ||
            product?.images?.[0]?.image_url ||
            null

          imageCache[index] = await prepareImage(primary)

          if ((index + 1) % 6 === 0 || index === selectedProducts.length - 1) {
            setProgress('Optimizing images ' + (index + 1) + '/' + selectedProducts.length)
          }
        }
      }

      const workerCount = Math.min(16, selectedProducts.length)
      await Promise.all(Array.from({ length: workerCount }, () => worker()))

      setProgress('Building preview PDF...')

      const totalPages = Math.ceil(selectedProducts.length / (GRID_COLUMNS * GRID_ROWS))
      const dateText = formatPdfDate()

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      const logo = await getLogo()

      for (let page = 0; page < totalPages; page += 1) {
        if (page > 0) doc.addPage()

        drawHeader(
          doc,
          logo,
          page + 1,
          totalPages,
          selectedProducts.length,
          settings.categoryName,
          dateText
        )

        const pageStart = page * GRID_COLUMNS * GRID_ROWS
        const pageProducts = selectedProducts.slice(
          pageStart,
          pageStart + GRID_COLUMNS * GRID_ROWS
        )

        pageProducts.forEach((product, index) => {
          const row = Math.floor(index / GRID_COLUMNS)
          const column = index % GRID_COLUMNS
          const x = MARGIN_X + column * (CELL_WIDTH + CELL_GAP)
          const y = GRID_TOP + row * (CELL_HEIGHT + CELL_GAP)

          drawProductCell(
            doc,
            product,
            imageCache[pageStart + index],
            x,
            y,
            settings
          )
        })

        drawFooter(doc, dateText)
        drawWatermark(doc, 'EMPIRE CAR A/C')
      }

      const pdfBlob = doc.output('blob')
      await writePdfCache(cacheKey, pdfBlob)

      if (previewUrl) URL.revokeObjectURL(previewUrl)

      const objectUrl = URL.createObjectURL(pdfBlob)
      setPreviewBlob(pdfBlob)
      setPreviewFilename(getFilename(settings))
      setPreviewUrl(objectUrl)
      setProgress('Preview ready')
    } catch (error) {
      console.error('Catalogue PDF generation failed:', error)
      setProgress('Could not generate PDF')
    } finally {
      setBusy(false)
    }
  }

  async function handleDownload() {
    if (!previewBlob || !previewFilename) return

    downloadBlob(previewBlob, previewFilename)

    setProgress(
      settings.sendAfterDownload === 'none'
        ? 'PDF downloaded'
        : 'PDF downloaded — opening ' + settings.sendAfterDownload + '...'
    )

    window.setTimeout(() => {
      shareOrOpenAfterDownload(previewBlob, previewFilename, settings.sendAfterDownload)
    }, 250)

    window.setTimeout(() => setProgress(''), 1800)
  }

  function handleSettingChange(key, value) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value
    }))
    setPreviewBlob(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
    setPreviewFilename('')
  }

  return (
    <>
      <button
        type="button"
        onClick={openCustomizer}
        disabled={busy || activeProducts.length === 0}
        title={activeProducts.length ? 'Create a customized PDF from active products' : 'No active products available'}
        className={
          'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55 ' +
          className
        }
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14a2 2 0 0 0 2-2v-4M3 15v4a2 2 0 0 0 2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{busy ? 'Building PDF...' : 'Custom PDF'}</span>
        {!busy && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">{activeProducts.length}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 p-3 backdrop-blur-sm sm:p-5">
          <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-slate-50 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff5b1f]">PDF builder</p>
                <h2 className="mt-1 truncate text-xl font-black tracking-[-0.03em] text-slate-950 sm:text-2xl">Create custom catalogue</h2>
              </div>
              <button
                type="button"
                onClick={closeCustomizer}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950"
                aria-label="Close PDF builder"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid gap-0 lg:grid-cols-[410px_minmax(0,1fr)]">
                <aside className="border-b border-slate-200 bg-slate-50 p-4 sm:p-5 lg:border-b-0 lg:border-r">
                  <div className="space-y-5">
                    <div>
                      <SectionLabel>1. Product category</SectionLabel>
                      <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3">
                        <select
                          value={settings.categoryId}
                          onChange={(event) => {
                            const id = event.target.value
                            const category = categories.find((item) => String(item.id) === String(id))
                            handleSettingChange('categoryId', id)
                            setSettings((currentSettings) => ({
                              ...currentSettings,
                              categoryId: id,
                              categoryName: category?.name || 'All Categories'
                            }))
                          }}
                          className="input-field"
                        >
                          <option value="all">All categories ({activeProducts.length})</option>
                          {categories.map((category) => {
                            const count = activeProducts.filter((product) => {
                              const categoryId = product?.category?.id || product?.category_id || product?.category?.name
                              return String(categoryId) === String(category.id)
                            }).length

                            return (
                              <option key={category.id} value={category.id}>
                                {category.name} ({count})
                              </option>
                            )
                          })}
                        </select>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          {selectedProducts.length} active product{selectedProducts.length === 1 ? '' : 's'} will be included.
                        </p>
                      </div>
                    </div>

                    <div>
                      <SectionLabel>2. Pricing visibility</SectionLabel>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {[
                          ['show', 'Show price', 'Include pricing'],
                          ['hide', 'Hide price', 'No prices shown']
                        ].map(([value, label, description]) => (
                          <label
                            key={value}
                            className={'cursor-pointer rounded-2xl border p-3 transition ' + (
                              settings.priceMode === value
                                ? 'border-[#ff5b1f] bg-orange-50'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            )}
                          >
                            <input
                              type="radio"
                              name="priceMode"
                              value={value}
                              checked={settings.priceMode === value}
                              onChange={() => handleSettingChange('priceMode', value)}
                              className="sr-only"
                            />
                            <span className="block text-sm font-black text-slate-900">{label}</span>
                            <span className="mt-1 block text-[10px] font-semibold text-slate-500">{description}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <SectionLabel>3. Pricing controls</SectionLabel>
                      <div className="mt-2 grid gap-2">
                        <Toggle
                          checked={settings.showMrp}
                          onChange={(value) => handleSettingChange('showMrp', value)}
                          label="Show MRP"
                          description="Show the catalogue/base price."
                          disabled={settings.priceMode === 'hide'}
                        />
                        <Toggle
                          checked={settings.showSellingPrice}
                          onChange={(value) => handleSettingChange('showSellingPrice', value)}
                          label="Show selling price"
                          description="Show the calculated customer price."
                          disabled={settings.priceMode === 'hide'}
                        />
                        <Toggle
                          checked={settings.showDiscount}
                          onChange={(value) => handleSettingChange('showDiscount', value)}
                          label="Show discount"
                          description="Show discount percentage and amount."
                          disabled={settings.priceMode === 'hide'}
                        />
                        <Toggle
                          checked={settings.showGst}
                          onChange={(value) => handleSettingChange('showGst', value)}
                          label="Show GST"
                          description="Show GST mode and amount."
                          disabled={settings.priceMode === 'hide'}
                        />
                      </div>

                      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">GST mode</p>
                            <p className="mt-0.5 text-[10px] font-semibold text-slate-500">Controls whether GST is inside or added to the price.</p>
                          </div>
                          <select
                            value={settings.gstMode}
                            onChange={(event) => handleSettingChange('gstMode', event.target.value)}
                            disabled={settings.priceMode === 'hide' || !settings.showGst}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-800 outline-none"
                          >
                            <option value="inclusive">Inclusive</option>
                            <option value="exclusive">Exclusive</option>
                          </select>
                        </div>
                        <div className="mt-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">GST rate (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={settings.gstRate}
                            onChange={(event) => handleSettingChange('gstRate', Number(event.target.value))}
                            disabled={settings.priceMode === 'hide' || !settings.showGst}
                            className="input-field mt-1.5"
                            placeholder="0"
                          />
                          <p className="mt-1.5 text-[10px] leading-4 text-slate-500">Set the applicable GST rate for this particular PDF.</p>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                        <Toggle
                          checked={settings.customDiscount}
                          onChange={(value) => handleSettingChange('customDiscount', value)}
                          label="Custom discount"
                          description="Apply one discount to all included products."
                          disabled={settings.priceMode === 'hide'}
                        />
                        {settings.customDiscount && settings.priceMode === 'show' && (
                          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-orange-700">Discount (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={settings.customDiscountPercent}
                              onChange={(event) => handleSettingChange('customDiscountPercent', Number(event.target.value))}
                              className="input-field mt-1.5 border-orange-200 bg-white"
                              placeholder="0"
                            />
                          </div>
                        )}

                        <Toggle
                          checked={settings.customQuantity}
                          onChange={(value) => handleSettingChange('customQuantity', value)}
                          label="Custom quantity"
                          description="Add a quantity and line total to each included product."
                          disabled={settings.priceMode === 'hide'}
                        />
                        {settings.customQuantity && (
                          <div className="rounded-2xl border border-slate-200 bg-white p-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Quantity per product</label>
                            <input
                              type="number"
                              min="1"
                              max="9999"
                              step="1"
                              value={settings.customQuantityValue}
                              onChange={(event) => handleSettingChange('customQuantityValue', Number(event.target.value))}
                              className="input-field mt-1.5"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <SectionLabel>4. Business footer</SectionLabel>
                      <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-black text-slate-950">{BUSINESS.name}</p>
                        <div className="mt-2 space-y-1 text-[11px] leading-5 text-slate-500">
                          <p>Phone: {BUSINESS.phone}</p>
                          <p>WhatsApp: {BUSINESS.whatsapp}</p>
                          <p>Email: {BUSINESS.email}</p>
                          <p>Address: {BUSINESS.address}</p>
                          <p>Website: {BUSINESS.website}</p>
                          <p>Date: {formatPdfDate()}</p>
                        </div>
                        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold leading-4 text-slate-500">
                          This footer is printed on every PDF page.
                        </p>
                      </div>
                    </div>

                    <div>
                      <SectionLabel>5. Send after download</SectionLabel>
                      <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3">
                        <select
                          value={settings.sendAfterDownload}
                          onChange={(event) => handleSettingChange('sendAfterDownload', event.target.value)}
                          className="input-field"
                        >
                          <option value="none">Download only</option>
                          <option value="whatsapp">Open WhatsApp after download</option>
                          <option value="email">Open email after download</option>
                        </select>
                        <p className="mt-2 text-[10px] leading-4 text-slate-500">
                          On supported mobile browsers, WhatsApp can use the native share sheet with the PDF attached. Otherwise the message opens and the downloaded PDF can be attached manually.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#ff5b1f]/20 bg-orange-50 p-3">
                      <div className="flex gap-3">
                        <span className="mt-0.5 text-[#ff5b1f]">⌁</span>
                        <div>
                          <p className="text-sm font-black text-slate-900">Watermark enabled</p>
                          <p className="mt-1 text-[10px] leading-4 text-slate-600">
                            A repeated Empire Car A/C watermark is applied across every page to discourage reuse and make the document visibly branded.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                <section className="min-w-0 bg-slate-950 p-4 sm:p-5">
                  <div className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-slate-900">
                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Preview</p>
                        <p className="mt-1 text-sm font-black text-white">
                          {selectedProducts.length} product{selectedProducts.length === 1 ? '' : 's'} · {settings.categoryName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-white/40">High quality image source</p>
                        <p className="mt-0.5 text-[10px] font-black text-[#ff8e68]">960 × 640 · quality 88</p>
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 bg-slate-800">
                      {previewUrl ? (
                        <iframe
                          title="Empire Car A/C PDF preview"
                          src={previewUrl}
                          className="h-full min-h-[540px] w-full bg-white"
                        />
                      ) : (
                        <div className="flex min-h-[540px] items-center justify-center p-8 text-center">
                          <div>
                            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5 text-2xl text-[#ff8e68]">PDF</div>
                            <h3 className="mt-5 text-lg font-black text-white">Generate the preview first</h3>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
                              Choose the category and pricing settings, then generate a branded A4 preview before you download the document.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 border-t border-white/10 bg-slate-900 p-3 sm:p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-white/60">
                            {previewFilename || 'No preview generated yet'}
                          </p>
                          {progress && <p className="mt-1 text-[10px] font-semibold text-[#ff8e68]">{progress}</p>}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            onClick={generatePreview}
                            disabled={busy || selectedProducts.length === 0}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            {busy ? 'Building...' : previewUrl ? 'Regenerate preview' : 'Generate preview'}
                          </button>
                          <button
                            type="button"
                            onClick={handleDownload}
                            disabled={busy || !previewBlob}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ff5b1f] px-5 text-sm font-black text-white transition hover:bg-[#dc4310] disabled:cursor-not-allowed disabled:opacity-45"
                          >
                            Download PDF
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
