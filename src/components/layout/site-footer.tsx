import { TransitionLink } from "@/components/navigation/transition-link";

// One quiet line at the end of every page, so the privacy notice that GA4
// requires is reachable from anywhere on the site.
export const SiteFooter = () => (
  <footer className="site-footer site-shell">
    <TransitionLink className="site-footer__link" href="/privacy">
      プライバシーについて
    </TransitionLink>
  </footer>
);
