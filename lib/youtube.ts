import { env } from '@/env.mjs';
import { google } from 'googleapis';

export const youtube = google.youtube({
  version: 'v3',
  auth: env.YOUTUBE_API_KEY,
});
