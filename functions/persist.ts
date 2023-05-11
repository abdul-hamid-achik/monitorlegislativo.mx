import { prisma } from '@/lib/prisma';
import { Transcription } from '@prisma/client';
import parse from './parse';

async function persist(videoId: string, transcriptionText: string, resumeText: string): Promise<Transcription | null> {
  try {
    console.log(`📝 Persisting transcription for video ${videoId}...`);
    await prisma.video.upsert({
      where: { id: videoId },
      update: {},
      create: {
        id: videoId,
      },
    });

    const transcription = await prisma.transcription.upsert({
      where: { videoId },
      update: {
        resume: resumeText,
      },
      create: {
        videoId,
        resume: resumeText,
      },
    });

    console.log(`📝 Persisting transcription segments for video ${videoId}...`);
    const segments = parse(transcriptionText)

    await prisma.transcriptionSegment.deleteMany({
      where: {
        transcriptionId: videoId,
      }
    });

    const transcriptionSegments: any[] = [];

    for (const segment of segments) {
      const { startAt, endAt, content } = segment;
      transcriptionSegments.push({
        startAt,
        endAt,
        content,
        transcriptionId: videoId,
      })
    }

    console.log(`📝 Persisting ${transcriptionSegments.length} transcription segments for video ${videoId}...`)
    await prisma.transcriptionSegment.createMany({
      data: transcriptionSegments,
    });

    console.log('✅ Transcription persisted!');


    return transcription;
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    return null;
  }
}
export default persist;
