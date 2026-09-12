import "server-only";
import type { EmailProvider, SendEmailInput, EmailResult } from "./types";
import { ConsoleEmailProvider } from "./providers/console";
import { ResendEmailProvider } from "./providers/resend";

function getEmailProvider(): EmailProvider {
  const provider = process.env.EMAIL_PROVIDER ?? "none";
  switch (provider) {
    case "resend":
      return new ResendEmailProvider();
    case "none":
    default:
      return new ConsoleEmailProvider();
  }
}

export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
  return getEmailProvider().send(input);
}

export type { SendEmailInput, EmailResult, EmailProvider };
