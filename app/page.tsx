import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/config/site"
import { DateTime } from "luxon"
import Image from "next/image"
import Link from "next/link"
import { getLatestVideos } from "./actions"

const YoutubeThumbnail = ({ videoId }: { videoId: string }) => {
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;

  return (
    <Image src={thumbnailUrl} alt="YouTube video thumbnail" width={360} height={360} className="w-full" />
  );
}
export default async function IndexPage() {
  const senateVideos = await getLatestVideos("senadomexico")
  const congressVideos = await getLatestVideos("camaradediputadosmx")

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          Hola <br className="hidden sm:inline" />
          bienvenido a este proyecto.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Volviendo accesible la información de las sesiones del congreso y el senado.
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


      {senateVideos && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Sesiones del senado</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {senateVideos.map((video) => (
              <div key={video.id?.videoId as string} className="flex flex-col gap-2 rounded-md p-4">
                <Link href={`/watch/${video.id?.videoId}`}>
                  <h3 className="text-xl font-bold">{video.snippet!.title! as string}</h3>
                </Link>
                <YoutubeThumbnail videoId={video.id?.videoId as string} />
                <p className="">SENADO</p>
              </div>
            ))}
          </div>
        </div>
      )}


      {congressVideos && (
        <div className="flex flex-col gap-4">
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
    </section>
  )
}
