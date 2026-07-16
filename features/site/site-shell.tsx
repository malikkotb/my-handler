import type * as React from "react";
import { LastSection } from "~/features/site/last-section";
import { SiteFooter } from "~/features/site/site-footer";
import { SiteHeader } from "~/features/site/site-header";

export type SiteShellProps = {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
};

export function SiteShell(props: SiteShellProps) {
  const { children, showHeader = true, showFooter = true } = props;

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-ink">
      {showHeader && <SiteHeader />}
      <main className="container mx-auto flex-1 bg-surface">{children}</main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
