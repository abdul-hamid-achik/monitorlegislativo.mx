
'use client'

import Player from '@/components/player';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getBaseUrl } from "@/lib/utils";
import { TranscriptionSegment, Video } from "@prisma/client";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';


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


async function getVideoStats(videoId: string) {
  const response = await fetch(`${getBaseUrl()}/api/stats/${videoId}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  })

  return await response.json() as { [key: string]: number }
}

const WordFrequencyChart = ({ data, title }: { data: any, title: string }) => (
  <ResponsiveContainer width="100%" height="300" >
    <LineChart data={data} title={title}>
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
    </LineChart>
  </ResponsiveContainer>
);


const WordCountChart = ({ data, title }: { data: any, title: string }) => (
  <BarChart width={600} height={300} data={data} title={title}>
    <XAxis dataKey="word" />
    <YAxis />
    <Tooltip />
    <CartesianGrid strokeDasharray="3 3" />
    <Bar dataKey="count" fill="#8884d8" />
  </BarChart>
);


export default async function WatchPage({ params }: { params: { videoId: string } }) {
  const { videoId } = params

  const [currentSegment, setCurrentSegment] = useState<TranscriptionSegment | null>(null)

  const handleTimeUpdate = (seconds: number) => {
    console.log(seconds)
  }

  const { top10Words, wordFrequencyOverTime } = await getVideoStats(videoId);

  return <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10" >
    <h1>Watch page</h1>
    <p>{videoId}</p>
    {currentSegment && (
      <Alert>
        <AlertTitle>{currentSegment.startAt}{" -> "}{currentSegment.endAt}</AlertTitle>
        <AlertDescription>{currentSegment.content}</AlertDescription>
      </Alert>
    )}
    <WordCountChart data={top10Words} title="Palabras mas populares" />

    <WordFrequencyChart data={wordFrequencyOverTime} title="Frecuencia de palabras" />
    <Player options={{
      controls: true,
      tracks: [{
        kind: 'captions',
        label: 'español',
        src: `${getBaseUrl()}/api/transcription/${videoId}`,
        default: true,
      }],
      sources: [{
        src: `https://www.youtube.com/embed/${videoId}`,
        type: 'video/youtube'
      }],
      width: '720px',
    }} onTimeUpdate={handleTimeUpdate} />
  </main>
}
