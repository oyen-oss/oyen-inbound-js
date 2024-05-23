/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-classes-per-file */
import type { RequestMethodCaller } from '@block65/rest-client';
import { Command } from '@block65/rest-client';
import type {
  EmailInbox,
  EmailInboxList,
  GetDomainInboxCommandBody,
  GetDomainInboxCommandInput,
  GetInboxEventSourceCommandBody,
  GetInboxEventSourceCommandInput,
  GetNumberInboxCommandBody,
  GetNumberInboxCommandInput,
  InboxEventSource,
  ListDomainInboxesCommandBody,
  ListDomainInboxesCommandInput,
  SmsInbox,
} from './types.js';

/**
 * listDomainInboxesCommand
 * @param domainName {String}
 * @returns {RequestMethodCaller<EmailInboxList>} HTTP 200
 */
export function listDomainInboxesCommand(
  domainName: string,
): RequestMethodCaller<EmailInboxList> {
  const req = {
    method: 'get' as const,
    pathname: `/domains/${domainName}/inboxes`,
  };
  return (requestMethod, options) => requestMethod(req, options);
}

/**
 * listDomainInboxesCommand
 *
 *
 */
export class ListDomainInboxesCommand extends Command<
  ListDomainInboxesCommandInput,
  EmailInboxList,
  ListDomainInboxesCommandBody
> {
  public override method = 'get' as const;

  constructor(input: ListDomainInboxesCommandInput) {
    const { domainName } = input;
    super(`/domains/${domainName}/inboxes`);
  }
}

/**
 * getDomainInboxCommand
 * @param domainName {String}
 * @param handle {String}
 * @returns {RequestMethodCaller<EmailInbox>} HTTP 200
 */
export function getDomainInboxCommand(
  domainName: string,
  handle: string,
): RequestMethodCaller<EmailInbox> {
  const req = {
    method: 'get' as const,
    pathname: `/domains/${domainName}/inboxes/${handle}`,
  };
  return (requestMethod, options) => requestMethod(req, options);
}

/**
 * getDomainInboxCommand
 *
 *
 */
export class GetDomainInboxCommand extends Command<
  GetDomainInboxCommandInput,
  EmailInbox,
  GetDomainInboxCommandBody
> {
  public override method = 'get' as const;

  constructor(input: GetDomainInboxCommandInput) {
    const { domainName, handle } = input;
    super(`/domains/${domainName}/inboxes/${handle}`);
  }
}

/**
 * getInboxEventSourceCommand
 * @param teamId {String}
 * @param inboxId {String}
 * @returns {RequestMethodCaller<InboxEventSource>} HTTP 200
 */
export function getInboxEventSourceCommand(
  teamId: string,
  inboxId: string,
): RequestMethodCaller<InboxEventSource> {
  const req = {
    method: 'get' as const,
    pathname: `/teams/${teamId}/inboxes/${inboxId}/eventsource`,
  };
  return (requestMethod, options) => requestMethod(req, options);
}

/**
 * getInboxEventSourceCommand
 *
 *
 */
export class GetInboxEventSourceCommand extends Command<
  GetInboxEventSourceCommandInput,
  InboxEventSource,
  GetInboxEventSourceCommandBody
> {
  public override method = 'get' as const;

  constructor(input: GetInboxEventSourceCommandInput) {
    const { teamId, inboxId } = input;
    super(`/teams/${teamId}/inboxes/${inboxId}/eventsource`);
  }
}

/**
 * getNumberInboxCommand
 * @param handle {String}
 * @returns {RequestMethodCaller<SmsInbox>} HTTP 200
 */
export function getNumberInboxCommand(
  handle: string,
): RequestMethodCaller<SmsInbox> {
  const req = {
    method: 'get' as const,
    pathname: `/numbers/${handle}`,
  };
  return (requestMethod, options) => requestMethod(req, options);
}

/**
 * getNumberInboxCommand
 *
 *
 */
export class GetNumberInboxCommand extends Command<
  GetNumberInboxCommandInput,
  SmsInbox,
  GetNumberInboxCommandBody
> {
  public override method = 'get' as const;

  constructor(input: GetNumberInboxCommandInput) {
    const { handle } = input;
    super(`/numbers/${handle}`);
  }
}
