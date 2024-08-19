import type { Root } from 'hast';

export type EmailAddress = {
  name?: string;
  address: string;
  raw: string;
};

export type EmailContentType = {
  type: string;
  parameters: Record<string, string | undefined>;
  encoding?: string;
};

export type EmailAttachment = {
  contentType: EmailContentType;
  body: string | Uint8Array;
  contentId?: string;
  filename?: string;
};

export type EmailHeadersJSON = {
  raw: Record<string, string | undefined>;
};

export type EmailHTMLJSON = {
  raw: string;
  json: Root;
};

export type EmailExtractJSON = {
  kind: 'email';
  subject?: string;
  to?: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress[];
  date?: Date;
  from?: EmailAddress;
  attachments?: EmailAttachment[];
  headers: EmailHeadersJSON;
  html?: EmailHTMLJSON;
  text?: string;
};

export type EmailPart = {
  contentType: EmailContentType;
  headers: EmailHeadersJSON;
  body: EmailExtractJSON | EmailPart | EmailPart[] | string | Uint8Array;
};

/**
 * Phone number including country code and local number or alphanumeric sender
 * ID
 */
export type PhoneNumberJSON =
  | {
      /**
       * E.164 phone number as received
       */
      raw: string;

      /**
       * International Direct Dialing prefix aka Country Calling Code
       */
      idd: string;

      /**
       * Local number without country code
       */
      localNumber: string;

      /**
       * ISO 3166-1 alpha-2 country code
       */
      countryCode: string;
    }
  | {
      /**
       * Alphanumeric sender ID as received
       */
      senderId: string;
    };

export type SMSExtractJSON = {
  kind: 'sms';
  to: PhoneNumberJSON;
  from: PhoneNumberJSON;
  parts: number;
  text: {
    raw: string;
    links?: string[];
    otps?: string[];
  };
};
