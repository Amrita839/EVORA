import type { AiProvider, ChatMessage } from "./types";

/**
 * Ollama provider — talks to a local (or self-hosted) Ollama instance
 * running an open-weight, commercially-usable model (default:
 * `mistral:7b-instruct`). See README "AI Setup" for pulling the model.
 */
export class OllamaProvider implements AiProvider {
  readonly name = "ollama";
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434", model = process.env.AI_MODEL ?? "mistral:7b-instruct") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(2500),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async generate(messages: ChatMessage[]): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
        options: { temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      throw new Error(`Ollama request failed with status ${res.status}`);
    }

    const data = (await res.json()) as { message?: { content?: string } };
    const content = data.message?.content;
    if (!content) {
      throw new Error("Ollama returned an empty response");
    }
    return content;
  }
}
