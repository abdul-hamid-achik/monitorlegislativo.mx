"use server"
import { prisma } from '@/lib/prisma';


export async function getVideos() {
  const videos = await prisma.video.findMany({
    include: {
      transcription: {
        include: {
          segments: true,
        }
      },
    },
  });

  return videos;
}
