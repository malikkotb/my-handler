import { defineArrayMember, defineField, defineType } from "sanity";
import { SANITY_SINGLETON_HOMEPAGE_ID } from "../../constants";
import { createPageBuilderField } from "../fields/create-page-builder";
import { createUriField } from "../fields/create-uri-field";

function isHomepageDocument(source: { _id?: unknown } | null | undefined): boolean {
  const raw = source?._id;

  if (typeof raw !== "string") {
    return false;
  }

  const id = raw.replace(/^drafts\./, "");
  return id === SANITY_SINGLETON_HOMEPAGE_ID;
}

export const page = defineType({
  __experimental_formPreviewTitle: false,
  name: "page",
  type: "document",
  title: "Page",
  icon: () => <>📄</>,
  groups: [
    { name: "page", title: "Page", icon: () => <>📄</>, default: true },
    // { name: "content", title: "Content", icon: () => <>🍱</> },
    { name: "homepage", title: "Homepage", icon: () => <>🏠</> },
    { name: "seo", title: "SEO", icon: () => <>🔍</> },
  ],
  fields: [
    defineField({
      group: "page",
      name: "title",
      type: "string",
      title: "Title",
      hidden: ({ parent }) => isHomepageDocument(parent),
      validation: (R) =>
        R.custom((value, context) => {
          if (isHomepageDocument(context.document)) {
            return true;
          }

          return typeof value === "string" && value.length > 0 ? true : "Required";
        }),
    }),
    createUriField({
      group: "page",
      source: "title",
      readOnly: ({ parent }) => isHomepageDocument(parent),
      validation: (R) => [
        R.required(),
        R.custom((value: { current?: string } | undefined, context) => {
          if (!isHomepageDocument(context.document)) {
            return true;
          }

          if (value?.current === "/") {
            return true;
          }

          return 'The homepage URI must be "/".';
        }),
      ],
    }),
    defineField({
      group: "page",
      name: "passwordProtected",
      type: "boolean",
      title: "Password protect",
      description:
        "When “Protect entire site” is off, only this URL requires Basic Auth (same BASIC_AUTH_* env credentials as site-wide). When site-wide protection is on, this is redundant.",
      initialValue: false,
      options: { layout: "switch" },
    }),
    defineField({
      group: "page",
      name: "showHeader",
      type: "boolean",
      title: "Show site header",
      description: "Renders the site header (navigation) on this page.",
      initialValue: true,
      options: { layout: "switch" },
    }),
    defineField({
      group: "page",
      name: "showFooter",
      type: "boolean",
      title: "Show site footer",
      description: "Renders the site footer on this page.",
      initialValue: true,
      options: { layout: "switch" },
    }),
    // createPageBuilderField({
    //   group: "content",
    // }),
    defineField({
      group: "homepage",
      name: "featuredEvents",
      type: "array",
      title: "Featured events",
      hidden: ({ parent }) => !isHomepageDocument(parent),
      of: [
        defineArrayMember({
          type: "object",
          name: "featuredEvent",
          title: "Featured event",
          fields: [
            defineField({
              name: "image",
              type: "image",
              title: "Image",
              options: {
                hotspot: true,
                accept: "image/*",
              },
            }),
            defineField({
              name: "name",
              type: "string",
              title: "Event name",
            }),
            defineField({
              name: "type",
              type: "string",
              title: "Event type",
            }),
            defineField({
              name: "typeFrench",
              type: "string",
              title: "Event type (French)",
            }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "type",
              media: "image",
            },
          },
        }),
      ],
    }),
    defineField({
      group: "homepage",
      name: "services",
      type: "array",
      title: "Services grid",
      hidden: ({ parent }) => !isHomepageDocument(parent),
      of: [
        defineArrayMember({
          type: "object",
          name: "service",
          title: "Service",
          fields: [
            defineField({
              name: "image",
              type: "image",
              title: "Image",
              options: {
                hotspot: true,
                accept: "image/*",
              },
            }),
            defineField({
              name: "name",
              type: "string",
              title: "Service name",
            }),
            defineField({
              name: "nameFrench",
              type: "string",
              title: "Service name (French)",
            }),
          ],
          preview: {
            select: {
              title: "name",
              media: "image",
            },
          },
        }),
      ],
    }),
    defineField({
      group: "seo",
      name: "seoMetadata",
      type: "seoMetadata",
      hidden: ({ parent }) => isHomepageDocument(parent),
    }),
  ],
});
