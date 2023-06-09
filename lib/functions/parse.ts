import { DateTime } from "luxon";

interface ParsedSegment {
  startAt: string;
  endAt: string;
  content: string;
}

function parse(text: string): ParsedSegment[] {
  const segmentMap = new Map<string, ParsedSegment>();

  text.replace(/WEBVTT\n\n/gm, "")
    .split("\n\n")
    .forEach((paragraph) => {
      const regex = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})\n(.+)/;
      const match = paragraph.match(regex);

      if (match) {
        const startAt = match[1];
        const endAt = match[2];
        const text = match[3];

        // Validate timestamps using Luxon
        const startDateTime = DateTime.fromFormat(startAt, "hh:mm:ss.SSS");
        const endDateTime = DateTime.fromFormat(endAt, "hh:mm:ss.SSS");

        if (startDateTime.isValid && endDateTime.isValid) {
          const segment = {
            startAt,
            endAt,
            content: text,
          }

          const key = `${startAt}-${endAt}-${text}`;
          segmentMap.set(key, segment);
        }
      }
    });

  return Array.from(segmentMap.values());
}

export default parse;
