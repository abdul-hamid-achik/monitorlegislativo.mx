"use client"

import { useParams } from "next/navigation";
import { getVideo } from "./actions";

export default async function WatchPage() {
  const { videoId } = useParams()
  const video = await getVideo(videoId)

  return <>
    <h1>Watch page</h1>
    <p>{videoId}</p>
    <p>{video?.id}</p>
  </>
}
