import type { RestServiceClientConfig } from '@block65/rest-client';
import {
  OyenEventSource,
  type OyenEventSourceOptions,
} from '@oyenjs/eventsource';
import type { EmailExtract } from './email-types.js';
import { InboundInitError } from './errors.js';
import { LazyPromise } from './lazy-promise.js';
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
import type { SMSExtract } from './sms-types.js';

export type EmailEventMessageData = Pick<
  Message,
  'teamId' | 'inboxId' | 'messageId'
>;

export type SmsEventMessageData = Pick<
  Message,
  'teamId' | 'inboxId' | 'messageId'
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

type EmailOptions = {
  teamId: string;
  email: string;
} & CommonOptions;

type SmsOptions = {
  teamId: string;
  sms: string;
} & CommonOptions;

type EmailEventSourceOptions = {
  inbox: EmailInbox;
  es: InboxEventSource;
} & CommonOptions;

type SmsEventSourceOptions = {
  inbox: SmsInbox;
  es: InboxEventSource;
} & CommonOptions;

export type InboundOptions =
  | EmailOptions
  | SmsOptions
  | EmailEventSourceOptions
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
const kAbortController = Symbol('controller');
const kConfig = Symbol('config');
const kClient = Symbol('client');

function inline<T>(fn: () => T): T {
  return fn();
}

export class Inbound<TConfig extends InboundOptions> {
  private readonly [kConfig]: TConfig & CommonOptions;

  private [kInitPromise]: Promise<{
    inbox: EmailInbox | SmsInbox;
    es: OyenEventSource<
      TConfig extends EmailEventSourceOptions | EmailOptions
        ? EmailEventMessageData
        : TConfig extends SmsEventSourceOptions | SmsOptions
          ? SmsEventMessageData
          : never
    >;
  }>;

  private [kAbortController] = new AbortController();

  private [kClient]: OyenRestApiRestClient;

  constructor(config: TConfig) {
    this[kConfig] = config;

    this[kClient] = inline(() => {
      if ('client' in config) {
        return config.client;
      }

      if ('accessToken' in config) {
        const overrideConfig = config.restClientConfig;

        return new OyenRestApiRestClient({
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
        });
      }

      throw new InboundInitError(
        'Invalid config. Needs one of accessToken or client',
      ).debug(config);
    });

    this[kInitPromise] =
      'es' in config
        ? LazyPromise.from(async () => ({
            inbox: config.inbox,
            es: await this.#initEs(config.es),
          }))
        : LazyPromise.from(() => this.#initEsViaApi(config));

    if (!('lazy' in config) || !!config.lazy) {
      // calling catch here on a LazyPromise starts it all off
      this[kInitPromise].catch((err) => {
        this[kWarn]('error during connect: %s', errToStr(err));
      });
    }
  }

  public async connect() {
    this[kLog]('awaiting connect...');
    await this[kInitPromise].then(({ es }) => es.connected);
    this[kLog]('connected');
  }

  public get readyState() {
    return this[kInitPromise].then(({ es }) => es.readyState);
  }

  private [kLog](msg: string, ...args: unknown[]) {
    this[kConfig].logger?.(
      `${new Date().toISOString()} [inbound] ${msg}`,
      ...args,
    );
  }

  private [kWarn](msg: string, ...args: unknown[]) {
    this[kLog](`WARN ${msg}`, ...args);
  }

  async #initEs(inboxEventSource: InboxEventSource) {
    return new OyenEventSource<
      TConfig extends EmailEventSourceOptions | EmailOptions
        ? EmailEventMessageData
        : TConfig extends SmsEventSourceOptions | SmsOptions
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
      'email' in params
        ? inboxes.find((i): i is EmailInbox => {
            // TODO: absolutely no need to do this every loop iteration
            const { handle, domainName } = extractHandleAndDomain(params.email);
            return (
              i.kind === 'email' &&
              i.handle === handle &&
              i.domain === domainName
            );
          })
        : inboxes.find(
            (i): i is SmsInbox => i.kind === 'sms' && i.handle === params.sms,
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
      inbox,
      es: await this.#initEs(inboxEventSource),
    };
  }

  public async ready() {
    this[kLog]('Checking for readiness...');

    await this[kInitPromise].then(async ({ es }) => {
      this[kLog]('init resolved: es is %s', es.readyState);
      await es.connected;
      this[kLog]('es connected: es is %s', es.readyState);
    });

    this[kLog]('OK ready');
  }

  async #getMessage(params: GetMessageCommandParams) {
    const message = await this[kClient].json(new GetMessageCommand(params), {
      signal: this[kAbortController].signal,
    });

    this[kLog]('Message retrieved: %j', message);

    const { inbox } = await this[kInitPromise];

    const fetch =
      'fetch' in this[kConfig] ? this[kConfig].fetch : globalThis.fetch;

    const url = new URL(message.url);
    const extractUrl = new URL(`${url.pathname}/${inbox.kind}.json`, url);

    // this could be moved into the extract function if needed
    const res = await fetch(extractUrl, {
      headers: {
        accept: 'application/json',
      },
      signal: this[kAbortController].signal,
    });

    // allows extract to be called multiple times
    // without reading the response body twice
    const json = LazyPromise.from(() => res.json());

    return {
      source: message,
      extract: async (): Promise<
        TConfig extends EmailEventSourceOptions | EmailOptions
          ? EmailExtract
          : TConfig extends SmsEventSourceOptions | SmsOptions
            ? SMSExtract
            : never
      > => json,
    };
  }

  public async once(eventName?: never) {
    this[kLog]('once requested for eventName=%s', eventName || 'unspecified');
    const { es } = await this[kInitPromise];

    this[kLog]('waiting once event=%s', eventName);

    // eslint-disable-next-line no-restricted-syntax
    for await (const event of es.listen(eventName)) {
      this[kLog]('got event=%j', event);

      if (event) {
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
    this[kLog]('stream requested for eventName=%s', eventName || 'unspecified');

    const { es } = await this[kInitPromise];

    this[kLog]('streaming events=%s', eventName);

    // eslint-disable-next-line no-restricted-syntax
    for await (const event of es.listen(eventName)) {
      this[kLog]('got event=%j', event);

      if (event) {
        yield this.#getMessage({
          teamId: event.d.teamId,
          inboxId: event.d.inboxId,
          messageId: event.d.messageId,
        });
      } else {
        yield null;
      }
    }
  }

  public async close() {
    this[kLog]('closing...');
    this[kAbortController].abort();
    this[kAbortController] = new AbortController();

    // never throw during close
    try {
      const { es } = await this[kInitPromise];
      await es.close().then(() => this[kLog]('closed successfully'));
    } catch (err) {
      this[kWarn]('error closing: %s', errToStr(err));
    }
  }
}
