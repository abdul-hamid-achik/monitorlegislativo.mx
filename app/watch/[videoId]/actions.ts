"use server"
import { prisma } from '@/lib/prisma';

export async function getVideo(videoId: string) {
  const video = await prisma.video.findUnique({
    where: {
      id: videoId,
    },
    include: {
      transcription: {
        include: {
          segments: true,
        }
      }
    }
  })

  return video
}

