"use client";

import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { TransitionLink } from "@/components/navigation/transition-link";

type SiteHeaderProps = Readonly<{
  currentPage: "About" | "Business" | "Wedding" | "Contact";
}>;

// Desktop and mobile share one list so both menus keep the same order.
const navItems = [
  { href: "/home", label: "Home", external: false },
  { href: "/business", label: "Business", external: false },
  { href: "/wedding", label: "Wedding", external: false },
  { href: "/about", label: "About", external: false },
  {
    href: "https://www.instagram.com/meimei.creativestudio/",
    label: "Instagram",
    external: true,
  },
  { href: "/contact", label: "Contact", external: false },
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
        <TransitionLink className="site-header__brand" href="/home">
          {/* biome-ignore lint/performance/noImgElement: static SVG logo; next/image's optimizer doesn't apply to vectors and only adds risk (requires enabling dangerouslyAllowSVG) */}
          <img
            className="site-header__logo"
            src="/brand/etre-logo.svg"
            alt="Être"
          />
        </TransitionLink>
        <nav className="site-header__nav" aria-label="Primary navigation">
          {navItems.map((item) =>
            item.external ? (
              <a
                className="site-header__nav-link site-header__social"
                href={item.href}
                key={item.href}
                rel="noreferrer"
                target="_blank"
              >
                {item.label}
              </a>
            ) : (
              <TransitionLink
                className="site-header__nav-link"
                href={item.href}
                aria-current={currentPage === item.label ? "page" : undefined}
                key={item.href}
              >
                {item.label}
              </TransitionLink>
            ),
          )}
        </nav>
      </div>

      <div className="site-header__mobile">
        <TransitionLink
          className="site-header__mobile-brand"
          href="/home"
          aria-label="Home"
          onClick={closeMenu}
        >
          {/* biome-ignore lint/performance/noImgElement: static SVG logo; see the desktop brand above */}
          <img
            className="site-header__logo site-header__logo--mobile"
            src="/brand/etre-logo.svg"
            alt="Être"
          />
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
          {navItems.map((item, index) => (
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
