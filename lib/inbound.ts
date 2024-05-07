import type { FetcherParams } from '@block65/rest-client';
import {
  OyenEventSource,
  OyenEventSource as OyenEventStream,
  type OyenEventSourceOptions,
} from '@oyen-oss/eventsource';
import { createToken } from '@oyen-oss/keys';
import { InboundSetupError } from './errors.js';
import {
  GetDomainInboxCommand,
  GetInboxEventSourceCommand,
  OyenRestApiRestClient,
} from './rest-client/main.js';

type CommonInboundOptions = {
  teamId: string;
  privateKey: string;
  options?: {
    endpoint?: URL;
    fetcher?: (params: FetcherParams) => Promise<any>;
  };
};

export type InboundEmailOptions = CommonInboundOptions & {
  handle: string;
  domainName: string;
};

export type InboundSmsOptions = CommonInboundOptions & {
  number: string;
};

export type InboundOptions = InboundEmailOptions | InboundSmsOptions;

type EmailMessageData = {
  to: string;
  from: string;
  raw: string;
};

type SmsMessageData = {
  to: string;
  from: string;
  raw: string;
};

export type InboundMessageData = EmailMessageData | SmsMessageData;

type OyenEventStreamOptions<TParams extends InboundMessageData> = Omit<
  OyenEventSourceOptions<TParams>,
  'teamId' | 'eventSourceId' | 'channels' | 'endpoint' | 'accessToken'
>;

export class Inbound<T extends InboundMessageData> {
  #eventStream: OyenEventStream<T>;

  constructor(eventStream: OyenEventStream<T>) {
    this.#eventStream = eventStream;
  }

  public on(_eventName: 'message', listener: (data: T) => void) {
    return this.#eventStream.on('message', (m) => {
      listener(m.d);
    });
  }

  public async once(_eventName: 'message') {
    return this.#eventStream.once('message').then((m: { d: T }) => m.d);
  }

  public close() {
    this.#eventStream.close();
  }

  public static async from<TParams extends InboundOptions>(
    params: TParams,
    eventSourceOptions?: OyenEventStreamOptions<
      TParams extends InboundEmailOptions ? EmailMessageData : SmsMessageData
    >,
  ) {
    const token = createToken({
      privateKey: params.privateKey,
      claims: {
        scope: 'inbox:stream',
      },
    });

    const client = new OyenRestApiRestClient(
      params?.options?.endpoint,
      params?.options?.fetcher,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    // const inboxes = await client.json(
    //   new ListInboxesCommand({ teamId: options.teamId }),
    // );

    // const inbox = inboxes.find(
    //   (i) =>
    //     ('handle' in options && 'handle' in i && i.handle === options.handle) ||
    //     ('number' in options && 'number' in i && i.number === options.number),
    // );

    const inbox = await client.json(
      'handle' in params
        ? new GetDomainInboxCommand({
            handle: params.handle,
            domainName: params.domainName,
          })
        : new GetDomainInboxCommand({
            handle: params.number,
            domainName: params.number,
          }),
    );

    if (!inbox) {
      throw new InboundSetupError('Inbox not found').debug({
        ...params,
        privateKey: '[REDACTED]',
      });
    }

    const inboxEventSource = await client.json(
      new GetInboxEventSourceCommand({
        teamId: inbox.teamId,
        inboxId: inbox.inboxId,
      }),
    );

    // polyfill if needed
    const eventSourceClass =
      globalThis.EventSource ||
      (await import('@oyen-oss/eventsource/eventsource')).EventSource;

    const eventSource = new OyenEventSource<
      TParams extends InboundEmailOptions ? EmailMessageData : SmsMessageData
    >({
      eventSourceClass,
      ...eventSourceOptions,
      teamId: inboxEventSource.teamId,
      eventSourceId: inboxEventSource.eventSourceId,
      channels: [inboxEventSource.channelId],
      endpoint: inboxEventSource.endpoint,
      accessToken: inboxEventSource.accessToken,
    });

    return new Inbound(eventSource);
  }
}
