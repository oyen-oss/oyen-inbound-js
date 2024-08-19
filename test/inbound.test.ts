import type { EventMessage } from '@oyenjs/eventsource';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { afterEach, beforeAll, describe, expect, test, vitest } from 'vitest';
import type {
  EmailExtractJSON,
  SMSExtractJSON,
} from '../lib/rest-client/extracts.js';
import type {
  EmailInbox,
  InboxEventSource,
  Message,
  SmsInbox,
} from '../lib/rest-client/main.js';
import {
  Inbound,
  type EmailEventMessageData,
  type SmsEventMessageData,
} from '../src/main.js';
import { fakeInboundApiToken } from './credentials.js';

const fetchMock = new MockAgent();
setGlobalDispatcher(fetchMock);

beforeAll(() => {
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

afterEach(() => {
  fetchMock.assertNoPendingInterceptors();
});

const apiEndpoint = 'https://api.oyen.io';
const eventSourceEndpoint = 'https://events.oyen.io';
const userContentEndpoint = 'https://messages.oyenusercontent.com';

const mockApi = fetchMock.get(apiEndpoint);
const mockEvents = fetchMock.get(eventSourceEndpoint);

describe('Inbound', () => {
  const mockEventsAccessToken = 'e30.e30.';
  const mockTeamId = 'tetetete';

  vitest.setSystemTime(new Date('2021-01-01T00:00:00Z'));

  test('Email', async () => {
    const handle = 'test';
    const domainName = 'example.oyenmail.com';

    const mockEventSourceId = 'esesesese';
    const mockInboxId = 'ememememe';
    const mockChannel = `inbox:${mockInboxId}`;
    const mockMessageId = 'msgemememe';

    // event source
    const fakeEventStreamEndpoint = new URL(
      `/e/${mockTeamId}/${mockEventSourceId}/event-stream`,
      eventSourceEndpoint,
    );

    // channels and access token
    fakeEventStreamEndpoint.searchParams.set(
      'accessToken',
      mockEventsAccessToken,
    );
    fakeEventStreamEndpoint.searchParams.set('channels', mockChannel);

    const mockEmailMessageContentUrlPrefix = new URL(
      `/u/${mockTeamId}/${mockInboxId}/${mockMessageId}/1970/0/ffffffffffff/email`,
      userContentEndpoint,
    );
    const mockUserContent = fetchMock.get(
      mockEmailMessageContentUrlPrefix.origin,
    );

    // list inboxes
    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes`,
      })
      .reply<EmailInbox[]>(
        200,
        [
          {
            teamId: mockTeamId,
            inboxId: mockInboxId,
            kind: 'email',
            handle,
            domain: domainName,
            description: 'test only',
            createTime: new Date().toISOString(),
          } satisfies EmailInbox,
        ],
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    // event source
    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes/${mockInboxId}/eventsource`,
      })

      .reply<InboxEventSource>(
        200,
        {
          teamId: mockTeamId,
          createTime: new Date().toISOString(),
          accessToken: mockEventsAccessToken,
          channel: mockChannel,
          endpoint: fakeEventStreamEndpoint.toString(),
          eventSourceId: mockEventSourceId,
        } satisfies InboxEventSource,
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    // event stream
    mockEvents
      .intercept({
        path: fakeEventStreamEndpoint.pathname,
        query: Object.fromEntries(
          fakeEventStreamEndpoint.searchParams.entries(),
        ),
      })
      .reply<EventMessage<string>>(
        200,
        [
          'id:0',
          `data:${JSON.stringify({
            ch: mockChannel,
            d: JSON.stringify({
              teamId: mockTeamId,
              inboxId: mockInboxId,
              messageId: mockMessageId,
            } satisfies EmailEventMessageData),
            enc: 'json',
            iat: new Date().toISOString(),
          } satisfies EventMessage<string>)}`,
          '',
          '',
        ].join('\n'),
        {
          headers: {
            'content-type': 'text/event-stream',
          },
        },
      );

    // message content
    mockUserContent
      .intercept({
        path: `${mockEmailMessageContentUrlPrefix.pathname}.json`,
      })
      .reply<EmailExtractJSON>(
        200,
        {
          kind: 'email',
          headers: {
            raw: {},
          },
          html: {
            raw: '<p>Hello, world!</p>',
            json: {
              type: 'root',
              children: [
                {
                  type: 'element',
                  tagName: 'p',
                  properties: {},
                  children: [
                    {
                      type: 'text',
                      value: 'Hello, world!',
                    },
                  ],
                },
              ],
            },
          },
        } satisfies EmailExtractJSON,
        {
          headers: { 'content-type': 'text/json' },
        },
      );

    // message
    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes/${mockInboxId}/messages/${mockMessageId}`,
      })
      .reply<Message>(
        200,
        {
          teamId: mockTeamId,
          inboxId: mockInboxId,
          messageId: mockMessageId,
          kind: 'email',
          url: mockEmailMessageContentUrlPrefix.toString(),
          createTime: new Date().toISOString(),
          rawSize: 3,
          sha256: 'd2b0f7f5c7c5f3d3d3',
        } satisfies Message,
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    const inbound = new Inbound({
      teamId: mockTeamId,
      accessToken: fakeInboundApiToken,
      emailAddress: `${handle}@${domainName}`,
      // eslint-disable-next-line no-console
      logger: console.log,
      restClientConfig: {
        logger: (msg, ...args) =>
          // eslint-disable-next-line no-console
          console.log(`${new Date().toISOString()} ${msg}`, ...args),
      },
    });

    const extracted = await inbound.once();
    await expect(extracted).toMatchSnapshot();

    expect(extracted.html?.document.select('p')).toMatchInlineSnapshot(`
      {
        "children": [
          {
            "type": "text",
            "value": "Hello, world!",
          },
        ],
        "properties": {},
        "tagName": "p",
        "type": "element",
      }
    `);

    await inbound.close();
  });

  test('SMS', async () => {
    const number = '1234567890';

    const mockInboxId = 'smsibxsmsibxsmsibxsmsibx';
    const mockEventSourceId = 'smsesesesesese';
    const mockChannel = `inbox:${mockInboxId}`;
    const mockMessageId = 'smsmsmsmsmsmsg';
    // list inboxes
    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes`,
      })
      .reply<SmsInbox[]>(
        200,
        [
          {
            teamId: mockTeamId,
            inboxId: mockInboxId,
            kind: 'sms',
            handle: number,
            description: 'test only',
            createTime: new Date().toISOString(),
          } satisfies SmsInbox,
        ],
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    // event source
    const fakeEventStreamEndpoint = new URL(
      `/e/${mockTeamId}/${mockEventSourceId}/event-stream`,
      eventSourceEndpoint,
    );

    // channels and access token
    fakeEventStreamEndpoint.searchParams.set(
      'accessToken',
      mockEventsAccessToken,
    );
    fakeEventStreamEndpoint.searchParams.set('channels', mockChannel);

    const mockMessageContentUrlPrefix = new URL(
      `/u/${mockTeamId}/${mockInboxId}/${mockMessageId}/1970/0/ffffffffffff/sms`,
      userContentEndpoint,
    );

    // event source
    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes/${mockInboxId}/eventsource`,
      })
      .reply<InboxEventSource>(
        200,
        {
          teamId: mockTeamId,
          createTime: new Date().toISOString(),
          accessToken: mockEventsAccessToken,
          channel: mockChannel,
          endpoint: fakeEventStreamEndpoint.toString(),
          eventSourceId: mockEventSourceId,
        } satisfies InboxEventSource,
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    // event stream
    mockEvents
      .intercept({
        method: 'get',
        path: fakeEventStreamEndpoint.pathname,
        query: Object.fromEntries(
          fakeEventStreamEndpoint.searchParams.entries(),
        ),
      })
      .reply(
        200,
        [
          'id:0',
          `data:${JSON.stringify({
            ch: mockInboxId,
            d: JSON.stringify({
              teamId: mockTeamId,
              inboxId: mockInboxId,
              messageId: mockMessageId,
            } satisfies SmsEventMessageData),
            enc: 'json',
            iat: new Date().toISOString(),
          } satisfies EventMessage<string>)}`,
          '\n',
        ].join('\n'),
        {
          headers: { 'content-type': 'text/event-stream' },
        },
      )
      .persist();

    const mockUserContent = fetchMock.get(mockMessageContentUrlPrefix.origin);

    // message content
    mockUserContent
      .intercept({
        path: `${mockMessageContentUrlPrefix.pathname}.json`,
      })
      .reply<SMSExtractJSON>(
        200,
        {
          kind: 'sms',
          to: {
            countryCode: 'US',
            idd: '1',
            localNumber: '1234567890',
            raw: '+11234567890',
          },
          from: {
            countryCode: 'US',
            idd: '1',
            localNumber: '1234567890',
            raw: '+11234567890',
          },
          parts: 1,
          text: {
            raw: 'Hello, world!',
          },
        } satisfies SMSExtractJSON,
        {
          headers: { 'content-type': 'text/json' },
        },
      );

    // message
    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes/${mockInboxId}/messages/${mockMessageId}`,
      })
      .reply<Message>(
        200,
        {
          kind: 'sms',
          teamId: mockTeamId,
          inboxId: mockInboxId,
          messageId: mockMessageId,
          url: mockMessageContentUrlPrefix.toString(),
          createTime: new Date().toISOString(),
          rawSize: 3,
          sha256: 'ffffffffffff',
        } satisfies Message,
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    const inbound = new Inbound({
      teamId: mockTeamId,
      accessToken: fakeInboundApiToken,
      phoneNumber: number,
      // eslint-disable-next-line no-console
      logger: console.log,
      restClientConfig: {
        logger: (msg, ...args) =>
          // eslint-disable-next-line no-console
          console.log(`${new Date().toISOString()} ${msg}`, ...args),
      },
    });

    const extracted = await inbound.once();
    await expect(extracted).toMatchSnapshot();

    inbound.close();
  }, 30000);
});
