import { prisma } from '@/lib/prisma';
import { DateTime } from 'luxon';
import { NextResponse } from 'next/server';
import superjson from 'superjson';

export async function GET(_request: Request, { params }: { params: { videoId: string } }) {
  const segments = await prisma.subtitle.findMany({
    where: {
      videoId: params.videoId,
    },
    orderBy: {
      startAt: 'asc',
    },
  });

  // First, compute the total word counts
  const wordCounts: { [key: string]: number } = {};
  for (const segment of segments) {
    const words = segment.content.toLowerCase().split(/\s+/); // Split on whitespace and convert to lowercase
    for (const word of words) {
      if (wordCounts[word]) {
        wordCounts[word]++;
      } else {
        wordCounts[word] = 1;
      }
    }
  }

  // Then, select the top 10 most frequent words
  const top10Words = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count })); // Here, we keep the count information

  // For each of the top 10 words, compute their frequency over time
  const wordFrequencyOverTime = top10Words.map(({ word }) => {
    const frequencyOverTime = [];
    for (const segment of segments) {
      const words = segment.content.toLowerCase().split(/\s+/);
      const wordCount = words.filter(w => w === word).length;
      const startAt = DateTime.fromISO(segment.startAt).toFormat('yyyy-LL-dd HH:mm');
      frequencyOverTime.push({ time: startAt, count: wordCount });
    }
    return { word, frequencyOverTime };
  });

  return NextResponse.json({
    wordFrequencyOverTime: superjson.serialize(wordFrequencyOverTime).json,
    top10Words: superjson.serialize(top10Words).json, // We also return the top10Words array
  });
}
