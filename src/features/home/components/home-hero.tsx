import Image from "next/image";
import Link from "next/link";

import type { CommissionCut } from "@/features/commission/types/commission";

type HomeHeroProps = Readonly<{
  photo: CommissionCut;
}>;

const entrances = [
  { href: "/wedding", label: "Wedding" },
  { href: "/business", label: "Business" },
] as const;

export const HomeHero = ({ photo }: HomeHeroProps) => (
  <main className="home-hero">
    <div className="home-hero__media">
      <div className="home-hero__frame" data-reveal="zoom">
        <Image
          className="home-hero__image"
          src={photo.image}
          alt={photo.alt}
          fill
          priority
          sizes="(min-width: 48rem) 50vw, 100vw"
        />
      </div>
    </div>

    <div className="home-hero__body">
      <h1 className="home-hero__brand" data-reveal="text">
        {/* biome-ignore lint/performance/noImgElement: static SVG logo; see site-header.tsx */}
        <img
          className="home-hero__logo"
          src="/brand/etre-logo.svg"
          alt="Être"
        />
      </h1>

      <p className="home-hero__greeting" data-reveal="text">
        <span>特別な日も、何気ない日も。</span>
        <span>背伸びしない、あなたらしい表情を残します。</span>
      </p>

      <nav
        className="home-hero__entrances"
        aria-label="Services"
        data-reveal="text"
      >
        {entrances.map((entrance) => (
          <Link
            className="home-hero__entrance"
            href={entrance.href}
            key={entrance.href}
          >
            {entrance.label}
          </Link>
        ))}
      </nav>

      <Link className="home-hero__notice" href="/monitor" data-reveal="text">
        前撮りモニター募集中 →
      </Link>
    </div>
  </main>
);
