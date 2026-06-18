"use client";

import { usePathname } from "next/navigation";
import { AnimatedText } from "~/components/animated-text";
import { SanityLink } from "~/features/sanity/link";
import type { LinkFragmentResult } from "~/features/sanity/link/fragment";
import { cx } from "~/features/style/utils";

export function SiteFooterLink({ link, animationDelay }: { link: LinkFragmentResult; animationDelay?: number }) {
  const pathname = usePathname();
  const isActive = pathname === link.href.split(/[?#]/)[0];

  return (
    <SanityLink
      link={link}
      aria-current={isActive ? "page" : undefined}
      className={cx(
        "text-body-10 text-white/75 transition-colors duration-200 ease-out hover:text-white",
        isActive && "text-white underline underline-offset-4"
      )}
    >
      <AnimatedText animationDelay={animationDelay} viewport={{ margin: "0px" }}>
        {link.text}
      </AnimatedText>
    </SanityLink>
  );
}
