import Link from "next/link"

import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
import { getVideos } from "./actions"


export default async function IndexPage() {
  const videos = await getVideos()

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          Bienvenido al monitor legislativo <br className="hidden sm:inline" />
          haciendo preguntas o buscando que se dijo.
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

      {videos && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Videos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {videos.map((video) => (
              <div

                key={video.id}
                className="flex flex-col gap-2 rounded-md p-4"
              >
                <Link href={`/watch/${video.id}`}>
                  <h3 className="text-xl font-bold">{video.id}</h3>
                </Link>
                <p className="">{video.isSenate ? "senado" : "congreso"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  )
}
