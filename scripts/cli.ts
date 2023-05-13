import * as functions from '@/lib/functions';
import fs from 'fs';

async function main(videoId: string, outputPath?: string | null): Promise<void> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  console.log(`🔗 YouTube URL: ${videoUrl}`)

  const { transcription, error } = await functions.process(videoUrl, outputPath);

  if (!transcription) {
    throw new Error(error)
  }

  console.log(`📝 Subtitles: ${transcription?.length}`)

  await functions.persist(videoId, transcription);

  console.log(`📂 Saved content into the db for video: ${videoId}`);

  const resumePath = `${outputPath}/resume.txt`;
  let resume = '';

  if (fs.existsSync(resumePath)) {
    console.log('📝 Resume already exists, skipping resume...');
    resume = fs.readFileSync(resumePath, 'utf-8');
  } else {
    console.log(`📝 Generating resume for transcription of the size of ${transcription.length}`);
    resume = await functions.summarize(videoId);
    fs.writeFileSync(resumePath, resume);
  }


  console.log(resume)
  console.log(`📝 Resume: ${resume?.length}`)

  console.log('✅ Done!');
}


let [videoId, outputPath] = process.argv.slice(2);

if (outputPath) console.log(`📂 Output path: ${outputPath}`)
main(videoId, outputPath)

