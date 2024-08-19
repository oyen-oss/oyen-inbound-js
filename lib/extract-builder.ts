import { createDocument } from './document.js';
import type {
  EmailExtractJSON,
  SMSExtractJSON,
} from './rest-client/extracts.js';
import type { Message } from './rest-client/main.js';
import type { EmailExtract, SMSExtract } from './types.js';

export function extractJsonToExtractHelper(
  extractJson: EmailExtractJSON,
  message: Message,
): EmailExtract;
export function extractJsonToExtractHelper(
  extractJson: SMSExtractJSON,
  message: Message,
): SMSExtract;
export function extractJsonToExtractHelper(
  extractJson: EmailExtractJSON | SMSExtractJSON,
  message: Message,
): SMSExtract | EmailExtract {
  if (extractJson.kind === 'email') {
    const { html, ...rest } = extractJson;

    return {
      ...rest,
      kind: 'email',
      headers: {
        raw: extractJson.headers.raw,
        get(prop: string) {
          return this.raw[prop];
        },
        toJSON() {
          return this.raw;
        },
      },
      ...(html && {
        html: {
          raw: html.raw,
          // document: new Document(html.json),
          document: createDocument(html.json),
        },
      }),
      message,
    };
  }

  return {
    ...extractJson,
  };
}
