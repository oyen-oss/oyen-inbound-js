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
import type { UnsubscribeFunction } from 'emittery';

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

export class Inbound<
  TParams extends InboundOptions,
  TData extends InboundMessageData,
> {
  #client: OyenRestApiRestClient;

  #params: TParams;

  #eventStreamPromise?: Promise<OyenEventStream<TData>>;

  #error?: Error | undefined;

  #eventSourceOptions:
    | Omit<
        OyenEventStreamOptions<
          TParams extends InboundEmailOptions
            ? EmailMessageData
            : SmsMessageData
        >,
        'teamId' | 'eventSourceId' | 'channels' | 'endpoint' | 'accessToken'
      >
    | undefined;

  /**
   * @description Listen for messages
   * @returns {UnsubscribeFunction} A function to stop listening
   */
  public on(eventName: 'message', listener: (data: TData) => void) {
    if (this.#error) {
      throw this.#error;
    }

    let unsubscribe: UnsubscribeFunction;
    this.#eventStream.then((es) => {
      unsubscribe = es.on(eventName, (m) => {
        listener(m.d);
      });
    });

    return () => {
      unsubscribe?.();
    };
  }

  public async once(eventName: 'message'): Promise<TData> {
    if (this.#error) {
      throw this.#error;
    }
    const es = await this.#eventStream;
    return es.once(eventName).then((m: { d: TData }) => m.d);
  }

  public close() {
    this.#eventStream.then((es) => es.close());
  }

  constructor(
    params: TParams,
    eventSourceOptions?: Omit<
      OyenEventStreamOptions<
        TParams extends InboundEmailOptions ? EmailMessageData : SmsMessageData
      >,
      // these are specified by the retrieved inbox
      'teamId' | 'eventSourceId' | 'channels' | 'endpoint' | 'accessToken'
    >,
  ) {
    this.#client = new OyenRestApiRestClient(
      params.apiOptions?.endpoint,
      params.apiOptions?.fetcher,
      {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
      },
    );

    this.#params = params;

    this.#eventSourceOptions = eventSourceOptions;
  }

  get #eventStream() {
    if (!this.#eventStreamPromise) {
      this.#eventStreamPromise = this.#connect();
    }

    // store or rest any errors during connect
    this.#eventStreamPromise
      .catch((e) => {
        this.#error = e;
      })
      .then(() => {
        this.#error = undefined;
      });

    return this.#eventStreamPromise;
  }

  async #connect() {
    const client = this.#client;
    const params = this.#params;

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

    const inboxEventSource = await this.#client.json(
      new GetInboxEventSourceCommand({
        teamId: inbox.teamId,
        inboxId: inbox.inboxId,
      }),
    );

    // polyfill if needed
    const eventSourceClass =
      globalThis.EventSource ||
      (await import('@oyen-oss/eventsource/eventsource')).EventSource;

    return new OyenEventStream<
      TParams extends InboundEmailOptions ? EmailMessageData : SmsMessageData
    >({
      eventSourceClass,
      ...this.#eventSourceOptions,
      teamId: inboxEventSource.teamId,
      eventSourceId: inboxEventSource.eventSourceId,
      channels: [inboxEventSource.channelId],
      endpoint: inboxEventSource.endpoint,
      accessToken: inboxEventSource.accessToken,
    });
  }
}
