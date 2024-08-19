import type { Merge } from 'type-fest';
import type { IDocument } from './document.js';
import type {
  EmailExtractJSON,
  EmailHeadersJSON,
  SMSExtractJSON,
} from './rest-client/extracts.js';
import type { Message } from './rest-client/main.js';

export type EmailHeaders = Merge<
  EmailHeadersJSON,
  {
    get(prop: string): string | undefined;
    toJSON(): EmailHeadersJSON['raw'];
  }
>;

export type EmailExtract = Merge<
  EmailExtractJSON,
  {
    headers: EmailHeaders;
    html?: {
      raw: string | undefined;
      document: IDocument;
    };
    message: Message;
  }
>;

export type SMSExtract = SMSExtractJSON;
