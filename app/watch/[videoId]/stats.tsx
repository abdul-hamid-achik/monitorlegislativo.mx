'use client'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';



function WordFrequencyChart({ data, title }: { data: any, title: string }) {
  'use client'

  return (
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

}

function WordCountChart({ data, title }: { data: any, title: string }) {
  'use client'

  return (
    <BarChart width={600} height={300} data={data} title={title}>
      <XAxis dataKey="word" />
      <YAxis />
      <Tooltip />
      <CartesianGrid strokeDasharray="3 3" />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  );
}

export default function Stats({ data }: { data: { [key: string]: number; } }) {
  const { top10Words, wordFrequencyOverTime } = data

  return <div className="space-evenly flex flex-row">
    <WordCountChart data={top10Words} title="Palabras mas populares" />

    <WordFrequencyChart data={wordFrequencyOverTime} title="Frecuencia de palabras" />
  </div>
}
