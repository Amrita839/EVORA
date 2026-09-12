export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export type EmailResult = { ok: true } | { ok: false; reason: string };

export interface EmailProvider {
  readonly name: string;
  send(input: SendEmailInput): Promise<EmailResult>;
}
