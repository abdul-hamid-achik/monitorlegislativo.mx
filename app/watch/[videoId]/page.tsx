import Player from '@/components/player';
import { inngest } from '@/lib/inngest';
import { getBaseUrl } from "@/lib/utils";
import { youtube } from '@/lib/youtube';
import Commments from './comments';
import Stats from './stats';

async function getVideoStats(videoId: string) {
  const response = await fetch(`${getBaseUrl()}/api/stats/${videoId}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  })

  return await response.json() as { [key: string]: number }
}


async function getCaptions(videoId: string) {
  const res = await youtube.captions.list({
    part: ['snippet'],
    videoId
  });

  // Find Spanish caption track
  const spanishCaption = res.data!.items!.find(item => item.snippet!.language === 'es');
  if (!spanishCaption) {
    console.error('Spanish caption not found');
    return;
  }

  const captionRes = await youtube.captions.download({
    id: spanishCaption.id as string,
    tfmt: 'srt',
  });

  const captions = captionRes.data as string;

  return captions
}

export default async function WatchPage({ params }: { params: { videoId: string } }) {
  const { videoId } = params

  const handleTimeUpdate = (seconds: number) => {
    console.log(seconds)
  }

  const handleTranscribe = async () => {
    await inngest.send({
      name: "app/create-captions",
      data: {
        videoId
      }
    })
  }

  const data = await getVideoStats(videoId);

  return <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10" >
    <Stats data={data} />
    <div className="flex flex-row">
      <Player options={{
        controls: true,
        tracks: [{
          kind: 'captions',
          label: 'español',
          src: `${getBaseUrl()}/api/watch/${videoId}/captions`,
          default: true,
        }],
        sources: [{
          src: `https://www.youtube.com/embed/${videoId}`,
          type: 'video/youtube'
        }],
        width: '720px',
      }} />
      <Commments />
    </div>
  </main>
}
