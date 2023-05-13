import * as functions from '@/lib/functions';
async function main(videoId: string, outputPath?: string | null): Promise<void> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  console.log(`🔗 YouTube URL: ${videoUrl}`)

  const { transcription, resume, error } = await functions.process(videoUrl, outputPath);

  if (!transcription || !resume) {
    throw new Error(error)
  }

  console.log(`📝 Transcription: ${transcription?.length}`)
  console.log(`📝 Resume: ${resume?.length}`)
}


let [videoId, outputPath] = process.argv.slice(2);

if (outputPath) console.log(`📂 Output path: ${outputPath}`)
main(videoId, outputPath).catch(console.error);

