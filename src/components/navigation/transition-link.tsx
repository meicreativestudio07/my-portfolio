"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

import { useSiteNavigation } from "@/components/navigation/site-navigation-context";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> &
  Readonly<{
    href: string;
  }>;

export const TransitionLink = ({
  href,
  onClick,
  target,
  ...props
}: TransitionLinkProps) => {
  const navigation = useSiteNavigation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      !navigation ||
      target === "_blank" ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigation.navigate(href);
  };

  return <Link {...props} href={href} target={target} onClick={handleClick} />;
};
