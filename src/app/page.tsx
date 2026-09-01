import { PortfolioIntro } from "@/features/intro/components/portfolio-intro";
import { getWorks } from "@/features/work/api/get-works";

const HomePage = async () => {
  const works = await getWorks();
  const portrait = works[0]?.thumbnail;

  if (!portrait) return null;

  return <PortfolioIntro portrait={portrait} />;
};

export default HomePage;
