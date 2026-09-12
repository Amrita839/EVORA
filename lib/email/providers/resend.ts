import type { EmailProvider, SendEmailInput, EmailResult } from "../types";

/**
 * Resend provider stub. Swap in the real `resend` SDK once `EMAIL_API_KEY`
 * and `EMAIL_PROVIDER=resend` are configured — kept dependency-free here so
 * the package isn't required until it's actually used.
 */
export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend";

  async send(input: SendEmailInput): Promise<EmailResult> {
    const apiKey = process.env.EMAIL_API_KEY;
    if (!apiKey) {
      console.warn("[email:resend] EMAIL_API_KEY not set — email not sent.");
      return { ok: false, reason: "not_configured" };
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "Evora Gifting <hello@evoragifting.com>",
          to: input.to,
          subject: input.subject,
          html: input.html,
          reply_to: input.replyTo,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return { ok: false, reason: body };
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error instanceof Error ? error.message : "unknown_error" };
    }
  }
}
