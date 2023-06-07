import Player from '@/components/player';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { getBaseUrl } from "@/lib/utils";
import Commments from './comments';
import Stats from './stats';

async function getVideoStats(videoId: string) {
  try {
    const response = await fetch(`${getBaseUrl()}/api/watch/${videoId}/stats`, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return await response.json() as { [key: string]: any }
  } catch (error: any) {
    console.error(error)
    return {
      error: error.message,
      stats: {}
    }
  }
}



export default async function WatchPage({ params }: { params: { videoId: string } }) {
  const { videoId } = params

  const handleTimeUpdate = (seconds: number) => {
    console.log(seconds)
  }

  async function handleTranscribe() {
    'use server';

    await inngest.send({
      name: "app/create-captions",
      data: {
        videoId
      }
    })
  }

  const subtitlesCount = await prisma.subtitle.count({
    where: {
      videoId
    }
  })

  const noSubtitles = subtitlesCount === 0

  const { stats: data } = await getVideoStats(videoId);

  return <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10" >
    <div className="space-between flex flex-row justify-center">
      <Tabs defaultValue='comments'>
        <TabsList>
          <TabsTrigger value="stats">Estadisticas</TabsTrigger>
          <TabsTrigger value="comments">Comentarios</TabsTrigger>
        </TabsList>
        <TabsContent value='stats'>
          <Stats data={data} />
        </TabsContent>
        <TabsContent value="comments">
          {noSubtitles ? <Alert>
            <AlertTitle>No se ha procesado esta sesion todavia</AlertTitle>
            <AlertDescription>
              <p>Procesa la sesion para poder ver los subtitulos</p>
              {/* @ts-ignore */}
              <Button formAction={handleTranscribe} className="text-blue-500 hover:underline">Procesar</Button>
            </AlertDescription>
          </Alert> :
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
              className: 'video-js vjs-big-play-centered',
            }} />
          }
          <Commments />
        </TabsContent>
      </Tabs>
    </div>
  </main >
}
