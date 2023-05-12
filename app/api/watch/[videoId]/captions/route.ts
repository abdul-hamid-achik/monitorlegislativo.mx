import { env } from '@/env.mjs';
import { youtube } from '@/lib/youtube';

export async function GET(request: Request, { params }: { params: { videoId: string } }) {
  const response = await youtube.captions.list({
    part: ['snippet'],
    videoId: params.videoId,
    key: env.YOUTUBE_API_KEY,
  });

  const spanishCaption = response.data!.items!.find(item => item.snippet!.language === 'es');
  if (!spanishCaption) {
    console.error('Spanish caption not found');
    return;
  }

  const captionRes = await youtube.captions.download({
    id: spanishCaption.id as string,
    tfmt: 'srt',
    key: env.YOUTUBE_API_KEY,
  });
  const captions = captionRes.data as string;


  return new Response(captions, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
