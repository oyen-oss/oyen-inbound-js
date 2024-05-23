import type { FetcherParams } from '@block65/rest-client';
import {
  OyenEventStream,
  type OyenEventSourceOptions as OyenEventStreamOptions,
} from '@oyen-oss/eventsource';
import { InboundSetupError } from './errors.js';
import {
  GetDomainInboxCommand,
  GetInboxEventSourceCommand,
  GetNumberInboxCommand,
  OyenRestApiRestClient,
} from './rest-client/main.js';

type CommonInboundOptions = {
  teamId: string;
  accessToken: string;
  apiOptions?: {
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

export type EmailMessageData = {
  to: string;
  from: string;
  raw: string;
};

export type SmsMessageData = {
  to: string;
  from: string;
  raw: string;
};

export type InboundMessageData = EmailMessageData | SmsMessageData;

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

  public async once(eventName: 'message') {
    return this.#eventStream.once(eventName).then((m: { d: T }) => m.d);
  }

  public close() {
    this.#eventStream.close();
  }

  public static async from<TParams extends InboundOptions>(
    params: TParams,
    eventSourceOptions?: Omit<
      OyenEventStreamOptions<
        TParams extends InboundEmailOptions ? EmailMessageData : SmsMessageData
      >,
      // these are specified by the retrieved inbox
      'teamId' | 'eventSourceId' | 'channels' | 'endpoint' | 'accessToken'
    >,
  ) {
    const client = new OyenRestApiRestClient(
      params.apiOptions?.endpoint,
      params.apiOptions?.fetcher,
      {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      },
    );

    const inbox = await ('domainName' in params
      ? client.json(
          new GetDomainInboxCommand({
            handle: params.handle,
            domainName: params.domainName,
          }),
        )
      : client.json(
          new GetNumberInboxCommand({
            handle: params.number,
          }),
        ));

    if (!inbox) {
      throw new InboundSetupError('Inbox not found').debug({
        ...params,
        accessToken: params.accessToken && '[REDACTED]',
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

    const eventSource = new OyenEventStream<
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
