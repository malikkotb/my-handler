"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

type ViewTransitionContext = {
  isViewTransitionComplete: boolean;
  beginViewTransition: () => void;
};

const ViewTransitionContext = React.createContext<ViewTransitionContext | null>(null);

export function useViewTransition(): ViewTransitionContext {
  const context = React.useContext(ViewTransitionContext);

  if (!context) {
    throw new Error("useViewTransition must be used within a ViewTransitionProvider");
  }

  return context;
}

export function ViewTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isViewTransitionComplete, setIsViewTransitionComplete] = React.useState(true);
  const prevPathname = React.useRef(pathname);

  const setTransitionPending = React.useCallback(() => {
    setIsViewTransitionComplete((prev) => (prev ? false : prev));
  }, []);

  const setTransitionComplete = React.useCallback(() => {
    setIsViewTransitionComplete((prev) => (prev ? prev : true));
  }, []);

  React.useEffect(() => {
    if (prevPathname.current === pathname) {
      return;
    }
    prevPathname.current = pathname;

    if (!("startViewTransition" in document)) {
      setTransitionComplete();
      return;
    }

    setTransitionPending();
  }, [pathname, setTransitionComplete, setTransitionPending]);

  React.useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setTransitionComplete();
      }
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [setTransitionComplete]);

  React.useEffect(() => {
    if (!("startViewTransition" in document)) {
      return;
    }

    const original = document.startViewTransition.bind(document);

    document.startViewTransition = (...args: Parameters<typeof document.startViewTransition>) => {
      setTransitionPending();

      const transition = original(...args);

      void transition.finished.finally(() => {
        setTransitionComplete();
      });

      return transition;
    };

    return () => {
      document.startViewTransition = original;
    };
  }, [setTransitionComplete, setTransitionPending]);

  const beginViewTransition = React.useCallback(() => {
    if (!("startViewTransition" in document)) {
      return;
    }

    setTransitionPending();
  }, [setTransitionPending]);

  React.useLayoutEffect(() => {
    if (!("startViewTransition" in document)) {
      return;
    }

    const loading = !isViewTransitionComplete;
    document.documentElement.toggleAttribute("data-vt-loading", loading);

    return () => {
      document.documentElement.removeAttribute("data-vt-loading");
    };
  }, [isViewTransitionComplete]);

  const value = React.useMemo(
    () => ({ isViewTransitionComplete, beginViewTransition }),
    [isViewTransitionComplete, beginViewTransition]
  );

  return <ViewTransitionContext.Provider value={value}>{children}</ViewTransitionContext.Provider>;
}
