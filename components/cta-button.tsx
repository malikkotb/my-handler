import { useLocale } from "next-intl";
import { Link } from "~/components/link";
import { cx } from "~/features/style/utils";
import { getPathname } from "~/i18n/navigation";

type CtaButtonProps = {
  to: string;
  children: string;
  className?: string;
};

export function CtaButton({ to, children, className }: CtaButtonProps) {
  const locale = useLocale();
  const href = getPathname({ href: to, locale });

  return (
    <Link
      href={href}
      className={cx("group type-cta w-fit items-end justify-center gap-8 border border-accent text-ink uppercase", className)}
    >
      <span
        className={cx(
          "relative inline-block",
          "before:absolute before:inset-x-0 before:-bottom-[0.0625em] before:h-[0.0625em] before:origin-left before:scale-x-100 before:bg-current before:transition-transform before:delay-300 before:duration-[735ms] before:ease-[cubic-bezier(0.625,0.05,0,1)] before:content-['']",
          "after:absolute after:inset-x-0 after:-bottom-[0.0625em] after:h-[0.0625em] after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:delay-0 after:duration-[735ms] after:ease-[cubic-bezier(0.625,0.05,0,1)] after:content-['']",
          "group-hover:before:origin-right group-hover:before:scale-x-0 group-hover:before:delay-0",
          "group-hover:after:origin-left group-hover:after:scale-x-100 group-hover:after:delay-300",
          "motion-reduce:after:transition-none motion-reduce:before:transition-none"
        )}
      >
        {children}
      </span>
      <span aria-hidden="true" className="translate-y-arrow pl-8">
        ↗
      </span>
    </Link>
  );
}
