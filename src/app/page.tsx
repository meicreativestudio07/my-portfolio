import { getIntroPortrait } from "@/features/intro/api/get-intro-portrait";
import { PortfolioIntro } from "@/features/intro/components/portfolio-intro";

const HomePage = async () => {
  const portrait = await getIntroPortrait();

  if (!portrait) return null;

  return <PortfolioIntro destination="/business" portrait={portrait} />;
};

export default HomePage;
