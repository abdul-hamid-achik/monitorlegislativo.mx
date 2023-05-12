import { NextResponse } from 'next/server';
import superjson from 'superjson';

import { youtube } from '@/lib/youtube';

export async function GET(request: Request, { params }: { params: { videoId: string } }) {

  const response = await youtube.videos.list({
    id: [params.videoId],
    part: ['snippet', 'statistics', 'contentDetails'],
  })

  if (!response.data!.items!.length) {
    return NextResponse.error();
  }


  const video = response.data.items?.[0];


  return NextResponse.json({
    video: superjson.serialize(video).json,
  })
}
