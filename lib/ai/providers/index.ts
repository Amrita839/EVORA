import type { AiProvider } from "./types";
import { OllamaProvider } from "./ollama";

/**
 * Resolves the configured provider from `AI_PROVIDER`. Add new cases here as
 * new provider files are written — nothing outside this file needs to know
 * which vendor is active.
 */
export function getAiProvider(): AiProvider | null {
  const provider = process.env.AI_PROVIDER ?? "ollama";

  switch (provider) {
    case "ollama":
      return new OllamaProvider();
    case "none":
      return null;
    default:
      console.warn(`Unknown AI_PROVIDER "${provider}" — falling back to Ollama.`);
      return new OllamaProvider();
  }
}

export type { AiProvider, ChatMessage } from "./types";
