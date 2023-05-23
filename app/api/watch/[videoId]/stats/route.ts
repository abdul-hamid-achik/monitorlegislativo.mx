import { prisma } from '@/lib/prisma';
import { kv } from '@vercel/kv';
import nlp from 'compromise';
import { DateTime } from 'luxon';
import { NextResponse } from 'next/server';
import Sentiment from 'sentiment';
import superjson from 'superjson';
// @ts-ignore
import Spanish from 'sentiment-spanish';

// Initialize sentiment
var sentiment = new Sentiment(Spanish);

export async function GET(request: Request, { params }: { params: { videoId: string } }) {
  const cacheKey = `video-${params?.videoId}-stats`
  const cachedVideoData = await kv.get(cacheKey)

  if (cachedVideoData && process.env.NODE_ENV !== 'development') {
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

  const sentimentOverTime = [];
  const verbsOverTime = [];
  const adjectivesOverTime = [];
  const entitiesOverTime = [];
  const topicsOverTime = [];

  for (const segment of segments) {
    const startAt = DateTime.fromISO(segment.startAt).toFormat('yyyy-LL-dd HH:mm');

    // Sentiment analysis
    const result = sentiment.analyze(segment.content);
    sentimentOverTime.push({ time: startAt, score: result.score });

    // Verbs and adjectives extraction
    const doc = nlp(segment.content);
    const verbs = doc.verbs().out('text');
    const adjectives = doc.adjectives().out('text');
    verbsOverTime.push({ time: startAt, verbs });
    adjectivesOverTime.push({ time: startAt, adjectives });

    // Named entities (topics)
    const entities = doc.people().concat(doc.places()).concat(doc.organizations()).map(entity => entity.out('text'));
    entitiesOverTime.push({ time: startAt, entities });

    // Key phrases (topics)
    const topics = doc.topics().out('text');
    topicsOverTime.push({ time: startAt, topics });
  }

  const stats = {
    sentimentOverTime: superjson.serialize(sentimentOverTime).json,
    verbsOverTime: superjson.serialize(verbsOverTime).json,
    adjectivesOverTime: superjson.serialize(adjectivesOverTime).json,
    entitiesOverTime: superjson.serialize(entitiesOverTime).json,
    topicsOverTime: superjson.serialize(topicsOverTime).json,
  }

  await kv.set(cacheKey, superjson.stringify(stats), {
    ex: 60 * 60 * 1000 * 1,
    nx: true,
  });

  return NextResponse.json({
    stats,
  });
}
