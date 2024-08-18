import type { EventMessage } from '@oyenjs/eventsource';
import type { Root } from 'hast';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { afterEach, beforeAll, describe, expect, test, vitest } from 'vitest';
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
    const mockEmailInboxId = 'ememememe';
    const mockChannel = `inbox:${mockEmailInboxId}`;
    const mockEmailMessageId = 'msgemememe';

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
      `/${mockEmailMessageId}`,
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
            inboxId: mockEmailInboxId,
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
        path: `/teams/${mockTeamId}/inboxes/${mockEmailInboxId}/eventsource`,
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
              inboxId: mockEmailInboxId,
              messageId: mockEmailMessageId,
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
        path: `${mockEmailMessageContentUrlPrefix.pathname}/email.json`,
      })
      .reply<Root>(
        200,
        {
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
        {
          headers: { 'content-type': 'text/json' },
        },
      );

    // message
    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes/${mockEmailInboxId}/messages/${mockEmailMessageId}`,
      })
      .reply<Message>(
        200,
        {
          teamId: mockTeamId,
          inboxId: mockEmailInboxId,
          messageId: mockEmailMessageId,
          url: mockEmailMessageContentUrlPrefix.toString(),
          createTime: new Date().toISOString(),
          rawSize: 3,
          sha256: 'd2b0f7f5c7c5f3d3d3',
        } satisfies Message,
        {
          headers: { 'content-type': 'application/json' },
        },
      );

    const inboundEmail = new Inbound({
      teamId: mockTeamId,
      accessToken: fakeInboundApiToken,
      email: `${handle}@${domainName}`,
      // eslint-disable-next-line no-console
      logger: console.log,
      restClientConfig: {
        logger: (msg, ...args) =>
          // eslint-disable-next-line no-console
          console.log(`${new Date().toISOString()} ${msg}`, ...args),
      },
    });

    const { source, extract } = await inboundEmail.once();

    expect(source).toMatchSnapshot();
    await expect(extract()).resolves.toMatchSnapshot();

    inboundEmail.close();
  });

  test.skip('SMS', async () => {
    const number = '1234567890';

    const mockSmsInboxId = 'smsmsmsmsms';
    const mockEventSourceId = 'eseseseses';
    const mockChannel = `inbox:${mockSmsInboxId}`;

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
            inboxId: mockSmsInboxId,
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

    const fakeEventStreamEndpointPath = `/e/${mockTeamId}/${mockEventSourceId}/event-stream?accessToken=${mockEventsAccessToken}&channels=${mockChannel}`;

    // event source
    mockApi
      .intercept({
        method: 'get',
        path: `/teams/${mockTeamId}/inboxes/${mockSmsInboxId}/eventsource`,
      })
      .reply<InboxEventSource>(
        200,
        {
          teamId: mockTeamId,
          createTime: new Date().toISOString(),
          accessToken: mockEventsAccessToken,
          channel: mockChannel,
          endpoint: new URL(
            fakeEventStreamEndpointPath,
            eventSourceEndpoint,
          ).toString(),
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
        path: fakeEventStreamEndpointPath,
      })
      .reply(
        200,
        [
          'id:0',
          `data:${JSON.stringify({
            ch: mockSmsInboxId,
            d: JSON.stringify({
              teamId: mockTeamId,
              inboxId: mockSmsInboxId,
              messageId: 'msgsms456',
            } satisfies SmsEventMessageData),
            enc: 'json',
            iat: new Date().toISOString(),
          } satisfies EventMessage<string>)}`,
          '',
          '',
        ].join('\n'),
        {
          headers: { 'content-type': 'text/event-stream' },
        },
      )
      .persist();

    const inboundSms = new Inbound({
      teamId: mockTeamId,
      accessToken: fakeInboundApiToken,
      sms: number,
      // eslint-disable-next-line no-console
      logger: console.log,
    });

    await expect(inboundSms.once()).resolves.toMatchSnapshot();

    await inboundSms.close();
  });
});
