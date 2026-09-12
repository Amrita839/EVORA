/**
 * Provider abstraction — every AI backend (Ollama today, a hosted API
 * tomorrow) implements this interface. `aiService.ts` never talks to a
 * specific vendor directly, so swapping providers means writing one new
 * file in `lib/ai/providers/` and pointing `AI_PROVIDER` at it.
 */

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface AiProvider {
  readonly name: string;
  /** Returns raw text completion. Throws on network/model failure — callers must catch. */
  generate(messages: ChatMessage[]): Promise<string>;
  /** Cheap reachability check used before committing to a full generation. */
  isAvailable(): Promise<boolean>;
}
