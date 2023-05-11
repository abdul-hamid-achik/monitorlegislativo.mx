import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { Duration } from 'luxon';
import os from 'os';
import ytdl from 'ytdl-core';

ffmpeg.setFfmpegPath(ffmpegPath as string);

async function download(videoUrl: string): Promise<[string, Duration] | []> {
  return new Promise(async (resolve, reject) => {
    try {
      if (ytdl.validateURL(videoUrl)) {
        const videoId = ytdl.getURLVideoID(videoUrl);
        const outputPath = `${os.tmpdir()}/${videoId}`;

        if (fs.existsSync(outputPath)) {
          fs.rmSync(`${os.tmpdir()}/${videoId}`, { recursive: true });
        }

        fs.mkdirSync(`${os.tmpdir()}/${videoId}`);

        console.log(`📂 Created temporary directory: ${outputPath}`)

        const videoInfo = await ytdl.getInfo(videoUrl);
        const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio', filter: 'audioonly' });

        if (audioFormat) {
          console.log(`🎧 Found suitable audio format: ${audioFormat.container}`);

          const audioStream = ytdl.downloadFromInfo(videoInfo, { format: audioFormat });

          ffmpeg(audioStream)
            .inputFormat(audioFormat.container)
            .audioCodec('libmp3lame')
            .audioBitrate(192)
            .addOutputOptions([
              '-f segment',
              '-segment_time 300',
              '-reset_timestamps 1',
            ]).output(`${outputPath}/output_%03d.mp3`)
            .on('start', () => {
              console.log('⏳ Converting to audio... This may take a while');
            })
            .on('progress', (progress) => {
              process.stdout.write(`🚀 Progress: ${progress.timemark}\r`);
            })
            .on('end', () => {
              console.log(`\n✅ Audio successfully downloaded and saved as ${outputPath}`);
              ytdl.getInfo(videoUrl).then(info =>
                resolve([outputPath, Duration.fromMillis(parseInt(info.formats[0].approxDurationMs!))])
              )
            })
            .on('error', (error: Error) => {
              console.error(`❌ Error downloading audio: ${error}`);
              reject([]);
            })
            .run();
        } else {
          console.error('❌ Unable to find suitable audio format');
          reject(new Error('Unable to find suitable audio format'));
        }
      } else {
        console.error('❌ Invalid YouTube URL');
        reject(new Error('Invalid YouTube URL'));
      }
    } catch (error) {
      console.error(`❌ Error downloading audio: ${error}`);
      reject(error);
    }
  });
}


export default download;
