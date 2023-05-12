import Player from '@/components/player';
import { getBaseUrl } from "@/lib/utils";
// import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';


async function getVideoStats(videoId: string) {
  const response = await fetch(`${getBaseUrl()}/api/stats/${videoId}`, {
    headers: {
      'Content-Type': 'application/json',
    }
  })

  return await response.json() as { [key: string]: number }
}

// function WordFrequencyChart({ data, title }: { data: any, title: string }) {
//   'use client'
//   return (
//     <ResponsiveContainer width="100%" height="300" >
//       <LineChart data={data} title={title}>
//         <XAxis dataKey="time" />
//         <YAxis />
//         <Tooltip />
//         <Legend />
//         <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
//       </LineChart>
//     </ResponsiveContainer>
//   );

// }

// function WordCountChart({ data, title }: { data: any, title: string }) {
//   'use client'
//   return (
//     <BarChart width={600} height={300} data={data} title={title}>
//       <XAxis dataKey="word" />
//       <YAxis />
//       <Tooltip />
//       <CartesianGrid strokeDasharray="3 3" />
//       <Bar dataKey="count" fill="#8884d8" />
//     </BarChart>
//   );
// }


export default async function WatchPage({ params }: { params: { videoId: string } }) {
  const { videoId } = params

  const handleTimeUpdate = (seconds: number) => {
    console.log(seconds)
  }

  const { top10Words, wordFrequencyOverTime } = await getVideoStats(videoId);

  'use client'
  return <main className="container grid items-center gap-6 pb-8 pt-6 md:py-10" >
    {/* {currentSegment && (
      <Alert>
        <AlertTitle>{currentSegment.startAt}{" -> "}{currentSegment.endAt}</AlertTitle>
        <AlertDescription>{currentSegment.content}</AlertDescription>
      </Alert>
    )} */}
    {/* <WordCountChart data={top10Words} title="Palabras mas populares" />

    <WordFrequencyChart data={wordFrequencyOverTime} title="Frecuencia de palabras" /> */}
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
    }} />
  </main>
}
