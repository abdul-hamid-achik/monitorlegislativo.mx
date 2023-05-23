'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis, YAxis,
} from 'recharts';

export default function Stats({ data }: { data: { [key: string]: any[]; } }) {
  const {
    sentimentOverTime,
    verbsOverTime,
    adjectivesOverTime,
    entitiesOverTime,
    topicsOverTime,
  } = data;

  return (
    <div className="space-evenly flex flex-row">
      <div className="space-evenly flex flex-col">
        <LineChart
          width={500}
          height={300}
          data={sentimentOverTime}
          title='Sentiment over time'
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>

        <LineChart
          width={500}
          height={300}
          title='Verbs over time'
          data={verbsOverTime}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="verbs" stroke="#82ca9d" />
        </LineChart>
      </div>

      <div className="space-evenly flex flex-col">
        <LineChart
          width={500}
          height={300}
          data={adjectivesOverTime}
          title='Adjectives over time'
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="adjectives" stroke="#ffc658" />
        </LineChart>

        <LineChart
          width={500}
          height={300}
          data={entitiesOverTime}
          title='Entities over time'
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="entities" stroke="#8884d8" />
        </LineChart>

      </div>

      <div className="space-evenly flex flex-col">
        <LineChart
          width={500}
          height={300}
          data={topicsOverTime}
          title='Topics over time'
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="topics" stroke="#82ca9d" />
        </LineChart>
      </div>
    </div>
  );
}
