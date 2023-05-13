import { Inngest } from "inngest";

type CreateCaptions = {
  name: "app/create-captions";
  data: {
    videoId: string;
  },
}

type Events = {
  "app/create-captions": CreateCaptions;
}

export const inngest = new Inngest<Events>({
  name: "Monitor Legislativo",
});
