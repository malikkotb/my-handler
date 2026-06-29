import { useLocale } from "next-intl";
import type * as React from "react";
import { Link } from "~/components/link";
import { cx } from "~/features/style/utils";
import { getPathname } from "~/i18n/navigation";

type CtaButtonProps = {
  to: string;
  children: React.ReactNode;
  className?: string;
};

export function CtaButton({ to, children, className }: CtaButtonProps) {
  const locale = useLocale();
  const href = getPathname({ href: to, locale });

  return (
    <Link href={href} className={cx("type-cta justify-center items-end w-fit gap-8 text-ink uppercase no-underline", className)}>
      {children}
      <span aria-hidden="true" className="translate-y-arrow pl-8">
        ↗
      </span>
    </Link>
  );
}
