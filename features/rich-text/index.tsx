// PLOP: Add Import
import { PortableText, type PortableTextReactComponents } from "@portabletext/react";
import { stegaClean } from "next-sanity";
import type * as React from "react";
import { AnimatedText, type AnimatedTextProps } from "~/components/animated-text";
import { MediaBlock } from "~/features/rich-text/blocks/media-block";
import type { RichTextFragmentResult } from "~/features/rich-text/fragment";
import { SanityLink } from "~/features/sanity/link";
import { SanityMedia } from "~/features/sanity/media";
import type { MediaFragmentResult } from "~/features/sanity/media/fragment";
import { cx } from "~/features/style/utils";

const blockFields = {
  mediaBlock: MediaBlock,
  // PLOP: Add Export
};

const RICH_TEXT_SPLIT_SELECTOR = "[data-text]";

function getIndentStyle(
  value: { markDefs?: Array<{ _type: string; widthPercent?: number }> } | undefined
): React.CSSProperties | undefined {
  const mark = value?.markDefs?.find((m) => m._type === "indentField");

  if (!mark || typeof mark.widthPercent !== "number") {
    return undefined;
  }

  return { textIndent: `${mark.widthPercent}%` };
}

export type RichTextTone = "light" | "dark";

const TONE_TEXT: Record<RichTextTone, string> = {
  dark: "text-white/75",
  light: "text-ink/75",
};

const TONE_MUTED: Record<RichTextTone, string> = {
  dark: "text-white/50",
  light: "text-ink/50",
};

const TONE_MARKER: Record<RichTextTone, string> = {
  dark: "text-white/40",
  light: "text-ink/40",
};

function getRichTextComponents(tone: RichTextTone): Partial<PortableTextReactComponents> {
  return {
    hardBreak: () => <br />,
    types: {
      ...blockFields,
      inlineMediaField: ({ value }) => {
        const media = value.media as MediaFragmentResult | null;

        if (!media) {
          return null;
        }

        return (
          <SanityMedia
            media={media}
            width={100}
            autoPlay
            loop
            videoProps={{ noControls: true, muted: true, playsInline: true }}
            className="inline-flex h-[1em] w-auto align-middle"
          />
        );
      },
    },
    marks: {
      em: ({ children }) => {
        return <em className="italic">{children}</em>;
      },
      strong: ({ children }) => {
        return <strong className="font-bold">{children}</strong>;
      },
      code: ({ children }) => {
        return <code className="rounded-4 bg-white/10 px-[0.4em] py-[0.1em] font-mono text-[0.9em]">{children}</code>;
      },
      underline: ({ children }) => {
        return <em className="not-italic underline underline-offset-2">{children}</em>;
      },
      sup: ({ children }) => {
        // Raise via positioning, not vertical-align, so the superscript does not inflate line-height.
        return <sup className="relative -top-[0.4em] align-baseline text-[0.6em] leading-[0]">{children}</sup>;
      },
      textColorField: ({ value, children }) => {
        return <span style={{ color: stegaClean(value.color) }}>{children}</span>;
      },
      highlightColorField: ({ value, children }) => {
        return <span style={{ backgroundColor: stegaClean(value.color) }}>{children}</span>;
      },
      linkField: ({ value, children }) => {
        return (
          <SanityLink
            link={value}
            className="border-white/40 border-b border-dashed no-underline transition-colors duration-160 ease-out hover:border-white"
          >
            {children}
          </SanityLink>
        );
      },
      indentField: ({ children }) => <>{children}</>,
    },
    block: {
      normal: ({ children, value }) => {
        return (
          <div className={cx(TONE_TEXT[tone], "empty:hidden")} data-text style={getIndentStyle(value)}>
            {children}
          </div>
        );
      },
      h2: ({ children, value }) => {
        return (
          <h2 className="mt-24 text-balance text-headline-10 first:mt-0" data-text style={getIndentStyle(value)}>
            {children}
          </h2>
        );
      },
      h3: ({ children, value }) => {
        return (
          <h3 className="mt-12 text-balance text-body-20 first:mt-0" data-text style={getIndentStyle(value)}>
            {children}
          </h3>
        );
      },
      h4: ({ children, value }) => {
        return (
          <h4
            className={cx("font-pixel-square text-caption uppercase tracking-wider", TONE_MUTED[tone])}
            data-text
            style={getIndentStyle(value)}
          >
            {children}
          </h4>
        );
      },
      caption: ({ children, value }) => {
        return (
          <div
            className={cx("font-pixel-square text-caption empty:hidden", TONE_MUTED[tone])}
            data-text
            style={getIndentStyle(value)}
          >
            {children}
          </div>
        );
      },
    },
    list: {
      bullet: ({ children }) => {
        return <ul className={cx("flex list-none flex-col gap-8", TONE_TEXT[tone])}>{children}</ul>;
      },
      number: ({ children }) => {
        return <ol className={cx("flex list-none flex-col gap-8", TONE_TEXT[tone])}>{children}</ol>;
      },
    },
    listItem: {
      bullet: ({ children, value }) => {
        return (
          <li className="flex items-start gap-8">
            <span className={cx("list-inside list-disc", TONE_MARKER[tone])}>•</span>
            <div className="min-w-0 flex-1" data-text style={getIndentStyle(value)}>
              {children}
            </div>
          </li>
        );
      },
      number: ({ children, index, value }) => {
        return (
          <li className="flex items-start gap-8">
            <span className={cx("list-inside list-decimal tabular-nums", TONE_MARKER[tone])}>{index + 1}.</span>
            <div className="min-w-0 flex-1" data-text style={getIndentStyle(value)}>
              {children}
            </div>
          </li>
        );
      },
    },
  };
}

export type SanityRichTextProps = {
  value?: RichTextFragmentResult | null;
  className?: string;
  as?: "span" | "div";
  /** Text color palette to render with. Defaults to "dark" (white text) for dark-background sections. */
  tone?: RichTextTone;
};

/** Portable Text from Sanity — static wrapper, always visible. */
export function SanityRichText({ value, className, as = "div", tone = "dark" }: SanityRichTextProps) {
  if (!value) {
    return null;
  }

  const body = <PortableText value={value} onMissingComponent={false} components={getRichTextComponents(tone)} />;
  const El = as === "div" ? "div" : "span";

  return <El className={cx("flex w-full flex-col gap-[1em]", className)}>{body}</El>;
}

export type AnimatedSanityRichTextProps = {
  value?: RichTextFragmentResult | null;
  className?: string;
  as?: "span" | "div";
  /** Text color palette to render with. Defaults to "dark" (white text) for dark-background sections. */
  tone?: RichTextTone;
} & Omit<AnimatedTextProps, "children">;

/** Same blocks as `SanityRichText`, wrapped in `AnimatedText`. */
export function AnimatedSanityRichText({
  value,
  className,
  as = "div",
  tone = "dark",
  ...animatedTextProps
}: AnimatedSanityRichTextProps) {
  if (!value) {
    return null;
  }

  const body = <PortableText value={value} onMissingComponent={false} components={getRichTextComponents(tone)} />;

  return (
    <AnimatedText
      {...animatedTextProps}
      as={as}
      splitSelector={RICH_TEXT_SPLIT_SELECTOR}
      className={cx("flex w-full flex-col gap-[1em] [&_[data-text]>*:not(:first-child)]:[text-indent:0]", className)}
    >
      {body}
    </AnimatedText>
  );
}
