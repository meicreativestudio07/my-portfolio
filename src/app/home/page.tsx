import { PageReady } from "@/components/layout/page-ready";
import { getHomeHeroPhoto } from "@/features/home/api/get-home-hero-photo";
import { HomeHero } from "@/features/home/components/home-hero";

const HomePage = async () => {
  const photo = await getHomeHeroPhoto();

  if (!photo) return null;

  return (
    <>
      <PageReady />
      <HomeHero photo={photo} />
    </>
  );
};

export default HomePage;
