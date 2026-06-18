"use client";

import { useLenis } from "lenis/react";
import type * as ReactTypes from "react";
import {
  isLocalNavigationHref,
  isSamePageHash,
  isSamePageReload,
  shouldPreserveDefault,
  shouldSkipLinkViewTransition,
  Link as VTLink,
} from "~/features/view-transition/app-view-transitions";
import { useViewTransition } from "~/features/view-transition/context";

export function Link({ onClick, href, as, ...rest }: ReactTypes.ComponentProps<typeof VTLink>) {
  const view = useViewTransition();
  const lenis = useLenis();

  const handleClick = (e: ReactTypes.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);

    if (e.defaultPrevented) {
      return;
    }

    if (!isLocalNavigationHref(href, as)) {
      return;
    }

    if (shouldPreserveDefault(e)) {
      return;
    }

    // Same-page hash/anchor: let Lenis scroll to the section, never run a transition.
    if (isSamePageHash(href, as)) {
      return;
    }

    // A link to the page we are already on: scroll to top instead of replaying a transition.
    if (isSamePageReload(href, as)) {
      e.preventDefault();

      if (lenis) {
        lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      return;
    }

    if (shouldSkipLinkViewTransition(href, as) || !("startViewTransition" in document)) {
      return;
    }

    view.beginViewTransition();
  };

  return <VTLink {...rest} href={href} as={as} onClick={handleClick} />;
}
