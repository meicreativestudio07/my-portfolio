"use client";

import { useEffect } from "react";

import { useSiteNavigation } from "@/components/navigation/site-navigation-context";

export const PageReady = () => {
  const navigation = useSiteNavigation();

  useEffect(() => {
    navigation?.markPageReady();
  }, [navigation]);

  return null;
};
