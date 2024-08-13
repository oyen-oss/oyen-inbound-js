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
  /**
   * @description The oyen team id
   */
  teamId: string;

  /**
   * @description An oyen access token
   */
  accessToken: string;

  /**
   * @description Logger function for debugging, compatible with console.log
   * @returns void
   */
  logger?: (...args: unknown[]) => void;

  /**
   * @description Options for the underlying API client. You probably don't need
   * this
   */
  apiOptions?: RestServiceClientConfig & {
    endpoint?: URL | string;
  };

  /**
   * @description Options for the underlying event stream. You probably don't
   * need this
   */
  eventStreamOptions?: Pick<
    OyenEventSourceOptions<
      T extends { email: string } ? EmailMessageData : SmsMessageData
    >,
    'options'
  >;

  /**
   * @description If false, the client will initialise and connect only when
   * needed
   * @default true
   */
  autoConnect?: boolean;
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

export class Inbound<TConfig extends InboundConfig> {
  readonly #client: OyenRestApiRestClient;

  readonly #config: TConfig;

  readonly #logger?: ((...args: unknown[]) => void) | undefined;

  #eventStreamPromise?: Promise<
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

    if (config.autoConnect !== false) {
      this.connect();
    }
  }

  public async connect() {
    this.#eventStreamPromise ??= this.#init();
  }

  #log(msg: string, ...args: unknown[]) {
    this.#logger?.(`[inbound] ${msg}`, ...args);
  }

  public async ready() {
    if (!this.#eventStreamPromise) {
      return false;
    }
    // we are considered "ready" when the event stream is connected
    return this.#eventStreamPromise.then((es) => es.connected);
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
    if (!this.#eventStreamPromise) {
      throw new InboundSetupError(
        'Not connected. Did you call connect or turn off autoConnect?',
      );
    }

    const es = await this.#eventStreamPromise;

    this.#log('waiting once event=%s', eventName);
    const message = await es.once(eventName);

    if (message) {
      this.#log('to channel=%s, data=%j', message.ch, message.d);
    } else {
      this.#log('got empty message: %j', message);
    }

    return message?.d;
  }

  public async *stream(eventName: 'message') {
    if (!this.#eventStreamPromise) {
      throw new InboundSetupError(
        'Not connected. Did you call connect or turn off autoConnect?',
      );
    }

    const es = await this.#eventStreamPromise;

    this.#log('streaming events=%s', eventName);

    // eslint-disable-next-line no-restricted-syntax
    for await (const message of es.listen(eventName)) {
      if (message) {
        this.#log('to channel=%s, data=%j', message.ch, message.d);
      } else {
        this.#log('got empty message: %j', message);
      }

      yield message?.d;
    }
  }

  public async close() {
    this.#log('closing connection!');
    await this.#eventStreamPromise?.then((es) => es.close());
  }
}
