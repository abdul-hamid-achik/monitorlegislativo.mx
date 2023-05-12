"use server"
import { youtube } from '@/lib/youtube';
import { Channels } from '@/types/legislative';

async function getChannelId(username: Channels) {

  console.log('Getting channel id', username)
  const res = await youtube.channels.list({
    forUsername: username,
    part: ['id'],
  });
  console.log('findme', res.data)
  const channel = res?.data?.items?.[0];
  return channel ? channel.id : null;
}

export async function getLatestVideos(username: Channels) {
  console.log('Getting latest videos', username)
  const channelId = await getChannelId(username);
  if (!channelId) {
    console.error('Channel not found');
    return;
  }
  const res = await youtube.search.list({
    channelId: channelId,
    maxResults: 25,
    order: 'date',
    part: ['snippet'],
  });

  const videos = res.data.items || [];

  return videos;
}
