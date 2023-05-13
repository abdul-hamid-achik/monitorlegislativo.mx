import { NextResponse } from 'next/server';
import superjson from 'superjson';

import { youtube } from '@/lib/youtube';
import { kv } from '@vercel/kv';
export async function GET(request: Request, { params }: { params: { videoId: string } }) {
  const cachedVideoData = await kv.get(`video-${params.videoId}`)

  if (cachedVideoData) {
    return NextResponse.json({
      video: cachedVideoData,
    })
  }

  const response = await youtube.videos.list({
    id: [params.videoId],
    part: ['snippet', 'statistics', 'contentDetails'],
  })

  const video = superjson.serialize(response.data.items?.[0]).json

  kv.set(`video-${params.videoId}`, JSON.stringify(video), {
    ex: 60 * 60 * 24 * 7,
    nx: true,
  })

  return NextResponse.json({
    video,
  })
}
