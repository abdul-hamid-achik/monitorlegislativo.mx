// import { youtube } from '@/lib/youtube';

export async function GET(request: Request, { params }: { params: { videoId: string } }) {
  // const response = await youtube.captions.list({
  //   part: ['snippet'],
  //   videoId: params.videoId
  // });

  // const spanishCaption = response.data!.items!.find(item => item.snippet!.language === 'es');
  // if (!spanishCaption) {
  //   console.error('Spanish caption not found');
  //   return;
  // }

  // const captionRes = await youtube.captions.download({
  //   id: spanishCaption.id as string,
  //   tfmt: 'srt'
  // });
  // const captions = captionRes.data as string;

  const captions = 'WEBVTT'
  return new Response(captions, {
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
