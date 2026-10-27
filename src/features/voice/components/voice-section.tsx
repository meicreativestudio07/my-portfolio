import type { Voice } from "@/features/voice/types/voice";

type VoiceSectionProps = Readonly<{
  voices: readonly Voice[];
  /** Heading id, unique on the page. */
  id: string;
  title: string;
  /** "page" heads a page section (Wedding); "inline" closes /monitor in smaller type, folded to a few lines. */
  variant: "page" | "inline";
}>;

/**
 * Customer voices, set quietly like quotations: the words in a slightly
 * larger type, who/where/when underneath in muted text. Renders nothing when
 * there are no voices, so an empty section never shows.
 */
export const VoiceSection = ({
  voices,
  id,
  title,
  variant,
}: VoiceSectionProps) => {
  if (voices.length === 0) return null;

  return (
    <section className={`voice voice--${variant}`} aria-labelledby={id}>
      <h2 className="voice__title" id={id} data-reveal="text">
        {title}
      </h2>
      <ul className="voice__list">
        {voices.map((voice) => (
          <li className="voice__item" key={voice.slug} data-reveal="text">
            <figure className="voice__figure">
              {variant === "inline" ? (
                // On /monitor each voice opens as a few lines; the full words
                // follow on "続きを読む". The excerpt is the same text clipped
                // by CSS, hidden from screen readers to avoid reading it twice.
                <details className="voice__fold">
                  <summary className="voice__summary">
                    <span className="voice__excerpt" aria-hidden="true">
                      {voice.comment}
                    </span>
                    <span className="voice__more">続きを読む</span>
                  </summary>
                  <blockquote className="voice__quote">
                    <p>{voice.comment}</p>
                  </blockquote>
                </details>
              ) : (
                <blockquote className="voice__quote">
                  <p>{voice.comment}</p>
                </blockquote>
              )}
              <figcaption className="voice__meta">{voice.name}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
};
