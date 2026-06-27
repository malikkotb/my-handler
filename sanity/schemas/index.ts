import { article } from "./documents/article";
import { articleCategory } from "./documents/article-category";
import { contactFormSubmission } from "./documents/contact-form-submission";
import { event } from "./documents/event";
import { page } from "./documents/page";
import { redirect } from "./documents/redirect";
import { site } from "./documents/site";
import { appColor } from "./fields/app-color";
import { aspectRatio } from "./fields/aspect-ratio";
import { lottieOptions } from "./fields/lottie-options";
import { riveOptions } from "./fields/rive-options";
import { seoMetadata } from "./fields/seo-metadata";
import { videoOptions } from "./fields/video-options";
import { sections } from "./page-sections";
// PLOP: Add Import

// All exported schema types will be added to Sanity as first-class citizens.
export const schemaTypes = [
  site,
  redirect,
  page,
  contactFormSubmission,
  article,
  articleCategory,
  event,
  seoMetadata,
  aspectRatio,
  videoOptions,
  riveOptions,
  lottieOptions,
  appColor,
  // PLOP: Add Export
  ...sections,
];
