"use client";

import { Home, Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { TransitionLink } from "@/components/navigation/transition-link";

type SiteHeaderProps = Readonly<{
  currentPage: "Portfolio" | "Statement" | "Corporate" | "Wedding";
}>;

const desktopNavItems = [
  { href: "/portfolio", label: "Portfolio", level: "primary" },
  { href: "/corporate", label: "Corporate", level: "primary" },
  { href: "/wedding", label: "Wedding", level: "primary" },
  { href: "/statement", label: "Statement", level: "secondary" },
] as const;

const mobileNavItems = [
  { href: "/", label: "Home", external: false },
  { href: "/portfolio", label: "Portfolio", external: false },
  { href: "/corporate", label: "Corporate", external: false },
  { href: "/wedding", label: "Wedding", external: false },
  { href: "/statement", label: "Statement", external: false },
  {
    href: "https://www.instagram.com/",
    label: "Instagram",
    external: true,
  },
] as const;

export const SiteHeader = ({ currentPage }: SiteHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen((current) => !current);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isMenuOpen]);

  return (
    <header className="site-header">
      <div className="site-header__desktop">
        <TransitionLink className="site-header__brand" href="/">
          Takahashi Mei
        </TransitionLink>
        <nav className="site-header__nav" aria-label="Primary navigation">
          {desktopNavItems.map((item) => (
            <TransitionLink
              className="site-header__nav-link"
              data-level={item.level}
              href={item.href}
              aria-current={currentPage === item.label ? "page" : undefined}
              key={item.href}
            >
              {item.label}
            </TransitionLink>
          ))}
          <a
            className="site-header__social"
            href="https://www.instagram.com/"
            rel="noreferrer"
            target="_blank"
          >
            Instagram
          </a>
        </nav>
      </div>

      <div className="site-header__mobile">
        <TransitionLink
          className="site-header__mobile-brand"
          href="/"
          aria-label="Home"
          onClick={closeMenu}
        >
          <Home className="icon site-header__home-icon" aria-hidden="true" />
        </TransitionLink>
        <span className="site-header__current">{currentPage}</span>
        <button
          className="site-header__menu-button"
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={toggleMenu}
        >
          <Menu
            className="icon icon--menu site-header__menu-icon"
            data-visible={!isMenuOpen}
            aria-hidden="true"
          />
          <X
            className="icon icon--menu site-header__menu-icon"
            data-visible={isMenuOpen}
            aria-hidden="true"
          />
        </button>
      </div>

      <nav
        id="mobile-menu"
        className="mobile-menu"
        data-open={isMenuOpen ? "true" : "false"}
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
      >
        <p className="mobile-menu__eyebrow">Navigation</p>
        <ol className="mobile-menu__list">
          {mobileNavItems.map((item, index) => (
            <li key={item.href}>
              {item.external ? (
                <a
                  className="mobile-menu__link"
                  href={item.href}
                  rel="noreferrer"
                  target="_blank"
                  tabIndex={isMenuOpen ? undefined : -1}
                  onClick={closeMenu}
                >
                  <span className="mobile-menu__index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span>{item.label}</span>
                  <span className="mobile-menu__meta">External</span>
                </a>
              ) : (
                <TransitionLink
                  className="mobile-menu__link"
                  href={item.href}
                  aria-current={currentPage === item.label ? "page" : undefined}
                  tabIndex={isMenuOpen ? undefined : -1}
                  onClick={closeMenu}
                >
                  <span className="mobile-menu__index" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <span>{item.label}</span>
                </TransitionLink>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </header>
  );
};
