import type { RestServiceClientConfig } from '@block65/rest-client';
import {
  OyenEventSource,
  type OyenEventSourceOptions,
} from '@oyen-oss/eventsource';
import { InboundSetupError } from './errors.js';
import {
  GetInboxEventSourceCommand,
  ListInboxesCommand,
  OyenRestApiRestClient,
} from './rest-client/main.js';

type CommonInboundConfig<T extends { email: string } | { sms: string }> = {
  teamId: string;
  accessToken: string;
  logger?: (...args: unknown[]) => void;
  apiOptions?: RestServiceClientConfig & {
    endpoint?: URL | string;
  };
  eventStreamOptions?: Pick<
    OyenEventSourceOptions<
      T extends { email: string } ? EmailMessageData : SmsMessageData
    >,
    'options'
  >;
} & T;

export type InboundEmailConfig = CommonInboundConfig<{
  email: string;
}>;

export type InboundSmsConfig = CommonInboundConfig<{
  sms: string;
}>;

export type InboundConfig = InboundEmailConfig | InboundSmsConfig;

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

function extractHandleAndDomain(email: string) {
  const [handle, domainName] = email.split('@');
  if (!handle || !domainName) {
    throw new InboundSetupError('Invalid email').debug({ email });
  }
  return { handle, domainName: 'oyenbound.com' as const };
}

export class Inbound<TConfig extends InboundEmailConfig | InboundSmsConfig> {
  readonly #client: OyenRestApiRestClient;

  readonly #config: TConfig;

  readonly #logger?: ((...args: unknown[]) => void) | undefined;

  readonly #eventStream: Promise<
    OyenEventSource<
      TConfig extends InboundEmailConfig ? EmailMessageData : SmsMessageData
    >
  >;

  constructor(config: TConfig) {
    this.#client = new OyenRestApiRestClient({
      logger: config.logger,
      ...config.apiOptions,
      headers: {
        authorization: `Bearer ${config.accessToken}`,
        ...config.apiOptions?.headers,
        'user-agent': `${import.meta.env.PACKAGE_NAME}/${import.meta.env.PACKAGE_VERSION}`,
      },
    });

    this.#config = config;

    this.#logger = config.logger;

    this.#eventStream = this.#init();
  }

  #log(msg: string, ...args: unknown[]) {
    this.#logger?.(`[inbound] ${msg}`, ...args);
  }

  async #init() {
    this.#log('Connecting event stream...');
    const api = this.#client;
    const config = this.#config;

    this.#log('Fetching inboxes...');

    // TODO: need to add a GetInboxFromTeamCommand to not only get the inbox by
    // domain, but on a specific team
    const inboxes = await api.json(
      new ListInboxesCommand({ teamId: config.teamId }),
    );

    this.#log('Got %d inboxes', inboxes.length);

    const inbox =
      'email' in config
        ? inboxes.find((i) => {
            // TODO: absolutely no need to do this every loop iteration
            const { handle, domainName } = extractHandleAndDomain(config.email);
            return (
              i.kind === 'email' &&
              i.handle === handle &&
              i.domain === domainName
            );
          })
        : inboxes.find((i) => i.kind === 'sms' && i.handle === config.sms);

    this.#log('Found inbox %j', inbox);

    if (!inbox) {
      throw new InboundSetupError('Inbox not found').debug({
        ...config,
        accessToken: config.accessToken && '[REDACTED]',
      });
    }

    this.#log('Fetching event source for inbox %s', inbox.inboxId);

    const inboxEventSource = await this.#client.json(
      new GetInboxEventSourceCommand({
        teamId: inbox.teamId,
        inboxId: inbox.inboxId,
      }),
    );

    this.#log('Got event source %s', inboxEventSource.endpoint);

    return new OyenEventSource<
      TConfig extends InboundEmailConfig ? EmailMessageData : SmsMessageData
    >({
      ...this.#config.eventStreamOptions,
      logger: this.#logger,
      teamId: inboxEventSource.teamId,
      eventSourceId: inboxEventSource.eventSourceId,
      channels: [inboxEventSource.channelId],
      endpoint: inboxEventSource.endpoint,
      accessToken: inboxEventSource.accessToken,
    });
  }

  public async once(eventName: 'message') {
    return this.#eventStream
      .then((es) => {
        this.#log('waiting for event=%s', eventName);
        return es.once(eventName);
      })
      .then((message) => {
        if (message) {
          this.#log('to channel=%s, data=%j', message.ch, message.d);
        } else {
          this.#log('got null message');
        }

        return message?.d;
      });
  }

  public async close() {
    this.#log('closing connection!');
    await this.#eventStream.then((es) => es.close());
  }
}
