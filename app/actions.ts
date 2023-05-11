"use server"
import { prisma } from '@/lib/prisma';


export async function getVideos() {
  const videos = await prisma.video.findMany({
    orderBy: {
      happenedAt: 'desc',
    }
  });

  return videos;
}
