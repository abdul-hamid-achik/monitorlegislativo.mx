import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import superjson from 'superjson';

export async function GET(request: Request, { params }: { params: { transcriptionId: string } }) {
  const searchParams = new URLSearchParams(request.url);
  const timestamp = searchParams.get('timestamp');

  if (timestamp) {
    const transcriptionSegment = await prisma.transcriptionSegment.findFirst({
      where: {
        id: params.transcriptionId,
        OR: [
          {
            startAt: timestamp,
          },
          {
            endAt: timestamp,
          }
        ]
      }
    });
    return NextResponse.json({
      video: superjson.serialize(transcriptionSegment).json,
    })
  }


  const transcription = await prisma.transcription.findFirstOrThrow({
    where: {
      videoId: params.transcriptionId,
    },
    include: {
      segments: true,
    }
  });

  const subtitles = [
    "WEBVTT\n\n",
  ]

  transcription.segments.forEach((segment) => {
    subtitles.push(`${segment.startAt} --> ${segment.endAt}\n`);
    subtitles.push(`${segment.content}\n\n`);
  });

  return new Response(subtitles.join(''), { headers: { 'Content-Type': 'text/vtt' } });
}
