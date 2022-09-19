import { chromium } from 'playwright';
import { writeJsonFile } from 'write-json-file';

;(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage()
  await page.goto('https://techblog.yahoo.co.jp/')
  await page.waitForLoadState('networkidle');

  const wrapperDiv = await page.$('#entry-list')
  if (!wrapperDiv) {
    console.log('wrapperDiv が見つからない...')
    await browser.close()
    return
  }

  const headlineElements = await wrapperDiv.$$('h3')
  const headlines = await Promise.all(headlineElements.map(element => element.innerText()))

  const anchorElements = await wrapperDiv.$$('a')
  const anchors = await Promise.all(anchorElements.map(element => element.getAttribute('href')))

  const timeElements = await wrapperDiv.$$('time')
  const times = await Promise.all(timeElements.map(async element => {
    const attr = await element.getAttribute('dateTime')
    const text = await element.innerText()
    return attr || text
  }))
  if (times)

  console.log({headlines, anchors, times: times.map(time => time ? new Date(time).toLocaleDateString('ja-JP') : time)})

  const filename = `${new URL('https://techblog.yahoo.co.jp/').hostname}.json`
  const newArrivals = headlines.map((headline, index) => ({
    headline,
    anchor: anchors[index],
    time: times[index]
  }))
  writeJsonFile(filename, newArrivals, { indent: '  ' })

  await browser.close()
})()
