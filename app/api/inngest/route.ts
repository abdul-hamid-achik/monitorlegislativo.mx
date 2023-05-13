// import * as functions from "@/lib/functions";
import { inngest } from "@/lib/inngest";
import { serve } from "inngest/next";

export const runtime = "nodejs";

const createCaptions = inngest.createFunction({
  name: "Creando Subtitulos para video"
}, {
  event: "app/create-captions"
}, async ({ event: { data: { videoId } } }) => {

  // await functions.process(videoId)
});

export const { GET, POST } = serve(inngest, [createCaptions]);
