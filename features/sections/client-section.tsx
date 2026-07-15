"use client";

import { useTranslations } from "next-intl";
import * as React from "react";
import { AnimatedText } from "~/components/animated-text";
import { loadGsap } from "~/features/motion/gsap";
import { cx } from "~/features/style/utils";

type Client = {
  name: string;
  maskUrl: string;
};

const CLIENTS: Client[] = [
  { name: "BOUCHERON", maskUrl: "/logos/clients/boucheron.svg" },
  { name: "GUCCI", maskUrl: "/logos/clients/gucci.svg" },
  { name: "RABANNE", maskUrl: "/logos/clients/rabanne.svg" },
  { name: "LANCÔME", maskUrl: "/logos/clients/lancome.svg" },
  { name: "MUGLER", maskUrl: "/logos/clients/mugler.svg" },
  { name: "BNP PARIBAS", maskUrl: "/logos/clients/bnp-paribas.svg" },
  { name: "COMEXPOSIUM", maskUrl: "/logos/clients/comexposium.svg" },
  { name: "RUINART", maskUrl: "/logos/Ruinart.svg" },
  { name: "AXA", maskUrl: "/logos/clients/axa.svg" },
  { name: "BANQUE DE FRANCE", maskUrl: "/logos/clients/banque-de-france.svg" },
  { name: "LINDA FARROW", maskUrl: "/logos/clients/linda-farrow.svg" },
];

const HOMEPAGE_CLIENTS = CLIENTS.slice(0, 7);

const PREVIEW_H = 88;

type ClientSectionProps = {
  titleAlign?: "left" | "right";
  isHomepage?: boolean;
};

export function ClientSection({ titleAlign = "left", isHomepage = false }: ClientSectionProps) {
  const t = useTranslations("clients");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const logoRef = React.useRef<HTMLSpanElement>(null);
  const liRefs = React.useRef<(HTMLLIElement | null)[]>([]);
  const baseTopRef = React.useRef(0);
  const isDesktopRef = React.useRef(false);

  const relativeTop = React.useCallback((el: HTMLElement) => {
    const container = containerRef.current;
    if (!container) {
      return 0;
    }
    return el.getBoundingClientRect().top - container.getBoundingClientRect().top;
  }, []);

  const updateBaseTop = React.useCallback(() => {
    const firstLi = liRefs.current[0];
    if (firstLi) {
      baseTopRef.current = relativeTop(firstLi);
    }
    if (previewRef.current) {
      previewRef.current.style.top = `${baseTopRef.current}px`;
    }
  }, [relativeTop]);

  const deactivate = React.useCallback(() => {
    if (previewRef.current) {
      previewRef.current.style.opacity = "0";
    }
  }, []);

  const activate = React.useCallback(
    (index: number, positionIndex = index) => {
      const li = liRefs.current[positionIndex];
      const preview = previewRef.current;
      const logo = logoRef.current;
      const client = (isHomepage ? HOMEPAGE_CLIENTS : CLIENTS)[index];
      if (!li || !preview || !logo || !client) {
        return;
      }

      const rowCenterOffset = (li.offsetHeight - PREVIEW_H) / 2;
      const translateY = relativeTop(li) - baseTopRef.current + rowCenterOffset;

      preview.style.transform = `translateY(${translateY}px)`;
      preview.style.opacity = "1";

      const url = `url(${client.maskUrl})`;
      const s = logo.style;
      s.maskImage = url;
      s.maskSize = "contain";
      s.maskRepeat = "no-repeat";
      s.maskPosition = "center";
      s.setProperty("-webkit-mask-image", url);
      s.setProperty("-webkit-mask-size", "contain");
      s.setProperty("-webkit-mask-repeat", "no-repeat");
      s.setProperty("-webkit-mask-position", "center");
    },
    [relativeTop]
  );

  React.useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (previewRef.current) {
      previewRef.current.style.transition = reducedMotion
        ? "none"
        : "transform 480ms cubic-bezier(0.17,0.84,0.44,1), opacity 480ms cubic-bezier(0.17,0.84,0.44,1)";
    }
    updateBaseTop();

    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        isDesktopRef.current = true;
        updateBaseTop();
        deactivate();
        return () => {
          isDesktopRef.current = false;
        };
      });

      // mm.add("(max-width: 1023px)", () => {
      //   isDesktopRef.current = false;
      //   updateBaseTop();
      //   const lastIndex = CLIENTS.length - 1;
      //   activate(0, lastIndex);
      //
      //   const triggers = (liRefs.current.filter(Boolean) as HTMLLIElement[]).map((li, index) =>
      //     ScrollTrigger.create({
      //       trigger: li,
      //       start: "top center",
      //       end: "bottom center",
      //       onEnter: () => activate(index, lastIndex),
      //       onEnterBack: () => activate(index, lastIndex),
      //     })
      //   );
      //
      //   ScrollTrigger.refresh();
      //
      //   return () => {
      //     for (const t of triggers) {
      //       t.kill();
      //     }
      //   };
      // });

      cleanup = () => mm.revert();
    });

    return () => cleanup?.();
  }, [updateBaseTop, deactivate, activate]);

  const onClientEnter = (index: number) => {
    if (isDesktopRef.current) {
      activate(index);
    }
  };

  const onListLeave = () => {
    if (isDesktopRef.current) {
      deactivate();
    }
  };

  const clients = isHomepage ? HOMEPAGE_CLIENTS : CLIENTS;

  return (
    <section className="section-padding" aria-label="Clients">
      <div ref={containerRef} className="layout-grid relative">
        <h1 className={cx("type-h1 col-span-8 pb-20 uppercase", titleAlign === "right" && "lg:col-start-5")}>
          <AnimatedText as="span">{t("heading")}</AnimatedText>
        </h1>

        {/* biome-ignore lint/a11y/useKeyWithMouseEvents: decorative hover preview only */}
        <ul ref={listRef} className="group col-span-full row-start-2 flex flex-col gap-16" onMouseLeave={onListLeave}>
          {clients.map((client, index) => (
            // biome-ignore lint/a11y/useKeyWithMouseEvents: decorative hover preview only
            <li
              key={client.name}
              ref={(el) => {
                liRefs.current[index] = el;
              }}
              className="layout-grid motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out lg:cursor-pointer lg:group-hover:opacity-50 lg:hover:opacity-100!"
              onMouseEnter={() => onClientEnter(index)}
            >
              <h4 className="type-h4 col-span-6 col-start-3 lg:col-span-6 lg:col-start-5">{client.name}</h4>
            </li>
          ))}
        </ul>

        <div
          ref={previewRef}
          className="client-preview-size pointer-events-none absolute right-0 overflow-hidden opacity-0"
          aria-hidden="true"
        >
          <span ref={logoRef} className="block size-full bg-ink" />
        </div>
      </div>
    </section>
  );
}
