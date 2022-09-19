import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const siteMeta = await prisma.siteMeta.create({
    data: {
      siteName: 'Techtouch Developers Blog',
      url: 'https://tech.techtouch.jp/',
      wrapperSelector: '.archive-entries',
      titleSelector: 'h1',
      anchorSelector: 'h1 a',
      timeSelector: '.archive-date time',
    },
  })
  console.log(siteMeta)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
