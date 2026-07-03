import { defineArrayMember, defineField, defineType } from "sanity";
import { createRichTextField } from "../fields/create-rich-text";

export const event = defineType({
  name: "event",
  type: "document",
  title: "Event",
  icon: () => <>🎉</>,
  fields: [
    defineField({
      name: "client",
      type: "string",
      title: "Client",
    }),
    defineField({
      name: "clientFrench",
      type: "string",
      title: "Client (French)",
    }),
    defineField({
      name: "type",
      type: "string",
      title: "Type",
    }),
    defineField({
      name: "location",
      type: "string",
      title: "Location",
    }),
    defineField({
      name: "locationFrench",
      type: "string",
      title: "Location (French)",
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      rows: 4,
    }),
    defineField({
      name: "descriptionFrench",
      type: "text",
      title: "Description (French)",
      rows: 4,
    }),
    {
      ...createRichTextField({
        name: "descriptionRichText",
        title: "Description - Rich Text",
        description: "Optional. When set, this replaces the plain-text Description above.",
        lists: true,
      }),
      options: { collapsible: true, collapsed: true },
    },
    {
      ...createRichTextField({
        name: "descriptionFrenchRichText",
        title: "Description French - Rich Text",
        description: "Optional. When set, this replaces the plain-text Description (French) above.",
        lists: true,
      }),
      options: { collapsible: true, collapsed: true },
    },
    defineField({
      name: "images",
      type: "array",
      title: "Images",
      options: {
        layout: "grid",
      },
      of: [
        defineArrayMember({
          type: "image",
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "client",
      subtitle: "type",
      media: "images.0",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title ?? "Untitled event",
        subtitle,
        media,
      };
    },
  },
});
