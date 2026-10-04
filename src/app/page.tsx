import { getHomeHeroPhoto } from "@/features/home/api/get-home-hero-photo";
import { HomeHero } from "@/features/home/components/home-hero";
import { getIntroPortrait } from "@/features/intro/api/get-intro-portrait";
import { PortfolioIntro } from "@/features/intro/components/portfolio-intro";

// The hero renders underneath the intro, so the intro can dissolve straight
// into it rather than navigating away.
const IntroPage = async () => {
  const [portrait, photo] = await Promise.all([
    getIntroPortrait(),
    getHomeHeroPhoto(),
  ]);

  if (!photo) return null;

  return (
    <>
      <HomeHero photo={photo} />
      {portrait ? <PortfolioIntro portrait={portrait} /> : null}
    </>
  );
};

export default IntroPage;
