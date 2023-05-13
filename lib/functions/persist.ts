import { prisma } from '@/lib/prisma';
import { Subtitle } from '@prisma/client';
import * as uuid from 'uuid';
import parse from './parse';

async function persist(videoId: string, transcriptionText: string): Promise<{
  id: string;
  subtitles: Subtitle[];
} | null> {
  try {

    console.log(`📝 Persisting transcription segments for video ${videoId}...`);
    const segments = parse(transcriptionText)

    await prisma.subtitle.deleteMany({
      where: {
        videoId,
      }
    });

    let subtitlesData: any[] = [];

    for (const segment of segments) {
      const { startAt, endAt, content } = segment;
      subtitlesData.push({
        id: uuid.v4(),
        startAt,
        endAt,
        content,
        videoId,
      })
    }

    console.log(`📝 Persisting ${subtitlesData.length} transcription segments for video ${videoId}...`)
    const subtitles = await prisma.subtitle.createMany({
      data: subtitlesData,
    });

    console.log('✅ Transcription persisted!');


    return {
      id: videoId,
      subtitles: subtitles as unknown as Subtitle[],
    };
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    return null;
  }
}
export default persist;
