export type EventImage = {
  src: string;
  alt: string;
  orientation: "landscape" | "portrait";
};

export type EventItem = {
  id: number;
  client: string;
  type: string;
  location: string;
  description: string;
  images: EventImage[];
};

const eventImages: EventImage[] = [
  {
    src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    alt: "Crowd enjoying a live event",
    orientation: "portrait",
  },
  {
    src: "https://images.unsplash.com/photo-1507501336603-6e31db2be093?auto=format&fit=crop&w=1200&q=80",
    alt: "Styled event table with floral arrangements",
    orientation: "portrait",
  },
  {
    src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
    alt: "Luxury event venue prepared for guests",
    orientation: "landscape",
  },
  {
    src: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80",
    alt: "Guests dancing under colorful event lighting",
    orientation: "portrait",
  },
];

export const EVENTS: EventItem[] = [
  {
    id: 1,
    client: "BNP PARIBAS",
    type: "Corporate",
    location: "Marbella, Spain",
    description:
      "A tailored corporate gathering designed to bring guests together through thoughtful hospitality and carefully considered details.",
    images: eventImages,
  },
  {
    id: 2,
    client: "RABANNE FOR BEYONCÉ",
    type: "Luxury",
    location: "Paris, France",
    description: "Organised a “Get Ready” before the concert to push content creation over two evenings.",
    images: eventImages,
  },
  {
    id: 3,
    client: "THEODORA – MUGLER",
    type: "Luxury",
    location: "Paris, France",
    description: "An immersive launch experience pairing expressive scenography with a precise guest journey.",
    images: eventImages,
  },
  {
    id: 4,
    client: "RABANNE FOR WALLETTE",
    type: "Luxury",
    location: "Paris, France",
    description: "An intimate brand moment shaped around bold visual storytelling, music, and curated hospitality.",
    images: eventImages,
  },
  {
    id: 5,
    client: "BNP PARIBAS",
    type: "Corporate",
    location: "Marbella, Spain",
    description:
      "A tailored corporate gathering designed to bring guests together through thoughtful hospitality and carefully considered details.",
    images: eventImages,
  },
  {
    id: 6,
    client: "RABANNE FOR BEYONCÉ",
    type: "Luxury",
    location: "Paris, France",
    description: "Organised a “Get Ready” before the concert to push content creation over two evenings.",
    images: eventImages,
  },
  {
    id: 7,
    client: "THEODORA – MUGLER",
    type: "Luxury",
    location: "Paris, France",
    description: "An immersive launch experience pairing expressive scenography with a precise guest journey.",
    images: eventImages,
  },
  {
    id: 8,
    client: "RABANNE FOR WALLETTE",
    type: "Luxury",
    location: "Paris, France",
    description: "An intimate brand moment shaped around bold visual storytelling, music, and curated hospitality.",
    images: eventImages,
  },
];
