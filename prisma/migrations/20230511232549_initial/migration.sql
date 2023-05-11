CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "is_senate" BOOLEAN NOT NULL DEFAULT false,
    "happened_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transcriptions" (
    "video_id" TEXT NOT NULL,
    "resume" TEXT NOT NULL,

    CONSTRAINT "transcriptions_pkey" PRIMARY KEY ("video_id")
);

-- CreateTable
CREATE TABLE "transcription_segments" (
    "id" TEXT NOT NULL,
    "transcription_id" TEXT NOT NULL,
    "start_at" TEXT NOT NULL,
    "end_at" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "vector" vector,

    CONSTRAINT "transcription_segments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_id_key" ON "videos"("id");

-- CreateIndex
CREATE UNIQUE INDEX "transcriptions_video_id_key" ON "transcriptions"("video_id");

-- CreateIndex
CREATE UNIQUE INDEX "transcription_segments_id_key" ON "transcription_segments"("id");

-- CreateIndex
CREATE INDEX "transcription_segments_transcription_id_idx" ON "transcription_segments"("transcription_id");

-- CreateIndex
CREATE UNIQUE INDEX "transcription_segments_transcription_id_start_at_end_at_con_key" ON "transcription_segments"("transcription_id", "start_at", "end_at", "content");

-- AddForeignKey
ALTER TABLE "transcriptions" ADD CONSTRAINT "transcriptions_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcription_segments" ADD CONSTRAINT "transcription_segments_transcription_id_fkey" FOREIGN KEY ("transcription_id") REFERENCES "transcriptions"("video_id") ON DELETE RESTRICT ON UPDATE CASCADE;
