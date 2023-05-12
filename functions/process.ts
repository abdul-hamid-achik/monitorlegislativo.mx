import * as functions from '@/functions';
import fs from 'fs';
import { Duration } from 'luxon';
import parse from './parse';

type ResumeOutput = {
  transcription?: string,
  resume?: string,
  error?: any
}

function parseTimestamp(timestamp: string): Duration {
  // Split timestamp into parts
  const [hours, minutes, seconds] = timestamp.split(':');

  // Parse parts as integers
  const [intHours, intMinutes] = [hours, minutes].map(Number);
  const intSeconds = parseFloat(seconds);  // includes milliseconds

  // Return as a Duration
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

    // Check if the current segment starts a new chunk
    if (startDuration < previousSegmentEnd) {
      // The current segment starts a new chunk, so update the timeOffset
      timeOffset = timeOffset.plus(previousSegmentEnd);
    }

    // Update previousSegmentEnd for the next iteration
    previousSegmentEnd = endDuration;

    console.log(`Parsed start duration: ${startDuration.toFormat('hh:mm:ss.SSS')}`);
    console.log(`Parsed end duration: ${endDuration.toFormat('hh:mm:ss.SSS')}`);

    const start = startDuration.plus(timeOffset).toFormat("hh:mm:ss.SSS");
    const end = endDuration.plus(timeOffset).toFormat("hh:mm:ss.SSS");

    fixedTranscription += `${start} --> ${end}\n${segment.content}\n\n`;

    console.log(`Updated time offset: ${timeOffset.toFormat('hh:mm:ss.SSS')}`);
  }

  return fixedTranscription;
}



async function process(videoUrl: string, happenedAt: string, legislativeBranch: 'senate' | 'congress', outputPath?: string | null): Promise<ResumeOutput> {
  let output = {}
  // try {
  let duration;

  const videoId = videoUrl.split('v=')[1];

  if (!outputPath || (outputPath && !fs.existsSync(outputPath))) {
    console.log('🎬 Downloading audio from YouTube...');
    [outputPath, duration] = await functions.download(videoUrl);
    console.log(`📂 Output found at: ${outputPath}`);
    console.log(`⏱️ Duration: ${duration!.toFormat('hh:mm:ss')}`);
  }

  const transcriptionPath = `${outputPath}/transcription.vtt`;
  const resumePath = `${outputPath}/resume.txt`;

  let transcription = '';
  let resume = '';

  if (fs.existsSync(transcriptionPath)) {
    console.log('📝 Transcription already exists, skipping transcription...');
    transcription = fs.readFileSync(transcriptionPath, 'utf-8');
    transcription = fixTimestamps(transcription)
  } else {
    console.log('📝 Transcribing audio...');
    for (const filename of fs.readdirSync(outputPath!)) {
      console.log(`🔈 Transcribing file: ${filename}`);
      transcription += await functions.transcribe(`${outputPath}/${filename}`);
    }

    console.log(`📝 Writing transcription to file ${transcriptionPath} with size of ${transcription.length}`);

    transcription = transcription.replace(/WEBVTT\n/g, '').replace(/\n{3,}/g, '\n\n');
    transcription = fixTimestamps(transcription)
    fs.writeFileSync(transcriptionPath, transcription);
  }


  await functions.persist(videoId, transcription, resume, happenedAt, legislativeBranch === 'senate')

  if (fs.existsSync(resumePath)) {
    console.log('📝 Resume already exists, skipping resume...');
    resume = fs.readFileSync(resumePath, 'utf-8');
  } else {
    console.log(`📝 Generating resume for transcription of the size of ${transcription.length}`);
    resume = await functions.summarize(videoId);
    fs.writeFileSync(resumePath, resume);
  }

  await functions.persist(videoId, transcription, resume, happenedAt, legislativeBranch === 'senate')

  console.log('✅ Done!');
  output = {
    transcription,
    resume,
  }

  // } catch (error) {
  //   console.error(`❌ Error: ${error}`);
  //   output = {
  //     error
  //   }
  // }

  return output;
}


export default process;
