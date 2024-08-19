import type { RestServiceClientConfig } from '@block65/rest-client';
import {
  OyenEventSource,
  type OyenEventSourceOptions,
  type ReadyState,
} from '@oyenjs/eventsource';
import { InboundInitError } from './errors.js';
import { extractJsonToExtractHelper } from './extract-builder.js';
import { LazyPromise } from './lazy-promise.js';
import type {
  EmailExtractJSON,
  SMSExtractJSON,
} from './rest-client/extracts.js';
import {
  GetInboxEventSourceCommand,
  GetMessageCommand,
  ListInboxesCommand,
  OyenRestApiRestClient,
  type EmailInbox,
  type GetMessageCommandParams,
  type InboxEventSource,
  type Message,
  type SmsInbox,
} from './rest-client/main.js';

export type { ReadyState } from '@oyenjs/eventsource';

export type Brand<T, B extends 'sms' | 'email' | 'whatsapp'> = T & {
  readonly [K in B as `${K}`]?: never;
};

export type EmailEventMessageData = Brand<
  Pick<Message, 'teamId' | 'inboxId' | 'messageId'>,
  'email'
>;

export type SmsEventMessageData = Brand<
  Pick<Message, 'teamId' | 'inboxId' | 'messageId'>,
  'sms'
>;

type InboundMessageData = EmailEventMessageData | SmsEventMessageData;

type CommonOptions = {
  // /**
  //  * @description The oyen team id
  //  */
  // teamId: string;

  // /**
  //  * @description An oyen access token
  //  */
  // accessToken: string;

  /**
   * @description Logger function for debugging, compatible with console.log
   * @returns void
   */
  logger?: (...args: unknown[]) => void;

  /**
   * @description Options for the underlying event source. You probably don't
   * need this
   */
  eventSourceOptions?: OyenEventSourceOptions<InboundMessageData>['eventSourceOptions'];

  /**
   * @description  If set to `false`, the Inbound instance will not connect or
   * call the API until you listen for messages.
   */
  lazy?: boolean;

  fetch?: (url: string | URL, options?: RequestInit) => Promise<Response>;
  controller?: AbortController;
} & (
  | {
      client?: OyenRestApiRestClient;
    }
  | {
      accessToken: string;
      restClientConfig?: RestServiceClientConfig & {
        endpoint?: URL | string;
      };
    }
);

type EmailOptions = Brand<
  {
    teamId: string;
    emailAddress: string;
  } & CommonOptions,
  'email'
>;

type SmsOptions = Brand<
  {
    teamId: string;
    phoneNumber: string;
  } & CommonOptions,
  'sms'
>;

type EmailEventSourceOptions = Brand<
  {
    inbox: EmailInbox;
    es: InboxEventSource;
  } & CommonOptions,
  'email'
>;

type SmsEventSourceOptions = Brand<
  {
    inbox: SmsInbox;
    es: InboxEventSource;
  } & CommonOptions,
  'email'
>;

export type InboundOptions =
  | EmailOptions
  | EmailEventSourceOptions
  | SmsOptions
  | SmsEventSourceOptions;

function extractHandleAndDomain(email: string) {
  const [handle, domainName] = email.split('@');
  if (!handle || !domainName) {
    throw new InboundInitError('Invalid email').debug({ email });
  }
  return { handle, domainName };
}

function errToStr(err: unknown): string {
  if (err instanceof Error) {
    if ('cause' in err && err.cause) {
      return `${err.message} caused by ${errToStr(err.cause)}`;
    }
    if ('code' in err && err.code) {
      return `${err.message} (code ${err.code})`;
    }
    return err.message;
  }
  return String(err);
}

const kLog = Symbol('log');
const kWarn = Symbol('warn');
const kInitPromise = Symbol('init');
const kReadyState = Symbol('readyState');
const kAbortController = Symbol('controller');
const kConfig = Symbol('config');
const kClient = Symbol('client');

function inline<T>(fn: () => T): T {
  return fn();
}

export class Inbound<TOptions extends InboundOptions> {
  private readonly [kConfig]: TOptions & CommonOptions;

  private [kInitPromise]: LazyPromise<{
    es: OyenEventSource<
      TOptions extends EmailOptions | EmailEventSourceOptions
        ? EmailEventMessageData
        : TOptions extends SmsOptions | SmsEventSourceOptions
          ? SmsEventMessageData
          : never
    >;
  }>;

  private [kAbortController] = new AbortController();

  private [kClient]: OyenRestApiRestClient;

  private [kReadyState]: ReadyState = 'closed';

  constructor(config: TOptions) {
    this[kConfig] = config;

    this[kClient] = inline(() => {
      if ('client' in config) {
        return config.client;
      }

      if ('accessToken' in config) {
        const overrideConfig = config.restClientConfig;

        return new OyenRestApiRestClient(
          overrideConfig?.endpoint
            ? new URL(overrideConfig?.endpoint)
            : undefined,
          {
            ...overrideConfig,
            headers: {
              authorization: `Bearer ${config.accessToken}`,
              ...overrideConfig?.headers,
              'user-agent': [
                `${import.meta.env.PACKAGE_NAME}/${import.meta.env.PACKAGE_VERSION}`,
                overrideConfig?.headers?.['user-agent'],
              ]
                .join(' ')
                .trim(),
            },
          },
        );
      }

      throw new InboundInitError(
        'Invalid config. Needs one of accessToken or client',
      ).debug(config);
    });

    if ('es' in config) {
      this[kInitPromise] = LazyPromise.from(async () => ({
        es: await this.#initEs(config.es),
      }));
    } else {
      this[kInitPromise] = LazyPromise.from(() => this.#initEsViaApi(config));
    }

    if (!('lazy' in config) || !!config.lazy) {
      // calling catch here on a LazyPromise starts it all off
      this[kInitPromise].catch((err) => {
        this[kWarn]('error during init: %s', errToStr(err));
        this[kReadyState] = 'closed';
      });
    }
  }

  public async connect() {
    this[kLog]('awaiting connect...');
    await this.#init().then(({ es }) => es.connected);
    this[kLog]('connected');
  }

  public get readyState() {
    // stale while revalidate :grimace:
    this[kInitPromise].then(({ es }) => {
      this[kReadyState] = es.readyState;
    });
    return this[kReadyState];
  }

  private [kLog](arg: unknown, ...args: unknown[]) {
    this[kConfig].logger?.(
      `${new Date().toISOString()} [inbound] ${arg}`,
      ...args,
    );
  }

  private [kWarn](arg: unknown, ...args: unknown[]) {
    this[kLog](`WARN ${arg}`, ...args);
  }

  async #initEs(inboxEventSource: InboxEventSource) {
    this[kReadyState] = 'connecting';

    return new OyenEventSource<
      TOptions extends EmailEventSourceOptions | EmailOptions
        ? EmailEventMessageData
        : TOptions extends SmsEventSourceOptions | SmsOptions
          ? SmsEventMessageData
          : never
    >({
      logger: this[kConfig].logger,
      teamId: inboxEventSource.teamId,
      eventSourceId: inboxEventSource.eventSourceId,
      channels: [inboxEventSource.channel],
      endpoint: inboxEventSource.endpoint,
      accessToken: inboxEventSource.accessToken,
      ...(this[kConfig].eventSourceOptions && {
        eventSourceOptions: this[kConfig].eventSourceOptions,
      }),
    });
  }

  async #initEsViaApi<T extends EmailOptions | SmsOptions>(params: T) {
    this[kLog]('Listing inboxes...');

    // TODO: need to add a `GetInboxFromTeamCommand` to not only get the inbox
    // by domain, but on a specific team
    const inboxes = await this[kClient].json(
      new ListInboxesCommand({ teamId: params.teamId }),
      {
        signal: this[kAbortController].signal,
      },
    );

    this[kLog]('Inboxes found: %d', inboxes.length);

    const inbox =
      'emailAddress' in params
        ? inboxes.find((i): i is EmailInbox => {
            // TODO: absolutely no need to do this every loop iteration
            const { handle, domainName } = extractHandleAndDomain(
              params.emailAddress,
            );
            return (
              i.kind === 'email' &&
              i.handle === handle &&
              i.domain === domainName
            );
          })
        : inboxes.find(
            (i): i is SmsInbox =>
              i.kind === 'sms' && i.handle === params.phoneNumber,
          );

    if (!inbox) {
      throw new InboundInitError('Inbox not found').debug(params);
    }

    this[kLog]('Getting inbox event source for inbox "%s"', inbox.inboxId);

    const inboxEventSource = await this[kClient].json(
      new GetInboxEventSourceCommand({
        teamId: inbox.teamId,
        inboxId: inbox.inboxId,
      }),
    );

    return {
      es: await this.#initEs(inboxEventSource),
    };
  }

  async #init() {
    const result = await this[kInitPromise];
    this[kReadyState] = result.es.readyState;
    return result;
  }

  public async ready() {
    this[kLog]('checking for readiness...');
    const { es } = await this.#init();
    await es.connected;
    this[kLog]('ready. es is %s', es.readyState);
  }

  async #getMessage(params: GetMessageCommandParams) {
    const message = await this[kClient].json(new GetMessageCommand(params), {
      signal: this[kAbortController].signal,
    });

    this[kLog]('Message retrieved: %j', message);

    const fetch =
      'fetch' in this[kConfig] ? this[kConfig].fetch : globalThis.fetch;

    const url = new URL(message.url);
    const extractUrl = new URL(`${url.pathname}.json`, url);

    const res = await fetch(extractUrl, {
      headers: {
        accept: 'application/json',
      },
      signal: this[kAbortController].signal,
    });

    const extractJson = LazyPromise.from<
      TOptions extends Brand<TOptions, 'email'>
        ? EmailExtractJSON
        : SMSExtractJSON
    >(() => res.json());
    // allows calling multiple times without reading the response body twice,
    // or extracting in advance
    return LazyPromise.from(async () => {
      const extract = await extractJson;
      return extractJsonToExtractHelper(extract, message);
    });
  }

  public async once(
    eventNameOrOptions?: never | { eventName?: never; signal?: AbortSignal },
  ) {
    const resolvedOptions =
      typeof eventNameOrOptions === 'object'
        ? {
            eventName: eventNameOrOptions?.eventName,
            signal: eventNameOrOptions?.signal,
          }
        : {
            eventName: eventNameOrOptions,
          };

    const { es } = await this.#init();

    this[kLog]('waiting once event=%s', resolvedOptions.eventName);

    // eslint-disable-next-line no-restricted-syntax
    for await (const event of es.listen(resolvedOptions.eventName)) {
      this[kLog]('got event=%j', event);

      if (event !== null) {
        return this.#getMessage({
          teamId: event.d.teamId,
          inboxId: event.d.inboxId,
          messageId: event.d.messageId,
        });
      }
    }

    throw new InboundInitError('Event source closed unexpectedly');
  }

  public async *stream(eventName?: never) {
    const { es } = await this.#init();

    this[kLog]('streaming events eventName=%s', eventName);

    // eslint-disable-next-line no-restricted-syntax
    for await (const event of es.listen(eventName)) {
      this[kLog]('got event=%j', event);

      if (event) {
        yield this.#getMessage({
          teamId: event.d.teamId,
          inboxId: event.d.inboxId,
          messageId: event.d.messageId,
        });
      }
    }
  }

  public async close() {
    this[kLog]('closing...');
    this[kAbortController].abort();
    this[kAbortController] = new AbortController();
    this[kReadyState] = 'closed';

    // never throw during close
    try {
      const { es } = await this.#init();
      await es.close().then(() => this[kLog]('closed successfully'));
    } catch (err) {
      this[kWarn]('error during close: %s', errToStr(err));
    }
  }
}
