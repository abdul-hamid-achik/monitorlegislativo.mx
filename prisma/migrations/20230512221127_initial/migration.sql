CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DIPUTADO', 'SENADOR');

-- CreateTable
CREATE TABLE "subtitles" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "start_at" TEXT NOT NULL,
    "end_at" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "vector" vector,

    CONSTRAINT "subtitles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "politicians" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "fraction" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "link" TEXT,
    "role" "Role" NOT NULL,
    "vector" vector,

    CONSTRAINT "politicians_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subtitles_id_key" ON "subtitles"("id");

-- CreateIndex
CREATE INDEX "subtitles_video_id_idx" ON "subtitles"("video_id");

-- CreateIndex
CREATE UNIQUE INDEX "subtitles_video_id_start_at_end_at_content_key" ON "subtitles"("video_id", "start_at", "end_at", "content");

-- CreateIndex
CREATE UNIQUE INDEX "politicians_id_key" ON "politicians"("id");

-- CreateIndex
CREATE INDEX "politicians_name_last_name_idx" ON "politicians"("name", "last_name");

-- CreateIndex
CREATE INDEX "politicians_name_idx" ON "politicians"("name");

-- CreateIndex
CREATE INDEX "politicians_last_name_idx" ON "politicians"("last_name");

-- CreateIndex
CREATE INDEX "politicians_fraction_idx" ON "politicians"("fraction");

-- CreateIndex
CREATE INDEX "politicians_phone_idx" ON "politicians"("phone");

-- CreateIndex
CREATE INDEX "politicians_email_idx" ON "politicians"("email");

-- CreateIndex
CREATE INDEX "politicians_link_idx" ON "politicians"("link");

-- CreateIndex
CREATE INDEX "politicians_role_idx" ON "politicians"("role");

-- CreateIndex
CREATE UNIQUE INDEX "politicians_name_last_name_fraction_phone_email_link_role_key" ON "politicians"("name", "last_name", "fraction", "phone", "email", "link", "role");
