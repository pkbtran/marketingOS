const puppeteer = require('puppeteer');

let browser: any = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

export async function fetchWebpageHeadless(url: string) {
  try {
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
    const content = await page.content();
    await page.close();
    const cheerio = require('cheerio');
    const $ = cheerio.load(content);
    $('script, style, noscript, iframe').remove();
    const text = $('body').text().replace(/\s+/g, ' ').trim();
    return { success: true, content: text.substring(0, 10000) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

process.on('exit', async () => {
  if (browser) await browser.close();
});