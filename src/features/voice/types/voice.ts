/** Who the voice comes from; Business is ready for when its pages carry voices too. */
export type VoiceKind = "wedding" | "business";

/** One customer voice, editable in content/voices/<slug>/index.yaml. */
export type Voice = Readonly<{
  slug: string;
  kind: VoiceKind;
  name: string;
  place: string;
  /** Shooting month as written, e.g. "2026年11月". Newest first. */
  month: string;
  comment: string;
}>;
