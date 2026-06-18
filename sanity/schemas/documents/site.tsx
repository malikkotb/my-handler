import { defineArrayMember, defineField, defineType } from "sanity";
import { createLinkField } from "../fields/create-link";
import { createRichTextField } from "../fields/create-rich-text";

export const site = defineType({
  __experimental_formPreviewTitle: false,
  name: "site",
  type: "document",
  title: "Site",
  icon: () => <>🖥</>,
  groups: [
    { name: "site", title: "Site", icon: () => <>🖥</>, default: true },
    { name: "security", title: "Security", icon: () => <>🔐</> },
    { name: "seo", title: "SEO", icon: () => <>🔍</> },
    { name: "contacts", title: "Contacts", icon: () => <>📞</> },
    { name: "header", title: "Header", icon: () => <>🔗</> },
    { name: "footer", title: "Footer", icon: () => <>👟</> },
    { name: "emailNotifications", title: "Email Notifications", icon: () => <>✉️</> },
  ],
  fields: [
    defineField({
      group: "site",
      name: "name",
      type: "string",
      title: "Site Name",
      initialValue: "The Content Architecture",
      validation: (R) => R.required(),
    }),
    defineField({
      group: "site",
      name: "redirects",
      type: "array",
      title: "Redirects",
      description: "Define site-wide redirects here.",
      of: [{ type: "redirect" }],
      // Redirects must have unique `from` values.
      validation: (R) => {
        return R.custom((redirects) => {
          if (!redirects) {
            return true;
          }

          const seen = new Set();
          for (const item of redirects) {
            // @ts-expect-error The prop is part of the redirect schema.
            const from = item?.from;

            if (!from) {
              continue;
            }

            if (seen.has(from)) {
              return `Duplicate redirect detected for "${from}".`;
            }

            seen.add(from);
          }

          return true;
        });
      },
    }),
    defineField({
      group: "security",
      name: "basicAuth",
      type: "object",
      title: "HTTP Basic Auth",
      description:
        "Toggles only. Set BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD in your deployment environment (not in the CMS).",
      fields: [
        defineField({
          name: "siteWideEnabled",
          type: "boolean",
          title: "Protect entire site",
          description:
            "When enabled, every page (except Studio and API routes) requires Basic Auth using env credentials. When off, only individual pages or articles with “Password protect” are gated.",
          initialValue: false,
          options: { layout: "switch" },
        }),
      ],
    }),
    defineField({
      group: "site",
      name: "notFound",
      type: "object",
      fields: [
        createRichTextField({ title: "Text", validation: (R) => R.required() }),
        createLinkField({ title: "Link", validation: (R) => R.required() }),
        defineField({
          name: "showHeader",
          type: "boolean",
          title: "Show site header",
          description: "Renders the site header (navigation) on this page.",
          initialValue: true,
          options: { layout: "switch" },
        }),
        defineField({
          name: "showFooter",
          type: "boolean",
          title: "Show site footer",
          description: "Renders the site footer on this page.",
          initialValue: true,
          options: { layout: "switch" },
        }),
      ],
    }),
    defineField({
      group: "header",
      name: "header",
      type: "object",
      fields: [
        defineField({
          name: "links",
          type: "array",
          title: "Links",
          validation: (R) => R.required().min(1),
          of: [createLinkField({ title: "Link", validation: (R) => R.required() })],
        }),
      ],
    }),
    defineField({
      group: "contacts",
      name: "contacts",
      type: "array",
      title: "Contacts",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "name",
              type: "string",
              validation: (R) => R.required(),
            }),
            createLinkField({ title: "Link", validation: (R) => R.required() }),
          ],
        }),
      ],
    }),
    defineField({
      group: "footer",
      name: "footer",
      type: "object",
      fields: [
        defineField({
          name: "links",
          type: "array",
          title: "Links",
          validation: (R) => R.required().min(1),
          of: [createLinkField({ title: "Link", validation: (R) => R.required() })],
        }),
        defineField({
          name: "legalLinks",
          type: "array",
          title: "Legal Links",
          of: [createLinkField({ title: "Link", validation: (R) => R.required() })],
        }),
      ],
    }),
    defineField({
      group: "seo",
      name: "seoMetadata",
      type: "seoMetadata",
    }),
    defineField({
      group: "seo",
      name: "favicon",
      type: "object",
      title: "Favicon",
      description:
        "Tab icons per system color scheme. Each image is cropped to a square when served. Upload one asset to use everywhere, or two when you need different art for light vs dark browser chrome.",
      fields: [
        defineField({
          name: "iconLight",
          type: "image",
          title: "Light scheme",
          description:
            "Used when the system prefers light mode (or as the only icon if dark is empty). Non-square images are cropped to a centered square.",
          options: {
            hotspot: false,
          },
        }),
        defineField({
          name: "iconDark",
          type: "image",
          title: "Dark scheme",
          description:
            "Used when the system prefers dark mode (optional if one icon works in both). Non-square images are cropped to a centered square.",
          options: {
            hotspot: false,
          },
        }),
      ],
    }),
    defineField({
      group: "emailNotifications",
      name: "contactFormNotificationEmails",
      type: "array",
      title: "Contact Form Notifications",
      description: "Emails to notify when the contact form is submitted.",
      of: [
        defineArrayMember({
          type: "string",
          validation: (R) => R.required().email(),
        }),
      ],
    }),
  ],
});
