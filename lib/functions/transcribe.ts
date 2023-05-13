import { openai } from '@/lib/ai';
import fs from 'fs';
import { Duration } from 'luxon';
import * as readline from 'readline';

function fixTimestamps(inputFile: string, outputFile: string) {
  const fileStream = fs.createReadStream(inputFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const writeStream = fs.createWriteStream(outputFile);
  let currentOffset = Duration.fromMillis(0);
  let lastEnd = Duration.fromMillis(0);
  const resetThreshold = Duration.fromObject({ seconds: 10 });

  rl.on('line', (line) => {
    const match = line.match(/^(\d{2}:\d{2}:\d{2}.\d{3}) --> (\d{2}:\d{2}:\d{2}.\d{3})$/);
    if (match) {
      let start = Duration.fromISOTime(match[1]);
      let end = Duration.fromISOTime(match[2]);

      if (start < resetThreshold) {
        currentOffset = lastEnd;
      }

      const newStart = start.plus(currentOffset);
      const newEnd = end.plus(currentOffset);

      lastEnd = newEnd;

      writeStream.write(`${newStart.toFormat('hh:mm:ss.SSS')} --> ${newEnd.toFormat('hh:mm:ss.SSS')}\n`);
    } else {
      writeStream.write(line + '\n');
    }
  });

  rl.on('close', () => {
    writeStream.close();
  });
}


async function transcribe(path: string): Promise<string> {
  console.log(`🔈 Sending audio from ${path} to Whisper ASR API for transcription...`);

  let transcription = 'WEBVTT\n\n';
  let subtitles = `${path}/subtitles.vtt`;
  if (fs.existsSync(subtitles)) {
    console.log('📝 Subtitles already exist, skipping transcription');
    transcription = fs.readFileSync(subtitles, 'utf-8');
  } else {
    console.log('📝 Transcribing audio...');

    const files = fs.readdirSync(path).sort();
    for (const filename of files) {
      console.log(`🔈 Transcribing file: ${filename}`);

      const result = await openai.createTranscription(
        fs.createReadStream(`${path}/${filename}`) as unknown as File,
        'whisper-1',
        '',
        'vtt',
        0.2,
        'es',
      );

      let fileTranscription = (result.data as unknown as string).replace(/WEBVTT\n\n/, '');

      transcription += fileTranscription;
    }

    if (transcription.length === 0) {
      console.error('❌ Error transcribing audio: No transcription returned from API');
      return '';
    }

    fs.writeFileSync(subtitles, transcription);
  }

  fixTimestamps(subtitles, subtitles);

  return transcription;
}

export default transcribe;
