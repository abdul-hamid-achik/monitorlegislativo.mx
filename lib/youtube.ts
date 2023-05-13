import { env } from '@/env.mjs';
import { google } from 'googleapis';

export const youtube = google.youtube({
  version: 'v3',
  auth: env.YOUTUBE_API_KEY,
});


export const CONGRESS_CHANNEL_ID = "UCkLEVSsqQSCZ8pnyiLyGn3w"
export const SENATE_CHANNEL_ID = "UCoeJxDc717MNVJtUsQW20Qg"
