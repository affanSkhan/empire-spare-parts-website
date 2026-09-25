const https = require('node:https')
const zlib = require('node:zlib')
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const REPO_TARBALL = 'https://codeload.github.com/affanSkhan/empire-spare-parts-website/tar.gz/refs/heads/main'
const root = process.cwd()

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'EmpireCarAC-VercelBuild/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchBuffer(res.headers.location))
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`GitHub archive request failed: ${res.statusCode}`))
      }

      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

function readTarString(buffer, start, length) {
  return buffer.subarray(start, start + length).toString('utf8').replace(/\0+$/, '')
}

function parseOctal(buffer, start, length) {
  const value = readTarString(buffer, start, length).trim()
  return value ? parseInt(value, 8) : 0
}

function extractTarGz(buffer) {
  const tar = zlib.gunzipSync(buffer)
  let offset = 0

  while (offset + 512 <= tar.length) {
    const name = readTarString(tar, offset, 100)
    if (!name) break

    const size = parseOctal(tar, offset + 124, 12)
    const typeflag = readTarString(tar, offset + 156, 1) || '0'
    const prefix = readTarString(tar, offset + 345, 155)
    const relative = [prefix, name].filter(Boolean).join('/')

    const dataStart = offset + 512
    const dataEnd = dataStart + size
    offset = dataStart + Math.ceil(size / 512) * 512

    const parts = relative.split('/')
    if (parts.length < 2) continue

    const cleanPath = parts.slice(1).join('/')

    if (
      cleanPath.startsWith('android/') ||
      cleanPath.startsWith('.git/') ||
      cleanPath === '' ||
      cleanPath.startsWith('.env')
    ) {
      continue
    }

    if (typeflag === '5') {
      fs.mkdirSync(path.join(root, cleanPath), { recursive: true })
      continue
    }

    if (typeflag === '0') {
      const target = path.join(root, cleanPath)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, tar.subarray(dataStart, dataEnd))
    }
  }
}

async function main() {
  console.log('[Empire] Fetching latest main branch from GitHub...')
  const archive = await fetchBuffer(REPO_TARBALL)
  console.log(`[Empire] Downloaded ${Math.round(archive.length / 1024)} KB`)
  extractTarGz(archive)
  console.log('[Empire] Source synced. Starting Next.js production build...')

  const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['next', 'build'], {
    cwd: root,
    stdio: 'inherit',
    env: process.env
  })

  process.exit(result.status === null ? 1 : result.status)
}

main().catch((error) => {
  console.error('[Empire] Build bootstrap failed:', error)
  process.exit(1)
})
