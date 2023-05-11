import * as functions from '@/functions';
import fs from 'fs';
import { Duration } from 'luxon';

type ResumeOutput = {
  transcription?: string,
  resume?: string,
  error?: any
}

function fixTimestamps(transcription: string): string {
  const segments = transcription.split('WEBVTT');
  let fixedTranscription = 'WEBVTT\n';
  let timeOffset = Duration.fromMillis(0);

  for (const segment of segments) {
    if (segment.trim() === '') continue;
    const lines = segment.split('\n');
    const fixedLines = lines.map((line) => {
      const timeRegex = /^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})$/;
      const match = line.match(timeRegex);

      if (match) {
        const startTime = Duration.fromISOTime(match[1]).plus(timeOffset).toFormat("hh:mm:ss.SSS");
        const endTime = Duration.fromISOTime(match[2]).plus(timeOffset).toFormat("hh:mm:ss.SSS");
        return `${startTime} --> ${endTime}`;
      }

      return line;
    });

    fixedTranscription += fixedLines.join('\n');
    timeOffset = timeOffset.plus({ seconds: 300 });
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
