import { openai } from '@/lib/ai';
import fs from 'fs';
import { Duration } from 'luxon';
import parse from './parse';

function parseTimestamp(timestamp: string): Duration {
  const [hours, minutes, seconds] = timestamp.split(':');

  const [intHours, intMinutes] = [hours, minutes].map(Number);
  const intSeconds = parseFloat(seconds);

  return Duration.fromObject({ hours: intHours, minutes: intMinutes, seconds: intSeconds });
}

function fixTimestamps(transcription: string): string {
  const segments = parse(transcription);
  let fixedTranscription = 'WEBVTT\n\n';
  let timeOffset = Duration.fromMillis(0);
  let previousSegmentEnd = Duration.fromMillis(0);

  for (const segment of segments) {
    const startDuration = parseTimestamp(segment.startAt);
    const endDuration = parseTimestamp(segment.endAt);

    if (startDuration < previousSegmentEnd) {
      timeOffset = timeOffset.plus(previousSegmentEnd);
    }

    previousSegmentEnd = endDuration;


    const start = startDuration.plus(timeOffset).toFormat("hh:mm:ss.SSS");
    const end = endDuration.plus(timeOffset).toFormat("hh:mm:ss.SSS");

    fixedTranscription += `${start} --> ${end}\n${segment.content}\n\n`;
  }

  return fixedTranscription;
}

async function transcribe(path: string): Promise<string> {
  let result
  try {

    console.log(`🔈 Sending audio from ${path} to Whisper ASR API for transcription...`);

    let transcription = ''
    let subtitles = `${path}/subtitles.vtt`
    console.log('📝 Transcribing audio...');

    for (const filename of fs.readdirSync(path)) {
      console.log(`🔈 Transcribing file: ${filename}`);

      result = await openai.createTranscription(
        fs.createReadStream(`${path}/${filename}`) as unknown as File,
        'whisper-1',
        '',
        'vtt',
        0.3,
        'es',
      );

      transcription += result.data as unknown as string;
    }

    if (fs.existsSync(subtitles)) {
      fs.unlinkSync(subtitles);
    }

    if (transcription.length === 0) {
      console.error('❌ Error transcribing audio: No transcription returned from API');
      return '';
    }

    fs.writeFileSync(subtitles, fixTimestamps(transcription));
    return transcription;
  } catch (error: any) {
    console.error(`❌ Error transcribing audio: ${error?.response?.data?.error?.message || error}`);
    return '';
  }
}

export default transcribe;
