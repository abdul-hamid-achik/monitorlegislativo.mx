import * as functions from '@/lib/functions';
import fs from 'fs';

type ResumeOutput = {
  transcription?: string,
  resume?: string,
  error?: any
}



async function process(videoUrl: string, outputPath?: string | null): Promise<ResumeOutput> {
  let output = {}

  const videoId = videoUrl.split('v=')[1];

  if (!outputPath || (outputPath && !fs.existsSync(outputPath))) {
    console.log('🎬 Downloading audio from YouTube...');
    await functions.download(videoUrl);
    outputPath = `.tmp/${videoId}`;
    console.log(`📂 Output found at: ${outputPath}`);
  }

  const transcriptionPath = `${outputPath}/transcription.vtt`;

  let transcription = '';


  if (fs.existsSync(transcriptionPath)) {
    console.log('📝 Transcription already exists, skipping transcription...');
    transcription = fs.readFileSync(transcriptionPath, 'utf-8');
  } else {
    console.log('📝 Transcribing audio...');
    transcription = await functions.transcribe(outputPath)

  }

  output = {
    transcription,
  }

  console.log('✅ Done!');

  return output;
}


export default process;
