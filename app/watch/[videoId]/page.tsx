
'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getBaseUrl } from "@/lib/utils";
import { TranscriptionSegment, Video } from "@prisma/client";
import Plyr, { APITypes } from "plyr-react";
import "plyr-react/plyr.css";
import { useEffect, useRef, useState } from "react";




async function getVideo(videoId: string) {
  const response = await fetch(`${getBaseUrl()}/api/watch/${videoId}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  })

  return await response.json() as Video & { transcriptionSegments: TranscriptionSegment[] }
}

async function getTranscriptionSegment(transcriptionId: string, timestamp: string) {
  const response = await fetch(`${getBaseUrl()}/api/transcription/${transcriptionId}?seconds=${timestamp}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  })

  return await response.json() as TranscriptionSegment
}


export default async function WatchPage({ params }: { params: { videoId: string } }) {
  const { videoId } = params
  const ref = useRef<APITypes>(null)

  const [currentSegment, setCurrentSegment] = useState<TranscriptionSegment | null>(null)

  const handleTimeUpdate = async (event: any) => {
    const timestamp = event.detail.plyr.currentTime
    console.log(timestamp)
  }

  useEffect(() => {
    const api = ref.current as APITypes

    if (!api?.plyr.source) return

    api?.plyr?.on('timeupdate', handleTimeUpdate)

    return () => {
      api?.plyr?.off('timeupdate', handleTimeUpdate)
      api?.plyr?.destroy()
    }
  })

  return <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
    <h1>Watch page</h1>
    <p>{videoId}</p>
    {currentSegment && (
      <Alert>
        <AlertTitle>{currentSegment.startAt}{" -> "}{currentSegment.endAt}</AlertTitle>
        <AlertDescription>{currentSegment.content}</AlertDescription>
      </Alert>
    )}
    <Plyr source={{
      type: "video",
      sources: [
        {
          src: videoId,
          provider: 'youtube'
        }
      ]
    }} ref={ref} />
  </main>
}
