import { motion } from "motion/react";

type BotanicalMarkProps = Readonly<{
  visible: boolean;
}>;

const stemTransition = {
  duration: 1.1,
  ease: [0.19, 1, 0.22, 1] as const,
};

const leafTransition = {
  duration: 0.82,
  delay: 0.22,
  ease: [0.19, 1, 0.22, 1] as const,
};

export const BotanicalMark = ({ visible }: BotanicalMarkProps) => (
  <motion.svg
    className="portfolio-intro__botanical"
    viewBox="0 0 520 420"
    fill="none"
    aria-hidden="true"
    initial={false}
    animate={{ opacity: visible ? 1 : 0 }}
    transition={{ duration: 0.66 }}
  >
    <motion.path
      className="portfolio-intro__botanical-line"
      d="M88 374C168 326 192 258 232 197C274 132 333 88 420 55"
      initial={false}
      animate={{ pathLength: visible ? 1 : 0 }}
      transition={stemTransition}
    />
    <motion.path
      className="portfolio-intro__botanical-line"
      d="M214 224C164 220 126 191 112 145C155 142 202 165 224 205"
      initial={false}
      animate={{ pathLength: visible ? 1 : 0 }}
      transition={leafTransition}
    />
    <motion.path
      className="portfolio-intro__botanical-line"
      d="M269 151C275 101 310 66 358 54C359 96 330 138 281 159"
      initial={false}
      animate={{ pathLength: visible ? 1 : 0 }}
      transition={leafTransition}
    />
    <motion.path
      className="portfolio-intro__botanical-line portfolio-intro__botanical-line--fine"
      d="M418 56C437 40 445 24 442 8M418 56C443 58 462 70 473 91M420 55C403 35 399 18 405 3"
      initial={false}
      animate={{ pathLength: visible ? 1 : 0 }}
      transition={leafTransition}
    />
    <motion.path
      className="portfolio-intro__botanical-line portfolio-intro__botanical-line--fine"
      d="M89 374C66 387 47 389 30 382M90 374C73 354 68 336 72 318"
      initial={false}
      animate={{ pathLength: visible ? 1 : 0 }}
      transition={leafTransition}
    />
  </motion.svg>
);
