import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import puppeteer from 'puppeteer'

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true })
}

async function snap(page, baseUrl, pathname, filePath) {
  await page.goto(new URL(pathname, baseUrl).toString(), { waitUntil: 'networkidle0' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: filePath, fullPage: true })
  console.log('Saved', filePath)
}

async function tryGif(screenshotsDir) {
  if (process.env.MAKE_GIF !== '1') return
  const output = path.join(screenshotsDir, 'preview.gif')
  return new Promise((resolve) => {
    execFile('ffmpeg', ['-y', '-framerate', '1', '-pattern_type', 'glob', '-i', path.join(screenshotsDir, '*.png'), '-vf', 'scale=1280:-1', '-r', '2', output], (err) => {
      if (err) {
        console.warn('ffmpeg not available or failed, skipping GIF')
        return resolve(false)
      }
      console.log('Created GIF', output)
      resolve(true)
    })
  })
}

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5175/'
  const screenshotsDir = path.join(process.cwd(), 'screenshots')
  await ensureDir(screenshotsDir)

  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  // 01 Login
  await snap(page, baseUrl, '/login', path.join(screenshotsDir, '01-login.png'))

  // 02 Register and land on Dashboard
  await page.goto(new URL('/register', baseUrl).toString(), { waitUntil: 'networkidle0' })
  const email = `demo+${Date.now()}@example.com`
  const password = 'Password123!'
  await page.type('input[type="email"]', email, { delay: 10 })
  await page.type('input[placeholder="Your name"], input[type="text"]', 'Demo User', { delay: 10 })
  await page.type('input[type="password"], input[placeholder="Choose a strong password"]', password, { delay: 10 })
  await page.click('button[type="submit"]')
  await page.waitForNavigation({ waitUntil: 'networkidle0' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(screenshotsDir, '02-register.png'), fullPage: true })

  // 03 Dashboard
  await snap(page, baseUrl, '/dashboard', path.join(screenshotsDir, '03-dashboard.png'))
  // 04 Budgets
  await snap(page, baseUrl, '/budgets', path.join(screenshotsDir, '04-budgets.png'))
  // 05 Transactions
  await snap(page, baseUrl, '/transactions', path.join(screenshotsDir, '05-transactions.png'))
  // 06 Reports
  await snap(page, baseUrl, '/reports', path.join(screenshotsDir, '06-reports.png'))

  await browser.close()
  await tryGif(screenshotsDir)

  // Update README with embedded images
  await updateReadme(screenshotsDir)
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})

async function updateReadme(screenshotsDir) {
  const readmePath = path.join(process.cwd(), 'README.md')
  let content = ''
  try {
    content = await fs.promises.readFile(readmePath, 'utf8')
  } catch (e) {
    console.warn('README.md not found, skipping embed')
    return
  }

  const startMarker = '<!-- screenshots:start -->'
  const endMarker = '<!-- screenshots:end -->'
  const startIdx = content.indexOf(startMarker)
  const endIdx = content.indexOf(endMarker)
  const images = [
    '01-login.png',
    '02-register.png',
    '03-dashboard.png',
    '04-budgets.png',
    '05-transactions.png',
    '06-reports.png',
  ].filter(name => fs.existsSync(path.join(screenshotsDir, name)))

  const gifPath = path.join(screenshotsDir, 'preview.gif')
  const hasGif = fs.existsSync(gifPath)

  const lines = []
  if (hasGif) {
    lines.push('![Preview GIF](screenshots/preview.gif)')
    lines.push('')
  }
  for (const name of images) {
    const title = name.replace(/^[0-9]+-/, '').replace(/\.png$/, '')
    lines.push(`![${title}](screenshots/${name})`)
  }
  const block = `\n${startMarker}\n\n${lines.join('\n')}\n\n${endMarker}\n`

  let nextContent = content
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const before = content.slice(0, startIdx)
    const after = content.slice(endIdx + endMarker.length)
    nextContent = `${before}${block}${after}`
  } else {
    nextContent = `${content}\n${block}`
  }

  await fs.promises.writeFile(readmePath, nextContent, 'utf8')
  console.log('README updated with screenshots')
}