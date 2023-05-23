import { NextResponse } from 'next/server';
import superjson from 'superjson';

import { prisma } from '@/lib/prisma';
import { kv } from '@vercel/kv';
import { DateTime } from 'luxon';

export async function GET(request: Request, { params }: { params: { videoId: string } }) {
  const cacheKey = `video-stats-${params?.videoId}`
  const cachedVideoData = await kv.get(cacheKey)

  if (cachedVideoData) {
    return NextResponse.json({
      stats: cachedVideoData,
    })
  }

  const segments = await prisma.subtitle.findMany({
    where: {
      videoId: params.videoId,
    },
    orderBy: {
      startAt: 'asc',
    },
  });

  const wordCounts: { [key: string]: number } = {};
  const totalWordsOverTime = [];
  const uniqueWordsOverTime = [];

  for (const segment of segments) {
    const words = segment.content.toLowerCase().split(/\s+/);
    const uniqueWordsInSegment = new Set();

    for (const word of words) {
      if (wordCounts[word]) {
        wordCounts[word]++;
      } else {
        wordCounts[word] = 1;
      }
      uniqueWordsInSegment.add(word);
    }

    const startAt = DateTime.fromISO(segment.startAt).toFormat('yyyy-LL-dd HH:mm');

    totalWordsOverTime.push({ time: startAt, count: words.length });
    uniqueWordsOverTime.push({ time: startAt, count: uniqueWordsInSegment.size });
  }

  const top10Words = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

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

  const stats = {
    wordFrequencyOverTime: superjson.serialize(wordFrequencyOverTime).json,
    top10Words: superjson.serialize(top10Words).json,
    totalWordsOverTime: superjson.serialize(totalWordsOverTime).json,
    uniqueWordsOverTime: superjson.serialize(uniqueWordsOverTime).json,
  }

  await kv.set(cacheKey, superjson.stringify(stats), {
    ex: 60 * 60 * 1000 * 1,
    nx: true,
  });

  return NextResponse.json({
    stats,
  });
}
