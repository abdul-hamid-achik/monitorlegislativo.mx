import { prisma } from "@/lib/prisma";
import { youtube } from "@/lib/youtube";
import { kv } from "@vercel/kv";
import superjson from "superjson";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  let videoIds: string[] | null = await kv.get(`search-cache-${q}`);

  if (!videoIds) {
    const results = await prisma.subtitle.findMany({
      where: {
        content: {
          search: q
        },
      },
      select: {
        videoId: true
      }
    });

    videoIds = [...new Set(results.map(result => result.videoId))];

    await kv.set(`search-cache-${q}`, videoIds, {
      // ex: 3600 // Cache for 1 hour.
      ex: 3 * 60 * 60 * 1000, // this is so much time because we don't want to hit the youtube api limit
      nx: true
    });
  }

  const videos = await youtube.videos.list({
    id: videoIds,
    part: ['snippet']
  });

  return new Response(superjson.stringify(videos), {
    headers: {
      'content-type': 'application/json'
    }
  });
}
