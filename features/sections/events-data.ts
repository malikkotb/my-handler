import type { RichTextFragmentResult } from "~/features/rich-text/fragment";

export type EventImage = {
  src: string;
  alt: string;
  orientation: "landscape" | "portrait";
};

export type EventItem = {
  id: string;
  client: string;
  type: string;
  location: string;
  description: string;
  descriptionRichText: RichTextFragmentResult | null;
  images: EventImage[];
};
