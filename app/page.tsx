import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { siteConfig } from "@/config/site"
import { CONGRESS_CHANNEL_ID, SENATE_CHANNEL_ID, youtube } from '@/lib/youtube'
import { LegislativeBranch } from '@/types/legislative'
import { kv } from "@vercel/kv"
import { DateTime } from "luxon"
import Image from "next/image"
import Link from "next/link"

const YoutubeThumbnail = ({ videoId }: { videoId: string }) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;

  return (
    <Image src={thumbnailUrl} alt="YouTube video thumbnail" width={360} height={360} className="w-full" />
  );
}



async function getLatestVideos(legislativeBranch: LegislativeBranch) {
  try {
    const channelId = legislativeBranch === 'Senado' ? SENATE_CHANNEL_ID : CONGRESS_CHANNEL_ID;

    if (!channelId) {
      console.error('Channel not found');
      return;
    }

    const cachedContent = await kv.get(`latest-videos-${legislativeBranch}`)

    if (cachedContent) {
      return cachedContent as Array<any>
    }

    const res = await youtube.search.list({
      channelId: channelId,
      maxResults: 8,
      order: 'date',
      part: ['snippet'],
    });

    const videos = res.data.items || [];

    await kv.set(`latest-videos-${legislativeBranch}`, videos, {
      ex: 3 * 60 * 60 * 1000, // this is so much time because we don't want to hit the youtube api limit
      nx: true
    })

    return videos;
  } catch (error) {
    console.error(error);
    return []
  }
}

export default async function IndexPage() {
  const senateVideos = await getLatestVideos("Senado")
  const congressVideos = await getLatestVideos("Congreso")

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          Bienvenido <br className="hidden sm:inline" />
          mi monitor del poder legislativo.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Aqui puedes pedirle a la inteligencia artificial que te resuma o explique los videos de youtube del congreso y el senado.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          target="_blank"
          rel="noreferrer"
          href={siteConfig.links.github}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          <Icons.gitHub /> GitHub del projecto
        </Link>
      </div>

      <Tabs defaultValue="all">
        <TabsList >
          <TabsTrigger value="all">Todo</TabsTrigger>
          <TabsTrigger value="congreso">Congreso de la union</TabsTrigger>
          <TabsTrigger value="senado">Senado de la republica</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          {congressVideos && (
            <div className="mt-4 flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Sesiones del Congreso</h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                {congressVideos.map((video) => (
                  <Link key={video.id?.videoId as string} href={`/watch/${video.id?.videoId}`}>
                    <Card >
                      <CardHeader>
                        <CardTitle>{video.snippet!.title! as string}</CardTitle>
                        <CardDescription>{video.snippet!.description! as string}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <YoutubeThumbnail videoId={video.id?.videoId as string} />
                      </CardContent>

                      {video.snippet?.publishedAt &&
                        <CardFooter>
                          <p>{DateTime.fromISO(video.snippet?.publishedAt as string).toRelative()}</p>
                          <p>{video.statistics?.viewCount}</p>
                        </CardFooter>
                      }
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {senateVideos && (
            <div className="mt-4 flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Sesiones del Senado</h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                {senateVideos.map((video) => (
                  <Link key={video.id?.videoId as string} href={`/watch/${video.id?.videoId}`}>
                    <Card >
                      <CardHeader>
                        <CardTitle>{video.snippet!.title! as string}</CardTitle>
                        <CardDescription>{video.snippet!.description! as string}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <YoutubeThumbnail videoId={video.id?.videoId as string} />
                      </CardContent>

                      {video.snippet?.publishedAt &&
                        <CardFooter>
                          <p>{DateTime.fromISO(video.snippet?.publishedAt as string).toRelative()}</p>
                          <p>{video.statistics?.viewCount}</p>
                        </CardFooter>
                      }
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="congreso">
          {congressVideos && (
            <div className="mt-4 flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Sesiones del Congreso</h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                {congressVideos.map((video) => (
                  <Link key={video.id?.videoId as string} href={`/watch/${video.id?.videoId}`}>
                    <Card >
                      <CardHeader>
                        <CardTitle>{video.snippet!.title! as string}</CardTitle>
                        <CardDescription>{video.snippet!.description! as string}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <YoutubeThumbnail videoId={video.id?.videoId as string} />
                      </CardContent>

                      {video.snippet?.publishedAt &&
                        <CardFooter>
                          <p className="">{DateTime.fromISO(video.snippet?.publishedAt as string).toRelative({ unit: "hours" })}</p>
                        </CardFooter>
                      }
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </TabsContent>
        <TabsContent value="senado">
          {senateVideos && (
            <div className="mt-4 flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Sesiones del Senado</h2>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
                {senateVideos.map((video) => (
                  <Link key={video.id?.videoId as string} href={`/watch/${video.id?.videoId}`}>
                    <Card >
                      <CardHeader>
                        <CardTitle>{video.snippet!.title! as string}</CardTitle>
                        <CardDescription>{video.snippet!.description! as string}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <YoutubeThumbnail videoId={video.id?.videoId as string} />
                      </CardContent>

                      {video.snippet?.publishedAt &&
                        <CardFooter>
                          <p className="">{DateTime.fromISO(video.snippet?.publishedAt as string).toRelative({ unit: "hours" })}</p>
                        </CardFooter>
                      }
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}
