-- CreateTable
CREATE TABLE "SiteMeta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "wrapperSelector" TEXT NOT NULL,
    "titleSelector" TEXT NOT NULL,
    "anchorSelector" TEXT NOT NULL,
    "timeSelector" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Article" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "siteId" INTEGER NOT NULL,
    CONSTRAINT "Article_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "SiteMeta" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
