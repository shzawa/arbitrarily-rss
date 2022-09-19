import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

;(async () => {
  const siteMetaList = await prisma.siteMeta.findMany()
  if (siteMetaList.length <= 0) {
    console.log('prisma.siteMeta.findFirst() が空でした')
    await prisma.$disconnect()
    return
  }

  const browser = await chromium.launch({ headless: false });

  for(const siteMeta of siteMetaList) {
    const page = await browser.newPage()
    await page.goto(siteMeta.url)
    await page.waitForLoadState('domcontentloaded');

    const wrapperDiv = await page.$(siteMeta.wrapperSelector)
    if (!wrapperDiv) {
      console.log(`${siteMeta.siteName} の wrapperDiv (${siteMeta.wrapperSelector}) が見つかりませんでした`)
      continue
    }

    const titleElements = await wrapperDiv.$$(siteMeta.titleSelector)
    const titles = await Promise.all(titleElements.map(element => element.innerText()))

    const anchorElements = await wrapperDiv.$$(siteMeta.anchorSelector)
    const urlsNullable = await Promise.all(anchorElements.map(async element => element.getAttribute('href')))
    const urls = urlsNullable.map(url => url || '')

    console.log('siteMeta.timeSelector', siteMeta.timeSelector)

    // const timeElements = await wrapperDiv.$$(siteMeta.timeSelector)
    // const timesNullable = await Promise.all(timeElements.map(async element => element.getAttribute('dateTime')))

    // const times = await Promise.all(timesNullable.filter((element) => element === null).map((_, index) => timeElements[index].innerText()))
    const times = titles.map(() => '')// timesNullable.map(time => time || '')

    const newArrivals = titles.map((title, index) => ({
      title,
      url: urls[index],
      time: new Date(times[index]).toLocaleDateString('ja-JP')
    }))

    const existArticles = await prisma.article.findMany({
      where: {
        OR: newArrivals.map(article => ({
          url: article.url
        }))
      }
    })

    console.dir(existArticles, { depth: null })

    const insertNewArrivals = existArticles.length > 0 ? newArrivals.filter((article, index) => !existArticles[index] && article.url !== existArticles[index].url) : newArrivals

    console.log({insertNewArrivals})

    if (insertNewArrivals.length <= 0) continue

    const queries = insertNewArrivals.map(article => (
      prisma.article.create({
        data: {
          ...article,
          site: {
            connect: {
              id: siteMeta.id
            }
          }
        },
      })
    ))

    await prisma.$transaction([...queries])
  }

  await Promise.all([
    prisma.$disconnect(),
    browser.close()
  ])
})()
