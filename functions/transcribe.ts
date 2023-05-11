import { openai } from '@/lib/ai';
import fs from 'fs';

async function transcribe(filename: string): Promise<string> {
  let result
  try {

    console.log(`🔈 Sending audio from ${filename} to Whisper ASR API for transcription...`);

    let transcription = ''

    result = await openai.createTranscription(
      fs.createReadStream(filename) as unknown as File,
      'whisper-1',
      '',
      'vtt',
      0.3,
      'es',
    );

    transcription = result.data as unknown as string;

    console.log('📝 Transcription received!');
    return transcription;
  } catch (error: any) {
    console.error(`❌ Error transcribing audio: ${error?.response?.data?.error?.message || error}`);
    return '';
  }
}

export default transcribe;
