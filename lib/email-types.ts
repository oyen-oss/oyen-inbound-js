import type { Root } from 'hast';

export type EmailAddress = {
  name?: string;
  address: string;
  raw: string;
};

export type EmailHeaders = Record<string, string | undefined>;

export type EmailContentType = {
  type: string;
  parameters: EmailHeaders;
  encoding?: string;
};

export type EmailAttachment = {
  contentType: EmailContentType;
  body: string | Uint8Array;
  contentId?: string;
  filename?: string;
};

export type EmailExtract = {
  subject?: string;
  to?: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress[];
  date?: Date;
  from?: EmailAddress;
  attachments?: EmailAttachment[];
  headers: {
    raw: EmailHeaders;
    get(prop: string): string | undefined;
    toJSON(): EmailHeaders;
  };
  html?: {
    raw: string;
    dom?: Root;
  };
  text?: string;
};

export type EmailPart = {
  contentType: EmailContentType;
  headers: EmailHeaders;
  body: EmailExtract | EmailPart | EmailPart[] | string | Uint8Array;
};
