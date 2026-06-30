import { defineArrayMember, defineField, defineType } from "sanity";

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
