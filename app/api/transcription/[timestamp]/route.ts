import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import superjson from 'superjson';

export async function GET(request: Request, { params }: { params: { timestamp: string } }) {
  const transcriptionSegment = await prisma.transcriptionSegment.findFirstOrThrow({
    where: {
      OR: [
        {
          startAt: params.timestamp,
        },
        {
          endAt: params.timestamp,
        }
      ]
    }
  });

  return NextResponse.json({
    video: superjson.serialize(transcriptionSegment).json,
  })
}
