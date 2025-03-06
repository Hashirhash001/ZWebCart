-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "themeId" INTEGER;

-- CreateTable
CREATE TABLE "PageSection" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageSection_pageId_sectionId_key" ON "PageSection"("pageId", "sectionId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "Theme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageSection" ADD CONSTRAINT "PageSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageSection" ADD CONSTRAINT "PageSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
