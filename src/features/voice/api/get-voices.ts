import { cache } from "react";

import { voices } from "@/features/voice/data/voices.generated";
import type { Voice, VoiceKind } from "@/features/voice/types/voice";

export const getVoices = cache(
  async (kind: VoiceKind): Promise<readonly Voice[]> =>
    voices.filter((voice) => voice.kind === kind),
);
