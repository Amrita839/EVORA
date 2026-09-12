export { buildWhatsAppLink, buildEnquiryMessage, buildCorporateEnquiryMessage } from "./links";
export { sendTemplateMessage, sendSessionMessage } from "./client";
export { hasWhatsAppConsent, recordWhatsAppConsent } from "./consent";
export { createOrUpdateLead, notifyBusinessOfEnquiry, sendFollowUpMessage } from "./leads";
export type { WhatsAppEnquiryLineItem, WhatsAppSendResult } from "./types";
