ALTER TABLE "testimony"
ADD COLUMN IF NOT EXISTS "videoFileId" TEXT;

CREATE INDEX IF NOT EXISTS "testimony_videoFileId_idx"
  ON "testimony"("videoFileId");

ALTER TABLE "testimony"
ADD CONSTRAINT "testimony_videoFileId_fkey"
FOREIGN KEY ("videoFileId")
REFERENCES "file_asset"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
