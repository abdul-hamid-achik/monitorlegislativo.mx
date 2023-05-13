import * as functions from '@/lib/functions';
import { DateTime } from 'luxon';
async function main(videoId: string, happenedAt: string, legislativeBranch: 'congress' | 'senate', outputPath?: string | null): Promise<void> {
  // try {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  console.log(`🔗 YouTube URL: ${videoUrl}`)

  const { transcription, resume, error } = await functions.process(videoUrl, outputPath);

  if (!transcription || !resume) {
    throw new Error(error)
  }

  console.log(`📝 Transcription: ${transcription?.length}`)
  console.log(`📝 Resume: ${resume?.length}`)

  // } catch (error) {
  //   console.error(`❌ Error: ${error}`);
  // }
}


// const videoId = 'hAQBuAa8Dxk' || 'v0wqwl5sP9s';
let [videoId, happenedAt, legislativeBranch, outputPath] = process.argv.slice(2);

happenedAt = DateTime.fromFormat(happenedAt, "dd 'de' MMMM 'del' yyyy", { locale: "es" }).toISO()!

if (outputPath) console.log(`📂 Output path: ${outputPath}`)
if (!happenedAt) throw Error('Invalid Date, please add a valid date when this session happened')
else console.log(`Happened At: ${happenedAt}`)
if (!legislativeBranch) throw Error("please add either congress or senate in order to do the analizis")
else console.log(`Legislative Branch: ${legislativeBranch}`)
main(videoId, happenedAt, legislativeBranch as 'senate' | 'congress', outputPath).catch(console.error);

