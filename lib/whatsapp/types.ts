export type WhatsAppEnquiryLineItem = {
  name: string;
  quantity: number;
};

export type BuildEnquiryMessageInput = {
  items: WhatsAppEnquiryLineItem[];
  customerName?: string;
  note?: string;
};

export type SendTemplateMessageInput = {
  to: string;
  templateName: string;
  languageCode?: string;
  /** Positional {{1}}, {{2}}... body variables, in order. */
  bodyParams?: string[];
};

export type WhatsAppSendResult =
  | { ok: true; messageId: string }
  | { ok: false; reason: string };
