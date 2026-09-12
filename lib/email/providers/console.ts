import type { EmailProvider, SendEmailInput, EmailResult } from "../types";

/** Default no-op provider — logs instead of sending. Safe for local dev. */
export class ConsoleEmailProvider implements EmailProvider {
  readonly name = "console";

  async send(input: SendEmailInput): Promise<EmailResult> {
    console.info(`[email:console] Would send to ${input.to} — subject: "${input.subject}"`);
    return { ok: true };
  }
}
