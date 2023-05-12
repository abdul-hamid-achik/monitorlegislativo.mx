import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import superjson from 'superjson';

export async function GET(request: Request, { params }: { params: { videoId: string } }) {

  const video = await prisma.video.findUnique({
    where: {
      id: params.videoId,
    },
    include: {
      transcription: {
        include: {
          segments: true,
        },
      },
    },
  });

  return NextResponse.json({
    video: superjson.serialize(video).json,
  })
}
