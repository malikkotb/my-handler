import type { RichTextFragmentResult } from "~/features/rich-text/fragment";

export type EventImage = {
  src: string;
  alt: string;
  orientation: "landscape" | "portrait";
};

export type EventItem = {
  id: string;
  client: string;
  location: string;
  pressLink: string | null;
  descriptionRichText: RichTextFragmentResult | null;
  images: EventImage[];
};
